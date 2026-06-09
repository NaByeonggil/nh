import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { topicSchema } from "@/lib/validations"
import { createSlug } from "@/lib/helpers"
import { z } from "zod"

// GET /api/topics - 주제 목록 (강의 수 포함)
export async function GET() {
  try {
    const topics = await db.topic.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        overview: true,
        _count: { select: { lectures: true } },
      },
    })

    return NextResponse.json({ topics })
  } catch (error) {
    console.error("Topic fetch error:", error)
    return NextResponse.json(
      { error: "주제 목록을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

// POST /api/topics - 주제 생성 (관리자)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 })
    }

    const body = await request.json()
    const data = topicSchema.parse(body)

    const slug = createSlug(data.slug || data.name) || "topic"

    const existing = await db.topic.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: "이미 존재하는 주제입니다." }, { status: 409 })
    }

    const topic = await db.topic.create({
      data: { name: data.name, slug, overview: data.overview },
    })

    return NextResponse.json(topic, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error("Topic creation error:", error)
    return NextResponse.json(
      { error: "주제 생성 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
