import Link from "next/link"
import { Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-primary">옆집약사</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              암환자의 생활습관, 식이요법, 최신 치료정보를 제공하는 전문 플랫폼입니다.
              <br />
              전문적이고 신뢰할 수 있는 정보로 환자분들의 건강한 생활을 지원합니다.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">빠른 링크</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary">
                  옆집약사 이야기
                </Link>
              </li>
              <li>
                <Link href="/inquiry" className="text-muted-foreground hover:text-primary">
                  문의게시판
                </Link>
              </li>
              <li>
                <Link href="/lifestyle" className="text-muted-foreground hover:text-primary">
                  생활습관 식이요법
                </Link>
              </li>
              <li>
                <Link href="/treatment" className="text-muted-foreground hover:text-primary">
                  표준치료 동향
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4">연락처</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>이메일: contact@neighbor-pharmacist.com</li>
              <li>전화: 02-1234-5678</li>
              <li>상담시간: 평일 09:00 - 18:00</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2024 옆집약사. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">
                개인정보처리방침
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">
                이용약관
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}