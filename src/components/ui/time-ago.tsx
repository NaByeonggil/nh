"use client"

import { useEffect, useState } from "react"
import { formatDate } from "@/lib/helpers"

interface TimeAgoProps {
  date: Date | string
  className?: string
}

function calculateTimeAgo(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date'
  }
  const now = new Date()
  const diffInMs = now.getTime() - dateObj.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInMinutes < 1) return "방금 전"
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`
  if (diffInHours < 24) return `${diffInHours}시간 전`
  if (diffInDays < 7) return `${diffInDays}일 전`

  return formatDate(date)
}

export function TimeAgo({ date, className }: TimeAgoProps) {
  const [timeAgo, setTimeAgo] = useState<string>("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setTimeAgo(calculateTimeAgo(date))

    // Update every minute
    const interval = setInterval(() => {
      setTimeAgo(calculateTimeAgo(date))
    }, 60000)

    return () => clearInterval(interval)
  }, [date])

  // Server-side: show formatted date (deterministic)
  // Client-side: show relative time
  if (!mounted) {
    return <span className={className}>{formatDate(date)}</span>
  }

  return <span className={className}>{timeAgo}</span>
}
