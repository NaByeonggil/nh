"use client"

import Link from "next/link"
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
import { User, LogOut, Settings, Heart } from "lucide-react"

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-primary">옆집약사</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <Link
                href="/about"
                className="transition-colors hover:text-primary"
              >
                옆집약사 이야기
              </Link>
              <Link
                href="/inquiry"
                className="transition-colors hover:text-primary"
              >
                문의게시판
              </Link>
              <Link
                href="/lifestyle"
                className="transition-colors hover:text-primary"
              >
                생활습관 식이요법
              </Link>
              <Link
                href="/treatment"
                className="transition-colors hover:text-primary"
              >
                표준치료 동향
              </Link>
              <Link
                href="/supplements"
                className="transition-colors hover:text-primary"
              >
                보충제 궁금해요
              </Link>
              <Link
                href="/links"
                className="transition-colors hover:text-primary"
              >
                추천 사이트
              </Link>
              {session?.user?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="transition-colors hover:text-primary text-orange-600 font-semibold"
                >
                  관리자메뉴
                </Link>
              )}
            </nav>
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            <CartButton />
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
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
                    className="cursor-pointer"
                    onSelect={() => signOut()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>로그아웃</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/auth/signin">로그인</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/signup">회원가입</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}