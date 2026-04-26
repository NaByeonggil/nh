"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

// 세션 ID 생성 또는 가져오기
function getSessionId(): string {
  if (typeof window === "undefined") return ""

  let sessionId = sessionStorage.getItem("visitor_session_id")
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
    sessionStorage.setItem("visitor_session_id", sessionId)
  }
  return sessionId
}

export function PageViewTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // 관리자 페이지는 추적하지 않음
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) {
      return
    }

    const sessionId = getSessionId()

    // 페이지뷰 기록
    fetch("/api/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        sessionId
      })
    }).catch(console.error)
  }, [pathname])

  return null
}
