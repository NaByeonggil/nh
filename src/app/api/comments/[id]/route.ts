import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      )
    }

    const body = await request.json()

    // 기존 댓글 조회
    const existingComment = await db.comment.findUnique({
      where: { id: id }
    })

    if (!existingComment) {
      return NextResponse.json(
        { error: "댓글을 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    // 권한 확인 (작성자 본인 또는 관리자만 수정 가능)
    if (existingComment.authorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "댓글을 수정할 권한이 없습니다." },
        { status: 403 }
      )
    }

    // 댓글 업데이트
    const updatedComment = await db.comment.update({
      where: { id: id },
      data: {
        content: body.content,
        updatedAt: new Date(),
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

    return NextResponse.json(updatedComment)

  } catch (error) {
    console.error("Comment update error:", error)
    return NextResponse.json(
      { error: "댓글 수정 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      )
    }

    // 기존 댓글 조회
    const existingComment = await db.comment.findUnique({
      where: { id: id }
    })

    if (!existingComment) {
      return NextResponse.json(
        { error: "댓글을 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    // 권한 확인 (작성자 본인 또는 관리자만 삭제 가능)
    if (existingComment.authorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "댓글을 삭제할 권한이 없습니다." },
        { status: 403 }
      )
    }

    // 댓글 삭제
    await db.comment.delete({
      where: { id: id }
    })

    return NextResponse.json({ message: "댓글이 삭제되었습니다." })

  } catch (error) {
    console.error("Comment delete error:", error)
    return NextResponse.json(
      { error: "댓글 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}