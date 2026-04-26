import nodemailer from 'nodemailer'

// 메일 전송 설정
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// 메일 전송 함수
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string | string[]
  subject: string
  html: string
  text?: string
}) {
  try {
    const info = await transporter.sendMail({
      from: `"옆집약사" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      text,
      html,
    })

    console.log('Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error }
  }
}

// 관리자에게 메일 전송
export async function sendAdminEmail(subject: string, html: string, text?: string) {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER
  if (!adminEmail) {
    console.error('Admin email not configured')
    return { success: false, error: 'Admin email not configured' }
  }

  return sendEmail({
    to: adminEmail,
    subject: `[옆집약사 관리자] ${subject}`,
    html,
    text,
  })
}

// 메일 설정 검증
export function validateEmailConfig() {
  const required = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS']
  const missing = required.filter(key => !process.env[key])

  if (missing.length > 0) {
    console.warn(`Missing email configuration: ${missing.join(', ')}`)
    return false
  }

  return true
}
