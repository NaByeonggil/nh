// 새 문의 등록 알림 이메일 템플릿
export function getInquiryNotificationEmail({
  title,
  authorName,
  authorEmail,
  authorPhone,
  content,
  isPrivate,
  inquiryId,
  siteUrl = 'https://cancerwith.kr',
}: {
  title: string
  authorName?: string
  authorEmail?: string
  authorPhone?: string
  content: string
  isPrivate: boolean
  inquiryId: string
  siteUrl?: string
}) {
  const authorInfo = authorName || '익명'
  const privacyBadge = isPrivate
    ? '<span style="background-color: #ef4444; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">🔒 비밀글</span>'
    : '<span style="background-color: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">📢 공개글</span>'

  const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>새로운 문의가 등록되었습니다</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- 헤더 -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">💌 새로운 문의</h1>
              <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 14px;">옆집약사에 새로운 문의가 등록되었습니다</p>
            </td>
          </tr>

          <!-- 내용 -->
          <tr>
            <td style="padding: 40px 30px;">
              <!-- 문의 정보 -->
              <div style="margin-bottom: 30px;">
                <div style="margin-bottom: 15px;">
                  ${privacyBadge}
                </div>
                <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
                  ${title}
                </h2>
              </div>

              <!-- 작성자 정보 -->
              <table width="100%" style="background-color: #f9fafb; border-radius: 6px; padding: 20px; margin-bottom: 25px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 13px; font-weight: bold;">작성자 정보</p>
                    <table width="100%" style="font-size: 14px; color: #374151;">
                      <tr>
                        <td width="80" style="padding: 5px 0;"><strong>이름:</strong></td>
                        <td style="padding: 5px 0;">${authorInfo}</td>
                      </tr>
                      ${
                        authorEmail
                          ? `<tr>
                          <td style="padding: 5px 0;"><strong>이메일:</strong></td>
                          <td style="padding: 5px 0;">${authorEmail}</td>
                        </tr>`
                          : ''
                      }
                      ${
                        authorPhone
                          ? `<tr>
                          <td style="padding: 5px 0;"><strong>전화:</strong></td>
                          <td style="padding: 5px 0;">${authorPhone}</td>
                        </tr>`
                          : ''
                      }
                    </table>
                  </td>
                </tr>
              </table>

              <!-- 문의 내용 -->
              <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px; margin-bottom: 25px;">
                <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 13px; font-weight: bold;">문의 내용</p>
                <div style="color: #374151; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${content}</div>
              </div>

              <!-- 액션 버튼 -->
              <div style="text-align: center; margin-top: 30px;">
                <a href="${siteUrl}/admin/inquiries"
                   style="display: inline-block; background-color: #667eea; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 6px; font-size: 16px; font-weight: bold;">
                  관리자 페이지에서 확인하기 →
                </a>
              </div>

              <!-- 안내 문구 -->
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                <p style="color: #9ca3af; font-size: 13px; margin: 0;">
                  이 메일은 자동으로 발송되었습니다.<br>
                  빠른 시일 내에 답변 부탁드립니다.
                </p>
              </div>
            </td>
          </tr>

          <!-- 푸터 -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 30px; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                © 2024 옆집약사 (cancerwith.kr). All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  const text = `
새로운 문의가 등록되었습니다

제목: ${title}
작성자: ${authorInfo}
${authorEmail ? `이메일: ${authorEmail}` : ''}
${authorPhone ? `전화: ${authorPhone}` : ''}
공개여부: ${isPrivate ? '비밀글' : '공개글'}

내용:
${content}

관리자 페이지에서 확인: ${siteUrl}/admin/inquiries
  `

  return { html, text }
}
