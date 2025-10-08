import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params
    const imagePath = path.join("/")
    
    // 보안: 경로 탐색 공격 방지
    if (imagePath.includes("..") || imagePath.includes("~")) {
      return new NextResponse("Invalid path", { status: 400 })
    }

    // 이미지 파일 경로 생성
    const filePath = join(process.cwd(), "public/uploads", imagePath)
    
    // 파일 존재 확인
    if (!existsSync(filePath)) {
      return new NextResponse("Image not found", { status: 404 })
    }

    // 파일 읽기
    const file = await readFile(filePath)
    
    // MIME 타입 결정
    const ext = imagePath.split(".").pop()?.toLowerCase()
    const mimeTypes: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      svg: "image/svg+xml"
    }
    
    const mimeType = mimeTypes[ext || ""] || "application/octet-stream"
    
    // 이미지 반환 - Buffer를 Uint8Array로 변환
    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    })
  } catch (error) {
    console.error("Image serving error:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}