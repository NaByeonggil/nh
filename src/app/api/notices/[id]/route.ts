import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { noticeSchema } from "@/lib/validations"
import { z } from "zod"

// GET /api/notices/[id] - 단일 공지사항
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const notice = await db.notice.findUnique({ where: { id } })
    if (!notice) {
      return NextResponse.json({ error: "공지사항을 찾을 수 없습니다." }, { status: 404 })
    }
    return NextResponse.json(notice)
  } catch (error) {
    console.error("Notice fetch error:", error)
    return NextResponse.json(
      { error: "공지사항을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

// PUT /api/notices/[id] - 수정 (관리자)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 })
    }

    const existing = await db.notice.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "공지사항을 찾을 수 없습니다." }, { status: 404 })
    }

    const body = await request.json()
    const data = noticeSchema.parse(body)

    const notice = await db.notice.update({
      where: { id },
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

    return NextResponse.json(notice)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error("Notice update error:", error)
    return NextResponse.json(
      { error: "공지사항 수정 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

// DELETE /api/notices/[id] - 삭제 (관리자)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 })
    }

    const existing = await db.notice.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "공지사항을 찾을 수 없습니다." }, { status: 404 })
    }

    await db.notice.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Notice delete error:", error)
    return NextResponse.json(
      { error: "공지사항 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
