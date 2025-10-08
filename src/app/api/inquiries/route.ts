import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { inquirySchema } from "@/lib/validations"
import bcrypt from "bcryptjs"
import { z } from "zod"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    // 검색 조건
    const where = search
      ? {
          OR: [
            { title: { contains: search } },
            { content: { contains: search } },
            { authorName: { contains: search } },
          ],
        }
      : {}

    // 총 개수 조회
    const totalCount = await db.inquiry.count({ where })

    // 문의 목록 조회
    const inquiries = await db.inquiry.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            isExpert: true,
          }
        },
        _count: {
          select: {
            comments: true,
          }
        }
      }
    })

    // 비밀번호 제거
    const safeInquiries = inquiries.map(inquiry => ({
      ...inquiry,
      password: undefined,
    }))

    return NextResponse.json({
      inquiries: safeInquiries,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
    })

  } catch (error) {
    console.error("Inquiries fetch error:", error)
    return NextResponse.json(
      { error: "문의 목록을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    
    // 유효성 검사
    const validatedData = inquirySchema.parse(body)

    // 비밀번호가 있는 경우 해시화
    let hashedPassword = null
    if (validatedData.password) {
      hashedPassword = await bcrypt.hash(validatedData.password, 10)
    }

    // 첨부파일 JSON 문자열로 변환
    const attachmentsJson = validatedData.attachments 
      ? JSON.stringify(validatedData.attachments)
      : null

    // 문의 생성
    const inquiry = await db.inquiry.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        authorName: validatedData.authorName,
        authorPhone: validatedData.authorPhone,
        authorEmail: validatedData.authorEmail,
        password: hashedPassword,
        isPrivate: !!hashedPassword,
        attachments: attachmentsJson,
        authorId: session?.user?.id || null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            isExpert: true,
          }
        },
        _count: {
          select: {
            comments: true,
          }
        }
      }
    })

    // 비밀번호 제거하여 반환
    const safeInquiry = {
      ...inquiry,
      password: undefined,
    }

    return NextResponse.json(safeInquiry, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Inquiry creation error:", error)
    return NextResponse.json(
      { error: "문의 작성 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}