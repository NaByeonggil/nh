import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  try {
    // 컨텐츠 조회
    const content = await db.content.findUnique({
      where: { id: id }
    })

    if (!content) {
      return NextResponse.json(
        { error: "컨텐츠를 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    // 게시되지 않은 컨텐츠는 관리자만 볼 수 있음
    if (!content.published) {
      const session = await getServerSession(authOptions)
      if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json(
          { error: "이 컨텐츠에 접근할 권한이 없습니다." },
          { status: 403 }
        )
      }
    }

    // 조회수 증가 (게시된 컨텐츠만)
    if (content.published) {
      await db.content.update({
        where: { id: id },
        data: { viewCount: { increment: 1 } }
      })
    }

    return NextResponse.json(content)

  } catch (error) {
    console.error("Content fetch error:", error)
    return NextResponse.json(
      { error: "컨텐츠를 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 }
      )
    }

    const body = await request.json()

    // 기존 컨텐츠 조회
    const existingContent = await db.content.findUnique({
      where: { id: id }
    })

    if (!existingContent) {
      return NextResponse.json(
        { error: "컨텐츠를 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    // 요약(excerpt) 자동 생성
    let excerpt = body.excerpt
    if (!excerpt && body.content) {
      const plainText = body.content.replace(/<[^>]*>/g, "").trim()
      excerpt = plainText.substring(0, 300)
    }

    // 컨텐츠 업데이트
    const updatedContent = await db.content.update({
      where: { id: id },
      data: {
        title: body.title,
        content: body.content,
        excerpt,
        thumbnail: body.thumbnail,
        category: body.category,
        published: body.published,
        updatedAt: new Date(),
      }
    })

    return NextResponse.json(updatedContent)

  } catch (error) {
    console.error("Content update error:", error)
    return NextResponse.json(
      { error: "컨텐츠 수정 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 }
      )
    }

    const body = await request.json()

    // 기존 컨텐츠 조회
    const existingContent = await db.content.findUnique({
      where: { id: id }
    })

    if (!existingContent) {
      return NextResponse.json(
        { error: "컨텐츠를 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    // 요약(excerpt) 자동 생성
    let excerpt = body.excerpt
    if (!excerpt && body.content) {
      const plainText = body.content.replace(/<[^>]*>/g, "").trim()
      excerpt = plainText.substring(0, 300)
    }

    // 컨텐츠 업데이트 (PUT은 전체 업데이트)
    const updatedContent = await db.content.update({
      where: { id: id },
      data: {
        title: body.title,
        content: body.content,
        excerpt,
        thumbnail: body.thumbnail || null,
        category: body.category,
        published: body.published,
        updatedAt: new Date(),
      }
    })

    return NextResponse.json(updatedContent)

  } catch (error) {
    console.error("Content update error:", error)
    return NextResponse.json(
      { error: "컨텐츠 수정 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 }
      )
    }

    // 기존 컨텐츠 조회
    const existingContent = await db.content.findUnique({
      where: { id: id }
    })

    if (!existingContent) {
      return NextResponse.json(
        { error: "컨텐츠를 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    // 컨텐츠 삭제
    await db.content.delete({
      where: { id: id }
    })

    return NextResponse.json({ message: "컨텐츠가 삭제되었습니다." })

  } catch (error) {
    console.error("Content delete error:", error)
    return NextResponse.json(
      { error: "컨텐츠 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}