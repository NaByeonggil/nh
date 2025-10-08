import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { contentSchema } from "@/lib/validations"
import { z } from "zod"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category')
    const search = searchParams.get('search') || ''
    const published = searchParams.get('published')

    const skip = (page - 1) * limit

    // 검색 조건 구성
    const where: any = {}
    
    if (category && category !== 'all') {
      where.category = category.toUpperCase()
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ]
    }
    
    if (published !== null && published !== undefined) {
      where.published = published === 'true'
    }

    // 총 개수 조회
    const totalCount = await db.content.count({ where })

    // 컨텐츠 목록 조회
    const contents = await db.content.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        excerpt: true,
        thumbnail: true,
        category: true,
        published: true,
        viewCount: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    return NextResponse.json({
      contents,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
    })

  } catch (error) {
    console.error("Content fetch error:", error)
    return NextResponse.json(
      { error: "컨텐츠 목록을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

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
    
    // 유효성 검사
    const validatedData = contentSchema.parse(body)

    // 요약(excerpt) 자동 생성
    let excerpt = validatedData.excerpt
    if (!excerpt) {
      const plainText = validatedData.content.replace(/<[^>]*>/g, "").trim()
      excerpt = plainText.substring(0, 300)
    }

    // 컨텐츠 생성
    const content = await db.content.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        excerpt,
        thumbnail: validatedData.thumbnail,
        category: validatedData.category,
        published: validatedData.published,
      }
    })

    return NextResponse.json(content, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Content creation error:", error)
    return NextResponse.json(
      { error: "컨텐츠 작성 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}