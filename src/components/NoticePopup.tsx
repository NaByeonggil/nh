"use client"

import { useState, useEffect } from "react"
import { X, Bell } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

interface Notice {
  id: string
  title: string
  content: string
  important: boolean
  popupShowOnce: boolean
}

export default function NoticePopup() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [showPopups, setShowPopups] = useState<{ [key: string]: boolean }>({})
  const [dontShowToday, setDontShowToday] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    fetchPopupNotices()
  }, [])

  const fetchPopupNotices = async () => {
    try {
      const response = await fetch('/api/notices?popup=true')
      if (response.ok) {
        const data: Notice[] = await response.json()

        // 숨김 처리된 공지사항 확인
        const hiddenNotices = JSON.parse(localStorage.getItem('hiddenNotices') || '{}')
        const now = new Date().toDateString()

        const visibleNotices = data.filter(notice => {
          const hiddenDate = hiddenNotices[notice.id]
          // 오늘 숨김 처리되지 않았거나, 숨김 날짜가 오늘이 아닌 경우만 표시
          return !hiddenDate || hiddenDate !== now
        }).slice(0, 10) // 최대 10개까지만 표시

        setNotices(visibleNotices)

        // 모든 공지사항을 표시 상태로 설정
        const initialShowState: { [key: string]: boolean } = {}
        visibleNotices.forEach(notice => {
          initialShowState[notice.id] = true
        })
        setShowPopups(initialShowState)
      }
    } catch (error) {
      console.error('팝업 공지사항 조회 실패:', error)
    }
  }

  const handleClose = (noticeId: string) => {
    // "하루동안 보지 않기"가 체크된 경우
    if (dontShowToday[noticeId]) {
      const hiddenNotices = JSON.parse(localStorage.getItem('hiddenNotices') || '{}')
      hiddenNotices[noticeId] = new Date().toDateString()
      localStorage.setItem('hiddenNotices', JSON.stringify(hiddenNotices))
    }

    // 팝업 닫기
    setShowPopups(prev => ({
      ...prev,
      [noticeId]: false
    }))
  }

  // 표시할 공지사항이 없으면 렌더링하지 않음
  if (notices.length === 0 || Object.values(showPopups).every(show => !show)) {
    return null
  }

  // 현재 표시 중인 공지사항 개수
  const visibleCount = notices.filter(notice => showPopups[notice.id]).length

  // 공지사항 개수에 따른 그리드 스타일 설정
  const getGridClass = () => {
    if (visibleCount === 1) {
      return "grid gap-4 max-w-2xl w-full" // 1개: 중앙에 적당한 크기로
    } else if (visibleCount === 2) {
      return "grid gap-4 max-w-5xl w-full grid-cols-1 md:grid-cols-2" // 2개: 중간 화면 이상에서 2열
    } else if (visibleCount <= 3) {
      return "grid gap-4 max-w-6xl w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3" // 3개: 반응형 그리드
    } else {
      return "grid gap-4 max-w-7xl w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" // 4개 이상: 최대 4열
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className={`${getGridClass()} max-h-[90vh] md:max-h-[85vh]`}>
        {notices.map((notice, index) =>
          showPopups[notice.id] && (
            <Card
              key={notice.id}
              className="relative animate-in fade-in slide-in-from-bottom-4 flex flex-col w-full max-w-[90vw] md:max-w-none mx-auto"
              style={{
                animationDelay: `${index * 100}ms`,
                aspectRatio: visibleCount === 1 ? '3/4' : 'auto'
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Bell className="h-5 w-5 text-primary flex-shrink-0" />
                    <CardTitle className="text-lg truncate">{notice.title}</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 flex-shrink-0"
                    onClick={() => handleClose(notice.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col overflow-y-auto">
                <CardDescription className="whitespace-pre-wrap text-base flex-1 overflow-y-auto">
                  {notice.content}
                </CardDescription>

                {notice.popupShowOnce && (
                  <div className="flex items-center space-x-2 pt-2 border-t mt-auto">
                    <Checkbox
                      id={`dont-show-${notice.id}`}
                      checked={dontShowToday[notice.id] || false}
                      onCheckedChange={(checked) =>
                        setDontShowToday(prev => ({
                          ...prev,
                          [notice.id]: checked as boolean
                        }))
                      }
                    />
                    <label
                      htmlFor={`dont-show-${notice.id}`}
                      className="text-sm text-muted-foreground cursor-pointer select-none"
                    >
                      하루동안 보지 않기
                    </label>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  )
}
