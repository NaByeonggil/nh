import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db as prisma } from "@/lib/db"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    
    const {
      role,
      isExpert,
      canManageContent,
      canManageInquiry,
      expertField,
      expertLicense,
      expertVerified
    } = body

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(role !== undefined && { role }),
        ...(isExpert !== undefined && { isExpert }),
        ...(canManageContent !== undefined && { canManageContent }),
        ...(canManageInquiry !== undefined && { canManageInquiry }),
        ...(expertField !== undefined && { expertField }),
        ...(expertLicense !== undefined && { expertLicense }),
        ...(expertVerified !== undefined && { expertVerified }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isExpert: true,
        canManageContent: true,
        canManageInquiry: true,
        expertField: true,
        expertLicense: true,
        expertVerified: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Failed to update user:", error)
    return NextResponse.json(
      { error: "사용자 정보 업데이트에 실패했습니다." },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 }
      )
    }

    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isExpert: true,
        canManageContent: true,
        canManageInquiry: true,
        expertField: true,
        expertLicense: true,
        expertVerified: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Failed to fetch user:", error)
    return NextResponse.json(
      { error: "사용자 정보를 불러오는데 실패했습니다." },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 }
      )
    }

    const { id } = await params

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    // Prevent deleting yourself
    if (user.id === session.user.id) {
      return NextResponse.json(
        { error: "자신의 계정은 삭제할 수 없습니다." },
        { status: 400 }
      )
    }

    // Delete user
    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({ message: "사용자가 성공적으로 삭제되었습니다." })
  } catch (error) {
    console.error("Failed to delete user:", error)
    return NextResponse.json(
      { error: "사용자 삭제에 실패했습니다." },
      { status: 500 }
    )
  }
}