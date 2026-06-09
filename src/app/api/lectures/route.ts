import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { lectureSchema } from "@/lib/validations"
import { createSlug } from "@/lib/helpers"
import { z } from "zod"

// GET /api/lectures - 강의 노트 목록 (날짜순). topic/status/search/날짜 필터 지원
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const topic = searchParams.get("topic") // topic slug
    const status = searchParams.get("status")
    const search = searchParams.get("search") || ""

    const skip = (page - 1) * limit

    const where: any = {}

    if (topic && topic !== "all") {
      where.topics = { some: { slug: topic } }
    }

    if (status && status !== "all") {
      where.status = status.toUpperCase()
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { summary: { contains: search } },
        { body: { contains: search } },
      ]
    }

    const totalCount = await db.lecture.count({ where })

    const lectures = await db.lecture.findMany({
      where,
      skip,
      take: limit,
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
        createdAt: true,
        updatedAt: true,
        topics: { select: { name: true, slug: true } },
        _count: { select: { revisions: true } },
      },
    })

    return NextResponse.json({
      lectures,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
    })
  } catch (error) {
    console.error("Lecture fetch error:", error)
    return NextResponse.json(
      { error: "강의 목록을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

// POST /api/lectures - 강의 노트 생성 (관리자)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 }
      )
    }

    const body = await request.json()
    const data = lectureSchema.parse(body)

    // 슬러그 생성 (미입력 시 제목 기반, 충돌 시 접미사 부여)
    const baseSlug = createSlug(data.slug || data.title) || "lecture"
    let slug = baseSlug
    let suffix = 1
    while (await db.lecture.findUnique({ where: { slug } })) {
      suffix += 1
      slug = `${baseSlug}-${suffix}`
    }

    // 주제(N:N) connectOrCreate
    const topicConnect = (data.topics || []).map((name) => {
      const topicSlug = createSlug(name) || "topic"
      return {
        where: { slug: topicSlug },
        create: { name, slug: topicSlug },
      }
    })

    const lecture = await db.lecture.create({
      data: {
        slug,
        title: data.title,
        date: new Date(data.date),
        sequence: data.sequence,
        summary: data.summary,
        body: data.body,
        status: data.status,
        keyPoints: data.keyPoints ? JSON.stringify(data.keyPoints) : null,
        tags: data.tags ? JSON.stringify(data.tags) : null,
        questions: data.questions ? JSON.stringify(data.questions) : null,
        topics: topicConnect.length ? { connectOrCreate: topicConnect } : undefined,
      },
      include: { topics: { select: { name: true, slug: true } } },
    })

    return NextResponse.json(lecture, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Lecture creation error:", error)
    return NextResponse.json(
      { error: "강의 노트 작성 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
