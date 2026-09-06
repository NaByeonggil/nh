import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import { MAX_WIDTH, processUploadedImage } from "@/lib/image-processing"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json(
        { error: "파일이 없습니다." },
        { status: 400 }
      )
    }

    // 파일 유효성 검사
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "지원하지 않는 파일 형식입니다. (JPG, PNG, WebP, GIF만 가능)" },
        { status: 400 }
      )
    }

    // 파일 크기 제한 (10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "파일 크기는 10MB 이하여야 합니다." },
        { status: 400 }
      )
    }

    // 업로드 디렉토리 생성
    const uploadDir = join(process.cwd(), "public", "uploads", "hero-images")
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // 리사이즈 + WebP 재인코딩 (원본 그대로 저장하면 히어로가 수 MB 가 된다)
    const bytes = await file.arrayBuffer()
    const processed = await processUploadedImage(Buffer.from(bytes), {
      maxWidth: MAX_WIDTH.hero,
      originalName: file.name,
      mimeType: file.type,
    })

    const timestamp = Date.now()
    const filename = `hero_${timestamp}.${processed.ext}`
    const filepath = join(uploadDir, filename)

    // 파일 저장
    await writeFile(filepath, processed.buffer)

    // 웹에서 접근 가능한 URL 생성
    const imageUrl = `/uploads/hero-images/${filename}`

    return NextResponse.json({
      success: true,
      imageUrl,
      filename,
      originalName: file.name,
      size: processed.size,
      originalSize: processed.originalSize,
      optimized: processed.converted,
      width: processed.width,
      height: processed.height,
      type: processed.converted ? "image/webp" : file.type
    })

  } catch (error) {
    console.error("File upload error:", error)
    return NextResponse.json(
      { error: "파일 업로드 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}