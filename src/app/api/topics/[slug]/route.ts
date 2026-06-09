import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { topicSchema } from "@/lib/validations"
import { z } from "zod"

// GET /api/topics/[slug] - 주제 허브 (통합본 + 해당 주제의 강의 노트 목록)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const topic = await db.topic.findUnique({
      where: { slug },
      include: {
        lectures: {
          orderBy: { date: "desc" },
          select: {
            id: true,
            slug: true,
            title: true,
            date: true,
            sequence: true,
            summary: true,
            status: true,
            viewCount: true,
          },
        },
      },
    })

    if (!topic) {
      return NextResponse.json({ error: "주제를 찾을 수 없습니다." }, { status: 404 })
    }

    return NextResponse.json(topic)
  } catch (error) {
    console.error("Topic fetch error:", error)
    return NextResponse.json(
      { error: "주제를 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

// PATCH /api/topics/[slug] - 주제 통합본(overview)/이름 수정 (관리자)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 })
    }

    const existing = await db.topic.findUnique({ where: { slug } })
    if (!existing) {
      return NextResponse.json({ error: "주제를 찾을 수 없습니다." }, { status: 404 })
    }

    const body = await request.json()
    const data = topicSchema.partial().parse(body)

    const topic = await db.topic.update({
      where: { slug },
      data: { name: data.name, overview: data.overview },
    })

    return NextResponse.json(topic)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error("Topic update error:", error)
    return NextResponse.json(
      { error: "주제 수정 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

// DELETE /api/topics/[slug] - 주제 삭제 (관리자)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 })
    }

    const existing = await db.topic.findUnique({ where: { slug } })
    if (!existing) {
      return NextResponse.json({ error: "주제를 찾을 수 없습니다." }, { status: 404 })
    }

    await db.topic.delete({ where: { slug } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Topic delete error:", error)
    return NextResponse.json(
      { error: "주제 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
