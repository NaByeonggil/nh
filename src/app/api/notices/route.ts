import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { noticeSchema } from "@/lib/validations"
import { z } from "zod"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const popupOnly = searchParams.get("popup") === "true"
    const admin = searchParams.get("admin") === "true"

    // 관리자 목록: 미발행 포함 전체 조회 (ADMIN 권한 필요)
    if (admin) {
      const session = await getServerSession(authOptions)
      if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 })
      }
      const notices = await db.notice.findMany({
        orderBy: [{ important: "desc" }, { createdAt: "desc" }],
      })
      return NextResponse.json(notices)
    }

    if (popupOnly) {
      const now = new Date()
      const notices = await db.notice.findMany({
        where: {
          published: true,
          isPopup: true,
          AND: [
            {
              OR: [{ popupStartDate: null }, { popupStartDate: { lte: now } }],
            },
            {
              OR: [{ popupEndDate: null }, { popupEndDate: { gte: now } }],
            },
          ],
        },
        orderBy: [{ important: "desc" }, { createdAt: "desc" }],
      })
      return NextResponse.json(notices)
    }

    const notices = await db.notice.findMany({
      where: { published: true },
      orderBy: [{ important: "desc" }, { createdAt: "desc" }],
    })
    return NextResponse.json(notices)
  } catch (error) {
    console.error("Failed to fetch notices:", error)
    return NextResponse.json({ error: "Failed to fetch notices" }, { status: 500 })
  }
}

// POST /api/notices - 공지사항 생성 (관리자)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 })
    }

    const body = await request.json()
    const data = noticeSchema.parse(body)

    const notice = await db.notice.create({
      data: {
        title: data.title,
        content: data.content,
        important: data.important,
        published: data.published,
        isPopup: data.isPopup,
        popupStartDate: data.popupStartDate ? new Date(data.popupStartDate) : null,
        popupEndDate: data.popupEndDate ? new Date(data.popupEndDate) : null,
        popupShowOnce: data.popupShowOnce,
      },
    })

    return NextResponse.json(notice, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error("Notice creation error:", error)
    return NextResponse.json(
      { error: "공지사항 작성 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
