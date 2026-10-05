import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { promises as fs } from "fs"
import path from "path"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

// scripts/disk-health.sh 가 호스트에서 root cron 으로 기록하는 파일.
// 컨테이너에는 SMART 를 읽을 권한이 없으므로 앱은 결과 파일만 읽는다.
const LOG_DIR = path.join(process.cwd(), "logs")
const SNAPSHOT_FILE = path.join(LOG_DIR, "disk-health.json")
const HISTORY_FILE = path.join(LOG_DIR, "disk-health-history.jsonl")

// 수집 주기는 1시간. 3시간 넘게 갱신이 없으면 수집이 멈춘 것으로 본다.
const STALE_AFTER_MS = 3 * 60 * 60 * 1000
// NVMe data unit = 512바이트 × 1000
const BYTES_PER_DATA_UNIT = 512_000
const TREND_DAYS = 30
const DAY_MS = 24 * 60 * 60 * 1000

type Level = "ok" | "warn" | "critical"

interface Snapshot {
  collectedAt: string
  device: string
  model: string | null
  firmware: string | null
  capacityBytes: number | null
  smartPassed: boolean | null
  criticalWarning: number
  percentageUsed: number
  availableSpare: number
  availableSpareThreshold: number
  dataUnitsWritten: number
  dataUnitsRead: number
  mediaErrors: number
  errorLogEntries: number
  temperature: number
  powerOnHours: number
  powerCycles: number
  unsafeShutdowns: number
  filesystem: {
    mount: string
    totalBytes: number
    usedBytes: number
    availBytes: number
  }
}

interface HistoryEntry {
  date: string
  percentageUsed: number
  dataUnitsWritten: number
  usedBytes: number
}

async function readHistory(): Promise<HistoryEntry[]> {
  try {
    const raw = await fs.readFile(HISTORY_FILE, "utf-8")
    return raw
      .split("\n")
      .filter(Boolean)
      .flatMap((line) => {
        try {
          return [JSON.parse(line) as HistoryEntry]
        } catch {
          return []
        }
      })
  } catch {
    return []
  }
}

function evaluate(s: Snapshot, usedPercent: number, stale: boolean) {
  const issues: { level: Level; message: string }[] = []

  if (s.criticalWarning !== 0 || s.smartPassed === false) {
    issues.push({ level: "critical", message: "SMART 치명 경고가 감지되었습니다. 즉시 백업 후 교체를 검토하세요." })
  }
  if (s.percentageUsed >= 90) {
    issues.push({ level: "critical", message: `수명 소모율이 ${s.percentageUsed}%입니다. 교체가 필요합니다.` })
  } else if (s.percentageUsed >= 80) {
    issues.push({ level: "warn", message: `수명 소모율이 ${s.percentageUsed}%입니다. 교체를 준비하세요.` })
  }
  if (s.availableSpare <= s.availableSpareThreshold) {
    issues.push({ level: "critical", message: `예비 블록이 ${s.availableSpare}%로 임계치(${s.availableSpareThreshold}%) 이하입니다.` })
  } else if (s.availableSpare <= s.availableSpareThreshold + 10) {
    issues.push({ level: "warn", message: `예비 블록이 ${s.availableSpare}%로 임계치(${s.availableSpareThreshold}%)에 근접했습니다.` })
  }
  if (s.mediaErrors > 0) {
    issues.push({ level: "warn", message: `미디어 오류가 ${s.mediaErrors}건 기록되었습니다.` })
  }
  if (s.temperature >= 70) {
    issues.push({ level: "warn", message: `디스크 온도가 ${s.temperature}℃입니다.` })
  }
  if (usedPercent >= 95) {
    issues.push({ level: "critical", message: `디스크 용량을 ${usedPercent.toFixed(0)}% 사용 중입니다.` })
  } else if (usedPercent >= 85) {
    issues.push({ level: "warn", message: `디스크 용량을 ${usedPercent.toFixed(0)}% 사용 중입니다.` })
  }
  if (stale) {
    issues.push({ level: "warn", message: "상태 수집이 멈췄습니다. 서버의 disk-health cron 을 확인하세요." })
  }

  const level: Level = issues.some((i) => i.level === "critical")
    ? "critical"
    : issues.length > 0
      ? "warn"
      : "ok"

  return { level, issues }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let snapshot: Snapshot
    try {
      snapshot = JSON.parse(await fs.readFile(SNAPSHOT_FILE, "utf-8"))
    } catch {
      // 수집 스크립트가 아직 한 번도 돌지 않은 상태
      return NextResponse.json({ available: false })
    }

    const fsInfo = snapshot.filesystem
    const usedPercent = (fsInfo.usedBytes / (fsInfo.usedBytes + fsInfo.availBytes)) * 100
    const stale = Date.now() - new Date(snapshot.collectedAt).getTime() > STALE_AFTER_MS

    // 서버는 상시 가동이므로 가동 시간 대비 소모율로 잔여 수명을 어림한다.
    const estimatedRemainingDays =
      snapshot.percentageUsed > 0 && snapshot.percentageUsed < 100
        ? Math.round(
            (snapshot.powerOnHours * (100 - snapshot.percentageUsed)) / snapshot.percentageUsed / 24
          )
        : null

    // 히스토리가 이틀치 이상 쌓이면 최근 추세를 계산한다.
    const history = (await readHistory()).slice(-TREND_DAYS)
    let dailyWrittenBytes: number | null = null
    let daysUntilFull: number | null = null
    let trendDays = 0
    if (history.length >= 2) {
      const first = history[0]
      const last = history[history.length - 1]
      trendDays = Math.round(
        (new Date(last.date).getTime() - new Date(first.date).getTime()) / DAY_MS
      )
      if (trendDays > 0) {
        dailyWrittenBytes =
          ((last.dataUnitsWritten - first.dataUnitsWritten) * BYTES_PER_DATA_UNIT) / trendDays
        const dailyGrowth = (last.usedBytes - first.usedBytes) / trendDays
        if (dailyGrowth > 0) {
          daysUntilFull = Math.round(fsInfo.availBytes / dailyGrowth)
        }
      }
    }

    return NextResponse.json({
      available: true,
      stale,
      ...evaluate(snapshot, usedPercent, stale),
      collectedAt: snapshot.collectedAt,
      device: snapshot.device,
      model: snapshot.model,
      capacityBytes: snapshot.capacityBytes,
      wear: {
        percentageUsed: snapshot.percentageUsed,
        availableSpare: snapshot.availableSpare,
        availableSpareThreshold: snapshot.availableSpareThreshold,
        writtenBytes: snapshot.dataUnitsWritten * BYTES_PER_DATA_UNIT,
        mediaErrors: snapshot.mediaErrors,
        temperature: snapshot.temperature,
        powerOnHours: snapshot.powerOnHours,
        unsafeShutdowns: snapshot.unsafeShutdowns,
        estimatedRemainingDays,
      },
      usage: {
        mount: fsInfo.mount,
        totalBytes: fsInfo.totalBytes,
        usedBytes: fsInfo.usedBytes,
        availBytes: fsInfo.availBytes,
        usedPercent,
      },
      trend: {
        days: trendDays,
        dailyWrittenBytes,
        daysUntilFull,
      },
    })
  } catch (error) {
    console.error("Failed to read disk health:", error)
    return NextResponse.json({ error: "Failed to read disk health" }, { status: 500 })
  }
}
