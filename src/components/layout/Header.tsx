"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CartButton } from "@/components/features/cart/CartButton"
import { User, LogOut, Settings, Heart, Menu, X, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const navigationItems = [
  { href: "/about", label: "옆집약사 이야기" },
  { href: "/inquiry", label: "문의게시판" },
  { href: "/lifestyle", label: "생활습관 식이요법" },
  { href: "/treatment", label: "표준치료 동향" },
  { href: "/supplements", label: "보충제 궁금해요" },
  { href: "/products", label: "추천제품" },
  { href: "/links", label: "추천 사이트" },
]

export function Header() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // 스크롤 감지
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // 모바일 메뉴 열릴 때 스크롤 방지
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [mobileMenuOpen])

  // 라우트 변경 시 모바일 메뉴 닫기
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          scrolled
            ? "bg-background/80 backdrop-blur-lg border-b shadow-sm"
            : "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2 group">
                <Heart className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
                <span className="text-2xl font-bold text-primary">옆집약사</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                    pathname === item.href
                      ? "text-primary bg-primary/10"
                      : "text-foreground/70 hover:text-primary hover:bg-primary/5"
                  )}
                >
                  {item.label}
                </Link>
              ))}
              {session?.user?.role === "ADMIN" && (
                <>
                  <Link
                    href="/memos"
                    className={cn(
                      "px-3 py-2 text-sm font-semibold rounded-md transition-all duration-200",
                      pathname === "/memos"
                        ? "text-blue-600 bg-blue-50"
                        : "text-blue-600 hover:bg-blue-50"
                    )}
                  >
                    메모장
                  </Link>
                  <Link
                    href="/admin"
                    className={cn(
                      "px-3 py-2 text-sm font-semibold rounded-md transition-all duration-200",
                      pathname.startsWith("/admin")
                        ? "text-orange-600 bg-orange-50"
                        : "text-orange-600 hover:bg-orange-50"
                    )}
                  >
                    관리자메뉴
                  </Link>
                </>
              )}
            </nav>

            {/* Auth Section */}
            <div className="flex items-center space-x-2">
              <CartButton />

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="메뉴 열기"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>

              {/* Desktop Auth */}
              <div className="hidden lg:flex items-center space-x-2">
                {session ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-9 w-9 rounded-full border-2 border-primary/20 hover:border-primary/40 transition-colors"
                      >
                        <User className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <div className="flex items-center justify-start gap-2 p-2">
                        <div className="flex flex-col space-y-1 leading-none">
                          {session.user?.name && (
                            <p className="font-medium">{session.user.name}</p>
                          )}
                          {session.user?.email && (
                            <p className="w-[200px] truncate text-sm text-muted-foreground">
                              {session.user.email}
                            </p>
                          )}
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/my/orders" className="flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>주문 내역</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/my/profile" className="flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>내 정보</span>
                        </Link>
                      </DropdownMenuItem>
                      {session.user.role === "ADMIN" && (
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="flex items-center">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>관리자</span>
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="cursor-pointer text-destructive focus:text-destructive"
                        onSelect={() => signOut()}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>로그아웃</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/auth/signin">로그인</Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href="/auth/signup">회원가입</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Menu Drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-[280px] bg-background shadow-xl transition-transform duration-300 ease-in-out lg:hidden",
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <span className="text-lg font-semibold text-primary">메뉴</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="메뉴 닫기"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "text-primary bg-primary/10"
                      : "text-foreground/70 hover:text-primary hover:bg-primary/5"
                  )}
                >
                  {item.label}
                  <ChevronRight className="h-4 w-4 opacity-50" />
                </Link>
              ))}
              {session?.user?.role === "ADMIN" && (
                <>
                  <div className="my-2 border-t" />
                  <Link
                    href="/memos"
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition-colors",
                      pathname === "/memos"
                        ? "text-blue-600 bg-blue-50"
                        : "text-blue-600 hover:bg-blue-50"
                    )}
                  >
                    메모장
                    <ChevronRight className="h-4 w-4 opacity-50" />
                  </Link>
                  <Link
                    href="/admin"
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition-colors",
                      pathname.startsWith("/admin")
                        ? "text-orange-600 bg-orange-50"
                        : "text-orange-600 hover:bg-orange-50"
                    )}
                  >
                    관리자메뉴
                    <ChevronRight className="h-4 w-4 opacity-50" />
                  </Link>
                </>
              )}
            </div>
          </nav>

          {/* Mobile Auth Section */}
          <div className="p-4 border-t bg-muted/30">
            {session ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-2">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {session.user?.name && (
                      <p className="font-medium truncate">{session.user.name}</p>
                    )}
                    {session.user?.email && (
                      <p className="text-xs text-muted-foreground truncate">
                        {session.user.email}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/my/orders">주문 내역</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/my/profile">내 정보</Link>
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => signOut()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  로그아웃
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Button className="w-full" asChild>
                  <Link href="/auth/signup">회원가입</Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/auth/signin">로그인</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}