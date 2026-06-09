import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir, readFile, unlink, stat } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import os from "os"
import { randomUUID } from "crypto"
import { spawn } from "child_process"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ffmpegQueue, QueueFullError } from "@/lib/concurrency-queue"

// Node.js 런타임 필수 (child_process/fs 사용)
export const runtime = "nodejs"
export const maxDuration = 120

// ffmpeg 실행 (인자 배열 → 셸 인젝션 없음)
function runFfmpeg(args: string[], timeoutMs = 110_000): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn("ffmpeg", args, { stdio: ["ignore", "ignore", "pipe"] })
    let stderr = ""
    const timer = setTimeout(() => {
      proc.kill("SIGKILL")
      reject(new Error("변환 시간이 초과되었습니다."))
    }, timeoutMs)

    proc.stderr.on("data", (d) => {
      stderr += d.toString()
      if (stderr.length > 8000) stderr = stderr.slice(-8000)
    })
    proc.on("error", (e) => {
      clearTimeout(timer)
      reject(e)
    })
    proc.on("close", (code) => {
      clearTimeout(timer)
      if (code === 0) resolve()
      else reject(new Error(`ffmpeg 종료 코드 ${code}: ${stderr.slice(-300)}`))
    })
  })
}

// POST /api/admin/gif-converter
export async function POST(request: NextRequest) {
  let tmpInput: string | null = null
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const mode = (formData.get("mode") as string) || "to-gif" // to-gif | to-mp4
    const fps = Math.min(30, Math.max(1, parseInt((formData.get("fps") as string) || "12", 10)))
    const width = Math.min(1280, Math.max(80, parseInt((formData.get("width") as string) || "480", 10)))
    const startTime = (formData.get("startTime") as string) || "" // 초 또는 hh:mm:ss
    const duration = (formData.get("duration") as string) || "" // 초

    if (!file) {
      return NextResponse.json({ error: "파일을 선택해주세요." }, { status: 400 })
    }
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "파일 크기는 50MB 이하여야 합니다." }, { status: 400 })
    }

    const toGif = mode !== "to-mp4"
    const videoTypes = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo", "video/x-matroska", "image/gif"]
    if (toGif && !videoTypes.includes(file.type)) {
      return NextResponse.json({ error: "동영상(mp4/webm/mov 등) 또는 GIF만 변환할 수 있습니다." }, { status: 400 })
    }
    if (!toGif && file.type !== "image/gif") {
      return NextResponse.json({ error: "GIF → MP4 변환은 GIF 파일만 가능합니다." }, { status: 400 })
    }

    // 입력을 임시 파일로 저장
    const inputExt = path.extname(file.name) || (toGif ? ".mp4" : ".gif")
    tmpInput = path.join(os.tmpdir(), `gifconv-${randomUUID()}${inputExt}`)
    await writeFile(tmpInput, Buffer.from(await file.arrayBuffer()))

    // 출력 경로
    const now = new Date()
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
    const outDir = path.join(process.cwd(), "public", "uploads", "gifs", yearMonth)
    if (!existsSync(outDir)) await mkdir(outDir, { recursive: true })

    const baseName =
      path.parse(file.name).name.replace(/[^a-zA-Z0-9가-힣_-]/g, "_").slice(0, 40) || "clip"
    const outExt = toGif ? "gif" : "mp4"
    const outName = `${baseName}-${randomUUID().slice(0, 8)}.${outExt}`
    const outPath = path.join(outDir, outName)

    // ffmpeg 인자 구성
    let args: string[]
    if (toGif) {
      args = []
      if (startTime) args.push("-ss", startTime)
      if (duration) args.push("-t", duration)
      args.push("-i", tmpInput)
      // 고품질 GIF: palettegen/paletteuse 단일 패스
      args.push(
        "-vf",
        `fps=${fps},scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen=stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=5`
      )
      args.push("-loop", "0", "-y", outPath)
    } else {
      // GIF → MP4 (yuv420p, 짝수 해상도, 웹 스트리밍 최적화)
      args = [
        "-i",
        tmpInput,
        "-movflags",
        "+faststart",
        "-pix_fmt",
        "yuv420p",
        "-vf",
        "scale=trunc(iw/2)*2:trunc(ih/2)*2",
        "-y",
        outPath,
      ]
    }

    // ffmpeg 실행은 동시 실행 제한 큐 안에서 수행
    await ffmpegQueue.run(() => runFfmpeg(args))

    const outStat = await stat(outPath)
    return NextResponse.json({
      originalName: file.name,
      url: `/uploads/gifs/${yearMonth}/${outName}`,
      mode: toGif ? "to-gif" : "to-mp4",
      outputType: toGif ? "image/gif" : "video/mp4",
      originalSize: file.size,
      convertedSize: outStat.size,
      savedPercent: file.size > 0 ? Math.round((1 - outStat.size / file.size) * 100) : 0,
    })
  } catch (error) {
    if (error instanceof QueueFullError) {
      return NextResponse.json(
        { error: "변환 요청이 많습니다. 잠시 후 다시 시도해주세요." },
        { status: 503 }
      )
    }
    console.error("GIF conversion error:", error)
    const msg = error instanceof Error ? error.message : "변환 중 오류가 발생했습니다."
    return NextResponse.json({ error: msg }, { status: 500 })
  } finally {
    if (tmpInput) {
      await unlink(tmpInput).catch(() => {})
    }
  }
}
