import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { commentSchema } from "@/lib/validations"
import { z } from "zod"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // 유효성 검사
    const validatedData = commentSchema.parse(body)
    const { inquiryId } = body

    if (!inquiryId) {
      return NextResponse.json(
        { error: "문의 ID가 필요합니다." },
        { status: 400 }
      )
    }

    // 문의가 존재하는지 확인
    const inquiry = await db.inquiry.findUnique({
      where: { id: inquiryId }
    })

    if (!inquiry) {
      return NextResponse.json(
        { error: "문의를 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    // 댓글 생성
    const comment = await db.comment.create({
      data: {
        content: validatedData.content,
        inquiryId: inquiryId,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            isExpert: true,
          }
        }
      }
    })

    return NextResponse.json(comment, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Comment creation error:", error)
    return NextResponse.json(
      { error: "댓글 작성 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}