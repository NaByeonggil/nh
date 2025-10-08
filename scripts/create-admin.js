const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    // 임시 관리자 계정 정보
    const adminEmail = 'admin@nh.com'
    const adminPassword = 'admin123!'
    const adminName = '관리자'

    // 기존 관리자 계정 확인
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (existingAdmin) {
      console.log('관리자 계정이 이미 존재합니다.')
      console.log(`이메일: ${adminEmail}`)
      console.log(`기존 역할: ${existingAdmin.role}`)

      // 기존 계정을 관리자로 업데이트
      if (existingAdmin.role !== 'ADMIN') {
        await prisma.user.update({
          where: { email: adminEmail },
          data: { role: 'ADMIN' }
        })
        console.log('기존 계정을 관리자 권한으로 업데이트했습니다.')
      }
      return
    }

    // 비밀번호 해시
    const hashedPassword = await bcrypt.hash(adminPassword, 12)

    // 관리자 계정 생성
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: adminName,
        role: 'ADMIN',
        emailVerified: new Date()
      }
    })

    console.log('관리자 계정이 생성되었습니다!')
    console.log('=================================')
    console.log(`이메일: ${adminEmail}`)
    console.log(`비밀번호: ${adminPassword}`)
    console.log(`이름: ${adminName}`)
    console.log('=================================')
    console.log('이 정보를 안전한 곳에 보관하세요.')

  } catch (error) {
    console.error('관리자 계정 생성 중 오류 발생:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()