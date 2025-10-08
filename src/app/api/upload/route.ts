import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { generateFileName, isImageFile } from "@/lib/helpers"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "파일을 선택해주세요." },
        { status: 400 }
      )
    }

    // 업로드 디렉토리 설정
    const uploadDir = path.join(process.cwd(), "public", "uploads")
    
    // 년월별 폴더 생성
    const now = new Date()
    const yearMonth = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`
    const fullUploadDir = path.join(uploadDir, yearMonth)

    // 디렉토리가 없으면 생성
    if (!existsSync(fullUploadDir)) {
      await mkdir(fullUploadDir, { recursive: true })
    }

    const uploadedFiles = []

    for (const file of files) {
      // 파일 크기 제한 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: `파일 크기는 10MB 이하여야 합니다: ${file.name}` },
          { status: 400 }
        )
      }

      // 파일 형식 제한
      const allowedTypes = [
        "image/jpeg",
        "image/jpg", 
        "image/png",
        "image/webp",
        "application/pdf"
      ]
      
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `지원하지 않는 파일 형식입니다: ${file.name}` },
          { status: 400 }
        )
      }

      // 파일명 생성
      const fileName = generateFileName(file.name)
      const filePath = path.join(fullUploadDir, fileName)

      // 파일 저장
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)

      // 웹 접근 가능한 경로
      const webPath = `/uploads/${yearMonth}/${fileName}`

      uploadedFiles.push({
        originalName: file.name,
        fileName: fileName,
        filePath: webPath,
        fileSize: file.size,
        fileType: file.type,
        isImage: isImageFile(file.name),
      })
    }

    return NextResponse.json({
      message: "파일 업로드가 완료되었습니다.",
      files: uploadedFiles
    })

  } catch (error) {
    console.error("File upload error:", error)
    return NextResponse.json(
      { error: "파일 업로드 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}