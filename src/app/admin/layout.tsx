"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  BarChart3,
  Users,
  MessageSquare,
  FileText,
  Package,
  ShoppingCart,
  Settings,
  LogOut,
  Heart,
  CreditCard,
  Image
} from "lucide-react"

const adminMenuItems = [
  { href: "/admin", label: "대시보드", icon: BarChart3 },
  { href: "/admin/users", label: "사용자 관리", icon: Users },
  { href: "/admin/inquiries", label: "문의 관리", icon: MessageSquare },
  { href: "/admin/content", label: "컨텐츠 관리", icon: FileText },
  { href: "/admin/products", label: "상품 관리", icon: Package },
  { href: "/admin/orders", label: "주문 관리", icon: ShoppingCart },
  { href: "/admin/payments", label: "결제 관리", icon: CreditCard },
  { href: "/admin/hero-images", label: "히어로 이미지", icon: Image },
  { href: "/admin/settings", label: "사이트 설정", icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/auth/signin")
      return
    }

    if (session.user.role !== "ADMIN") {
      router.push("/")
      return
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">로딩 중...</div>
      </div>
    )
  }

  if (!session || session.user.role !== "ADMIN") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r min-h-screen flex flex-col">
          <div className="p-6">
            <Link href="/admin" className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-primary">옆집약사</h1>
                <p className="text-xs text-muted-foreground">관리자 대시보드</p>
              </div>
            </Link>
          </div>
          
          <nav className="px-3 space-y-1 flex-1">
            {adminMenuItems.filter((item) => {
              // 관리자는 모든 메뉴에 접근 가능
              if (session.user.role === "ADMIN") return true
              
              // 권한별 메뉴 필터링
              if (item.href === "/admin/content" && !(session.user as any).canManageContent) return false
              if (item.href === "/admin/inquiries" && !(session.user as any).canManageInquiry) return false
              
              // 일반 사용자는 특정 메뉴만 접근 가능
              const allowedMenus = ["/admin", "/admin/users"]
              return allowedMenus.includes(item.href)
            }).map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
          
          <div className="p-3 mt-auto">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{session.user.name}</p>
                    <p className="text-xs text-muted-foreground">{session.user.email}</p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/">
                      <LogOut className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <main className="p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}