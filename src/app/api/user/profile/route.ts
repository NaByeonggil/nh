import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      )
    }

    // 사용자 프로필 조회
    const profile = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isExpert: true,
        createdAt: true,
        image: true,
      }
    })

    if (!profile) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    // 활동 통계 조회
    const [totalOrders, totalInquiries, totalComments] = await Promise.all([
      db.order.count({
        where: { userId: session.user.id }
      }),
      db.inquiry.count({
        where: { authorId: session.user.id }
      }),
      db.comment.count({
        where: { authorId: session.user.id }
      })
    ])

    const stats = {
      totalOrders,
      totalInquiries,
      totalComments,
    }

    return NextResponse.json({
      profile,
      stats,
    })

  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json(
      { error: "프로필 정보를 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, phone } = body

    // 입력 검증
    if (name && typeof name !== "string") {
      return NextResponse.json(
        { error: "이름은 문자열이어야 합니다." },
        { status: 400 }
      )
    }

    if (phone && typeof phone !== "string") {
      return NextResponse.json(
        { error: "전화번호는 문자열이어야 합니다." },
        { status: 400 }
      )
    }

    // 전화번호 형식 검증 (선택적)
    if (phone && phone.trim() && !/^[0-9-+\s()]*$/.test(phone.trim())) {
      return NextResponse.json(
        { error: "올바른 전화번호 형식이 아닙니다." },
        { status: 400 }
      )
    }

    // 프로필 업데이트
    const updatedProfile = await db.user.update({
      where: { id: session.user.id },
      data: {
        ...(name !== undefined && { name: name.trim() || null }),
        ...(phone !== undefined && { phone: phone.trim() || null }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isExpert: true,
        createdAt: true,
        image: true,
      }
    })

    return NextResponse.json(updatedProfile)

  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json(
      { error: "프로필 업데이트 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}