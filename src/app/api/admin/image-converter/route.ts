import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { randomUUID } from "crypto"
import sharp from "sharp"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const TARGET_FORMATS = ["webp", "jpeg", "png", "avif"] as const
type TargetFormat = (typeof TARGET_FORMATS)[number]

const EXT: Record<TargetFormat, string> = {
  webp: "webp",
  jpeg: "jpg",
  png: "png",
  avif: "avif",
}

// POST /api/admin/image-converter - 이미지 포맷/품질/크기 변환 (관리자)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 })
    }

    const formData = await request.formData()
    const files = formData.getAll("files") as File[]
    const format = (formData.get("format") as string) || "webp"
    const quality = Math.min(100, Math.max(1, parseInt((formData.get("quality") as string) || "80", 10)))
    const maxWidthRaw = formData.get("maxWidth") as string | null
    const maxWidth = maxWidthRaw ? parseInt(maxWidthRaw, 10) : null

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "이미지를 선택해주세요." }, { status: 400 })
    }

    if (!TARGET_FORMATS.includes(format as TargetFormat)) {
      return NextResponse.json({ error: "지원하지 않는 변환 형식입니다." }, { status: 400 })
    }
    const targetFormat = format as TargetFormat

    // 출력 디렉토리: public/uploads/converted/YYYY-MM
    const now = new Date()
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
    const outDir = path.join(process.cwd(), "public", "uploads", "converted", yearMonth)
    if (!existsSync(outDir)) {
      await mkdir(outDir, { recursive: true })
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif", "image/gif", "image/tiff"]
    const results = []

    for (const file of files) {
      if (file.size > 20 * 1024 * 1024) {
        return NextResponse.json(
          { error: `파일 크기는 20MB 이하여야 합니다: ${file.name}` },
          { status: 400 }
        )
      }
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `지원하지 않는 이미지 형식입니다: ${file.name}` },
          { status: 400 }
        )
      }

      const inputBuffer = Buffer.from(await file.arrayBuffer())

      let pipeline = sharp(inputBuffer, { failOn: "none" }).rotate() // EXIF 회전 보정
      const meta = await sharp(inputBuffer).metadata()

      if (maxWidth && meta.width && meta.width > maxWidth) {
        pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true })
      }

      switch (targetFormat) {
        case "webp":
          pipeline = pipeline.webp({ quality })
          break
        case "jpeg":
          pipeline = pipeline.jpeg({ quality, mozjpeg: true })
          break
        case "png":
          pipeline = pipeline.png({ quality, compressionLevel: 9 })
          break
        case "avif":
          pipeline = pipeline.avif({ quality })
          break
      }

      const outputBuffer = await pipeline.toBuffer()
      const outMeta = await sharp(outputBuffer).metadata()

      const baseName = path
        .parse(file.name)
        .name.replace(/[^a-zA-Z0-9가-힣_-]/g, "_")
        .slice(0, 40)
      const fileName = `${baseName || "image"}-${randomUUID().slice(0, 8)}.${EXT[targetFormat]}`
      await writeFile(path.join(outDir, fileName), outputBuffer)

      const webPath = `/uploads/converted/${yearMonth}/${fileName}`
      results.push({
        originalName: file.name,
        url: webPath,
        format: targetFormat,
        originalSize: file.size,
        convertedSize: outputBuffer.length,
        savedPercent:
          file.size > 0 ? Math.round((1 - outputBuffer.length / file.size) * 100) : 0,
        width: outMeta.width ?? null,
        height: outMeta.height ?? null,
      })
    }

    return NextResponse.json({ results }, { status: 200 })
  } catch (error) {
    console.error("Image conversion error:", error)
    return NextResponse.json(
      { error: "이미지 변환 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
