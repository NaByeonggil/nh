import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    // 임시 관리자 계정 정보
    const adminEmail = 'admin@nh.com'
    const adminPassword = 'admin123!'
    const adminName = '관리자'

    // 기존 관리자 계정 확인
    const existingAdmin = await db.user.findUnique({
      where: { email: adminEmail }
    })

    if (existingAdmin) {
      // 기존 계정을 관리자로 업데이트
      if (existingAdmin.role !== 'ADMIN') {
        await db.user.update({
          where: { email: adminEmail },
          data: { role: 'ADMIN' }
        })
        return NextResponse.json({
          message: "기존 계정을 관리자 권한으로 업데이트했습니다.",
          admin: {
            email: adminEmail,
            name: existingAdmin.name,
            role: 'ADMIN'
          }
        })
      }

      return NextResponse.json({
        message: "관리자 계정이 이미 존재합니다.",
        admin: {
          email: adminEmail,
          name: existingAdmin.name,
          role: existingAdmin.role
        }
      })
    }

    // 비밀번호 해시
    const hashedPassword = await bcrypt.hash(adminPassword, 12)

    // 관리자 계정 생성
    const admin = await db.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: adminName,
        role: 'ADMIN',
        emailVerified: new Date()
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })

    return NextResponse.json({
      message: "관리자 계정이 성공적으로 생성되었습니다!",
      admin: admin,
      credentials: {
        email: adminEmail,
        password: adminPassword,
        note: "이 정보를 안전한 곳에 보관하고, 설정 메뉴에서 반드시 변경하세요."
      }
    })

  } catch (error) {
    console.error('Admin creation error:', error)
    return NextResponse.json(
      { error: "관리자 계정 생성 중 오류가 발생했습니다", details: error },
      { status: 500 }
    )
  }
}