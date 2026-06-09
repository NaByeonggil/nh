// 동시 실행 제한용 세마포어 큐 (인메모리, 서버 프로세스 단위)
//
// 변환 작업(sharp/ffmpeg)은 CPU를 많이 쓰므로 동시 실행 수를 제한한다.
// - max: 동시에 실행 가능한 작업 수
// - maxQueue: 대기열 최대 길이. 초과 시 QUEUE_FULL 에러 → 라우트에서 503 반환
//
// Next.js standalone은 단일 노드 프로세스로 동작하므로 모듈 싱글턴 상태가 유지된다.
// (수평 확장 시에는 외부 큐가 필요하지만 현재 단일 컨테이너 구성에 충분)

export class QueueFullError extends Error {
  constructor() {
    super("QUEUE_FULL")
    this.name = "QueueFullError"
  }
}

export class Semaphore {
  private active = 0
  private waiters: Array<() => void> = []

  constructor(
    private readonly max: number,
    private readonly maxQueue: number = 50
  ) {}

  private async acquire(): Promise<void> {
    if (this.active < this.max) {
      this.active++
      return
    }
    if (this.waiters.length >= this.maxQueue) {
      throw new QueueFullError()
    }
    await new Promise<void>((resolve) => this.waiters.push(resolve))
    this.active++
  }

  private release(): void {
    this.active--
    const next = this.waiters.shift()
    if (next) next()
  }

  // 작업을 동시 실행 한도 내에서 실행. 한도 초과 시 대기, 대기열도 가득 차면 QueueFullError.
  async run<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire()
    try {
      return await fn()
    } finally {
      this.release()
    }
  }

  get stats() {
    return { active: this.active, waiting: this.waiters.length, max: this.max }
  }
}

const num = (v: string | undefined, def: number) => {
  const n = parseInt(v || "", 10)
  return Number.isFinite(n) && n > 0 ? n : def
}

// 이미지(sharp): 빠르므로 동시 3
export const imageQueue = new Semaphore(
  num(process.env.IMAGE_CONVERT_CONCURRENCY, 3),
  num(process.env.IMAGE_CONVERT_MAX_QUEUE, 30)
)

// 동영상/GIF(ffmpeg): CPU 무거우므로 동시 2 (내부적으로 멀티스레드 사용)
export const ffmpegQueue = new Semaphore(
  num(process.env.FFMPEG_CONVERT_CONCURRENCY, 2),
  num(process.env.FFMPEG_CONVERT_MAX_QUEUE, 20)
)
