"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Heart, Mail, Phone, Clock, ChevronUp, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const quickLinks = [
  { href: "/about", label: "옆집약사 이야기" },
  { href: "/inquiry", label: "문의게시판" },
  { href: "/lifestyle", label: "생활습관 식이요법" },
  { href: "/treatment", label: "표준치료 동향" },
]

const moreLinks = [
  { href: "/supplements", label: "보충제 궁금해요" },
  { href: "/products", label: "추천제품" },
  { href: "/links", label: "추천 사이트" },
]

export function Footer() {
  const [contactInfo, setContactInfo] = useState({
    email: "contact@neighbor-pharmacist.com",
    phone: "02-1234-5678",
    consultingHours: "평일 09:00 - 18:00"
  })
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    fetchContactInfo()

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const fetchContactInfo = async () => {
    try {
      const response = await fetch('/api/admin/contact')
      if (response.ok) {
        const data = await response.json()
        setContactInfo({
          email: data.email || "contact@neighbor-pharmacist.com",
          phone: data.phone || "02-1234-5678",
          consultingHours: data.consultingHours || "평일 09:00 - 18:00"
        })
      }
    } catch (error) {
      console.error('Contact info fetch error:', error)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <>
      <footer className="border-t bg-gray-50">
        {/* Main Footer */}
        <div className="container mx-auto px-4 py-10 md:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
            {/* Logo & Description - Full width on mobile */}
            <div className="col-span-2 md:col-span-1 lg:col-span-1">
              <Link href="/" className="inline-flex items-center space-x-2 mb-4 group">
                <Heart className="h-7 w-7 text-primary transition-transform group-hover:scale-110" />
                <span className="text-xl font-bold text-primary">옆집약사</span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">
                암환자의 생활습관, 식이요법, 최신 치료정보를 제공하는 전문 플랫폼입니다.
              </p>
            </div>

            {/* Quick Links */}
            <div className="col-span-1">
              <h3 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">
                바로가기
              </h3>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group"
                    >
                      {link.label}
                      <ExternalLink className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* More Links */}
            <div className="col-span-1">
              <h3 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">
                서비스
              </h3>
              <ul className="space-y-3">
                {moreLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group"
                    >
                      {link.label}
                      <ExternalLink className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div className="col-span-2 md:col-span-1">
              <h3 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">
                연락처
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                  <a
                    href={`mailto:${contactInfo.email}`}
                    className="hover:text-primary transition-colors break-all"
                  >
                    {contactInfo.email}
                  </a>
                </li>
                <li className="flex items-start gap-3 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                  <a
                    href={`tel:${contactInfo.phone}`}
                    className="hover:text-primary transition-colors"
                  >
                    {contactInfo.phone}
                  </a>
                </li>
                <li className="flex items-start gap-3 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>{contactInfo.consultingHours}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t bg-gray-100/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-xs text-muted-foreground text-center sm:text-left">
                © {new Date().getFullYear()} 옆집약사. All rights reserved.
              </p>
              <div className="flex items-center gap-4 sm:gap-6">
                <Link
                  href="/privacy"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  개인정보처리방침
                </Link>
                <span className="text-muted-foreground/30">|</span>
                <Link
                  href="/terms"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  이용약관
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <Button
        variant="secondary"
        size="icon"
        className={cn(
          "fixed bottom-6 right-6 z-40 h-11 w-11 rounded-full shadow-lg transition-all duration-300",
          "bg-white hover:bg-gray-50 border border-gray-200",
          showScrollTop
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
        onClick={scrollToTop}
        aria-label="맨 위로"
      >
        <ChevronUp className="h-5 w-5 text-gray-600" />
      </Button>
    </>
  )
}