import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db as prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""
    const role = searchParams.get("role") || "all"
    const isExpert = searchParams.get("isExpert")

    const skip = (page - 1) * limit

    // 검색 조건 구성
    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } }
      ]
    }

    if (role !== "all") {
      where.role = role
    }

    if (isExpert === "true") {
      where.isExpert = true
    } else if (isExpert === "false") {
      where.isExpert = false
    }

    // 사용자 목록 조회
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
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
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" }
      }),
      prisma.user.count({ where })
    ])

    // 통계 정보 조회
    const stats = await prisma.user.aggregate({
      _count: {
        id: true,
      },
      where: {}
    })

    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } })
    const expertCount = await prisma.user.count({ where: { isExpert: true } })
    
    // 이번 주 가입자 수
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const weeklyCount = await prisma.user.count({
      where: { createdAt: { gte: oneWeekAgo } }
    })

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit
      },
      stats: {
        totalUsers: stats._count.id,
        adminUsers: adminCount,
        expertUsers: expertCount,
        weeklyUsers: weeklyCount
      }
    })
  } catch (error) {
    console.error("Failed to fetch users:", error)
    return NextResponse.json(
      { error: "사용자 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      name,
      email,
      password,
      role,
      isExpert,
      canManageContent,
      canManageInquiry,
      expertField,
      expertLicense,
      expertVerified
    } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "이메일과 비밀번호는 필수입니다." },
        { status: 400 }
      )
    }

    // 이메일 중복 확인
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "이미 사용 중인 이메일입니다." },
        { status: 400 }
      )
    }

    // 비밀번호 해시화
    const bcrypt = require("bcryptjs")
    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await prisma.user.create({
      data: {
        name: name || null,
        email,
        password: hashedPassword,
        role: role || "USER",
        isExpert: isExpert || false,
        canManageContent: canManageContent || false,
        canManageInquiry: canManageInquiry || false,
        expertField: expertField || null,
        expertLicense: expertLicense || null,
        expertVerified: expertVerified || false,
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

    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error("Failed to create user:", error)
    return NextResponse.json(
      { error: "사용자 생성에 실패했습니다." },
      { status: 500 }
    )
  }
}