import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 }
      )
    }

    let body
    try {
      body = await request.json()
    } catch (error) {
      console.error("JSON parsing error:", error)
      return NextResponse.json(
        { error: "잘못된 요청 형식입니다." },
        { status: 400 }
      )
    }

    const { title, excerpt, content, category, published } = body
    console.log("==== CONTENT CREATION DEBUG ====")
    console.log("Full request body:", JSON.stringify(body, null, 2))
    console.log("Published value (raw):", published)
    console.log("Published value (type):", typeof published)
    console.log("Published value (Boolean conversion):", Boolean(published))
    console.log("=================================")

    if (!title?.trim()) {
      return NextResponse.json(
        { error: "제목을 입력해주세요." },
        { status: 400 }
      )
    }

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "내용을 입력해주세요." },
        { status: 400 }
      )
    }

    // 카테고리 검증
    const validCategories = ["LIFESTYLE", "TREATMENT", "NOTICE"]
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: "올바른 카테고리를 선택해주세요." },
        { status: 400 }
      )
    }

    const newContent = await db.content.create({
      data: {
        title: title.trim(),
        excerpt: excerpt?.trim() || null,
        content: content.trim(),
        category,
        published: Boolean(published),
        viewCount: 0
      },
      select: {
        id: true,
        title: true,
        category: true,
        published: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      message: published ? "콘텐츠가 발행되었습니다!" : "콘텐츠가 임시저장되었습니다!",
      content: newContent
    })

  } catch (error) {
    console.error("Content creation error:", error)
    return NextResponse.json(
      {
        error: "콘텐츠 저장 중 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const published = searchParams.get('published')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}

    if (category && category !== 'all') {
      where.category = category
    }

    if (published !== null && published !== 'all') {
      where.published = published === 'true'
    }

    const [contents, totalCount] = await Promise.all([
      db.content.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          title: true,
          excerpt: true,
          category: true,
          published: true,
          viewCount: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      db.content.count({ where })
    ])

    return NextResponse.json({
      contents,
      totalCount,
      hasMore: offset + limit < totalCount
    })

  } catch (error) {
    console.error("Content fetch error:", error)
    return NextResponse.json(
      { error: "콘텐츠 조회 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}