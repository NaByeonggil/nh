import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const password = searchParams.get('password')

    // 문의 조회
    const inquiry = await db.inquiry.findUnique({
      where: { id: id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            isExpert: true,
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                isExpert: true,
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!inquiry) {
      return NextResponse.json(
        { error: "문의를 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    // 비밀번호 보호 문의인 경우 권한 확인
    if (inquiry.isPrivate) {
      let hasAccess = false

      // 관리자는 항상 접근 가능
      if (session?.user?.role === "ADMIN") {
        hasAccess = true
      }
      // 작성자 본인인 경우 접근 가능
      else if (session?.user?.id === inquiry.authorId) {
        hasAccess = true
      }
      // 비밀번호가 제공된 경우 확인
      else if (password && inquiry.password) {
        const isValidPassword = await bcrypt.compare(password, inquiry.password)
        if (isValidPassword) {
          hasAccess = true
        }
      }

      if (!hasAccess) {
        return NextResponse.json(
          { error: "이 문의에 접근할 권한이 없습니다." },
          { status: 403 }
        )
      }
    }

    // 조회수 증가
    await db.inquiry.update({
      where: { id: id },
      data: { viewCount: { increment: 1 } }
    })

    // 첨부파일 JSON 파싱
    let attachments = []
    if (inquiry.attachments) {
      try {
        attachments = JSON.parse(inquiry.attachments)
      } catch (e) {
        console.error("Failed to parse attachments:", e)
      }
    }

    // 안전한 응답 생성
    const safeInquiry = {
      ...inquiry,
      password: undefined,
      attachments,
    }

    return NextResponse.json(safeInquiry)

  } catch (error) {
    console.error("Inquiry fetch error:", error)
    return NextResponse.json(
      { error: "문의를 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
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

    // 기존 문의 조회
    const existingInquiry = await db.inquiry.findUnique({
      where: { id: id }
    })

    if (!existingInquiry) {
      return NextResponse.json(
        { error: "문의를 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    // 권한 확인 (작성자 본인 또는 관리자만 수정 가능)
    if (existingInquiry.authorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "문의를 수정할 권한이 없습니다." },
        { status: 403 }
      )
    }

    // 문의 업데이트
    const updatedInquiry = await db.inquiry.update({
      where: { id: id },
      data: {
        title: body.title,
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
        },
        _count: {
          select: {
            comments: true,
          }
        }
      }
    })

    const safeInquiry = {
      ...updatedInquiry,
      password: undefined,
    }

    return NextResponse.json(safeInquiry)

  } catch (error) {
    console.error("Inquiry update error:", error)
    return NextResponse.json(
      { error: "문의 수정 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
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
    const { title, content, authorName, authorEmail, authorPhone, isPrivate, password } = body

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: "제목과 내용을 입력해주세요." },
        { status: 400 }
      )
    }

    // 기존 문의 조회
    const existingInquiry = await db.inquiry.findUnique({
      where: { id: id }
    })

    if (!existingInquiry) {
      return NextResponse.json(
        { error: "문의를 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    // 권한 확인 (작성자 본인 또는 관리자만 수정 가능)
    if (existingInquiry.authorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "문의를 수정할 권한이 없습니다." },
        { status: 403 }
      )
    }

    // 비공개 설정 시 비밀번호 필수
    if (isPrivate && !password?.trim() && !existingInquiry.password) {
      return NextResponse.json(
        { error: "비공개 문의인 경우 암호를 설정해주세요." },
        { status: 400 }
      )
    }

    // 업데이트할 데이터 준비
    const updateData: any = {
      title,
      content,
      isPrivate: isPrivate || false,
      updatedAt: new Date(),
    }

    // 작성자 정보 업데이트 (회원이 아닌 경우 또는 관리자가 수정하는 경우)
    if (!existingInquiry.authorId || session.user.role === "ADMIN") {
      updateData.authorName = authorName
      updateData.authorEmail = authorEmail
      updateData.authorPhone = authorPhone
    }

    // 비밀번호 처리
    if (isPrivate && password?.trim()) {
      updateData.password = await bcrypt.hash(password, 12)
    } else if (!isPrivate) {
      updateData.password = null
    }

    // 문의 업데이트
    const updatedInquiry = await db.inquiry.update({
      where: { id: id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            isExpert: true,
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                isExpert: true,
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    // 첨부파일 JSON 파싱
    let attachments = []
    if (updatedInquiry.attachments) {
      try {
        attachments = JSON.parse(updatedInquiry.attachments)
      } catch (e) {
        console.error("Failed to parse attachments:", e)
      }
    }

    // 안전한 응답 생성
    const safeInquiry = {
      ...updatedInquiry,
      password: undefined,
      attachments,
    }

    return NextResponse.json(safeInquiry)

  } catch (error) {
    console.error("Inquiry update error:", error)
    return NextResponse.json(
      { error: "문의 수정 중 오류가 발생했습니다." },
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

    // 기존 문의 조회
    const existingInquiry = await db.inquiry.findUnique({
      where: { id: id }
    })

    if (!existingInquiry) {
      return NextResponse.json(
        { error: "문의를 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    // 권한 확인 (작성자 본인 또는 관리자만 삭제 가능)
    if (existingInquiry.authorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "문의를 삭제할 권한이 없습니다." },
        { status: 403 }
      )
    }

    // 문의 삭제 (댓글은 Cascade로 자동 삭제)
    await db.inquiry.delete({
      where: { id: id }
    })

    return NextResponse.json({ message: "문의가 삭제되었습니다." })

  } catch (error) {
    console.error("Inquiry delete error:", error)
    return NextResponse.json(
      { error: "문의 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}