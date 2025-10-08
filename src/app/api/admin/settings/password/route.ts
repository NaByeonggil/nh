import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"
import bcrypt from "bcryptjs"

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "현재 비밀번호는 필수입니다"),
  newPassword: z.string().min(6, "새 비밀번호는 최소 6자 이상이어야 합니다")
})

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "인증이 필요합니다" },
        { status: 401 }
      )
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const validatedData = changePasswordSchema.parse(body)

    // 현재 사용자 정보 조회
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, password: true }
    })

    if (!currentUser || !currentUser.password) {
      return NextResponse.json(
        { error: "사용자 정보를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // 현재 비밀번호 확인
    const isCurrentPasswordValid = await bcrypt.compare(
      validatedData.currentPassword,
      currentUser.password
    )

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: "현재 비밀번호가 올바르지 않습니다" },
        { status: 400 }
      )
    }

    // 새 비밀번호 해시
    const hashedNewPassword = await bcrypt.hash(validatedData.newPassword, 12)

    // 비밀번호 업데이트
    await db.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedNewPassword,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      message: "비밀번호가 성공적으로 변경되었습니다"
    })

  } catch (error) {
    console.error("Password change error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}