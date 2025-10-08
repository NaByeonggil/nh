import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // 추가적인 미들웨어 로직이 필요한 경우 여기에 작성
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // 관리자 페이지 접근 권한 확인
        if (req.nextUrl.pathname.startsWith("/admin")) {
          return token?.role === "ADMIN"
        }
        
        // 인증이 필요한 페이지
        if (req.nextUrl.pathname.startsWith("/my")) {
          return !!token
        }
        
        return true
      },
    },
  }
)

export const config = {
  matcher: ["/admin/:path*", "/my/:path*"]
}