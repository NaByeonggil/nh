import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { lectureSchema } from "@/lib/validations"
import { createSlug } from "@/lib/helpers"
import { z } from "zod"

// id 또는 slug 어느 쪽으로도 조회 가능
function whereByIdOrSlug(idOrSlug: string) {
  return { OR: [{ id: idOrSlug }, { slug: idOrSlug }] }
}

// GET /api/lectures/[id] - 단일 강의 노트 (조회수 증가)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const lecture = await db.lecture.findFirst({
      where: whereByIdOrSlug(id),
      include: {
        topics: { select: { name: true, slug: true } },
        revisions: { orderBy: { createdAt: "asc" } },
      },
    })

    if (!lecture) {
      return NextResponse.json(
        { error: "강의 노트를 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    // 조회수 증가 (실패해도 본문 응답에는 영향 없음)
    db.lecture
      .update({ where: { id: lecture.id }, data: { viewCount: { increment: 1 } } })
      .catch(() => {})

    return NextResponse.json({
      ...lecture,
      keyPoints: lecture.keyPoints ? JSON.parse(lecture.keyPoints) : [],
      tags: lecture.tags ? JSON.parse(lecture.tags) : [],
      questions: lecture.questions ? JSON.parse(lecture.questions) : [],
      viewCount: lecture.viewCount + 1,
    })
  } catch (error) {
    console.error("Lecture fetch error:", error)
    return NextResponse.json(
      { error: "강의 노트를 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

// PATCH /api/lectures/[id] - 수정 (관리자)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 })
    }

    const existing = await db.lecture.findFirst({ where: whereByIdOrSlug(id) })
    if (!existing) {
      return NextResponse.json({ error: "강의 노트를 찾을 수 없습니다." }, { status: 404 })
    }

    const body = await request.json()
    const data = lectureSchema.partial().parse(body)

    const topicConnect = (data.topics || []).map((name) => {
      const topicSlug = createSlug(name) || "topic"
      return { where: { slug: topicSlug }, create: { name, slug: topicSlug } }
    })

    const lecture = await db.lecture.update({
      where: { id: existing.id },
      data: {
        title: data.title,
        date: data.date ? new Date(data.date) : undefined,
        sequence: data.sequence,
        summary: data.summary,
        body: data.body,
        status: data.status,
        keyPoints: data.keyPoints ? JSON.stringify(data.keyPoints) : undefined,
        tags: data.tags ? JSON.stringify(data.tags) : undefined,
        questions: data.questions ? JSON.stringify(data.questions) : undefined,
        topics: data.topics
          ? { set: [], connectOrCreate: topicConnect }
          : undefined,
      },
      include: { topics: { select: { name: true, slug: true } } },
    })

    return NextResponse.json(lecture)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error("Lecture update error:", error)
    return NextResponse.json(
      { error: "강의 노트 수정 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

// DELETE /api/lectures/[id] - 삭제 (관리자)
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

    const existing = await db.lecture.findFirst({ where: whereByIdOrSlug(id) })
    if (!existing) {
      return NextResponse.json({ error: "강의 노트를 찾을 수 없습니다." }, { status: 404 })
    }

    await db.lecture.delete({ where: { id: existing.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Lecture delete error:", error)
    return NextResponse.json(
      { error: "강의 노트 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
