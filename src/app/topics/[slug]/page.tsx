"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Layers, BookOpen, Calendar, Eye, ArrowLeft } from "lucide-react"
import { formatDate } from "@/lib/helpers"

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "작성중", className: "bg-gray-100 text-gray-600" },
  REVIEWED: { label: "검토됨", className: "bg-blue-50 text-blue-700" },
  FINAL: { label: "최종본", className: "bg-green-50 text-green-700" },
}

interface LectureRef {
  id: string
  slug: string
  title: string
  date: string
  sequence?: number
  summary?: string
  status: keyof typeof STATUS_LABELS
  viewCount: number
}

interface Topic {
  id: string
  slug: string
  name: string
  overview?: string
  lectures: LectureRef[]
}

export default function TopicHubPage() {
  const params = useParams()
  const slug = params.slug as string
  const [topic, setTopic] = useState<Topic | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const res = await fetch(`/api/topics/${slug}`)
        if (res.ok) {
          setTopic(await res.json())
        } else {
          setNotFound(true)
        }
      } catch (error) {
        console.error("Failed to fetch topic:", error)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    fetchTopic()
  }, [slug])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/2" />
          <div className="h-24 bg-muted rounded" />
        </div>
      </div>
    )
  }

  if (notFound || !topic) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl text-center">
        <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-xl font-semibold mb-2">주제를 찾을 수 없습니다</h1>
        <Button asChild className="mt-4">
          <Link href="/topics">주제별 보기로 돌아가기</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/topics">
          <ArrowLeft className="h-4 w-4 mr-1" /> 주제별 보기
        </Link>
      </Button>

      <div className="flex items-center gap-3 mb-2">
        <Layers className="h-7 w-7 text-primary" />
        <h1 className="text-3xl font-bold">{topic.name}</h1>
        <Badge variant="secondary" className="flex items-center gap-1">
          <BookOpen className="h-3 w-3" />
          {topic.lectures.length}
        </Badge>
      </div>

      {/* 주제 통합본 */}
      {topic.overview && (
        <Card className="my-6 bg-muted/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">주제 통합본</CardTitle>
          </CardHeader>
          <CardContent className="text-sm whitespace-pre-wrap leading-relaxed">
            {topic.overview}
          </CardContent>
        </Card>
      )}

      <Separator className="my-6" />

      <h2 className="text-lg font-semibold mb-4">관련 강의 노트</h2>

      {topic.lectures.length === 0 ? (
        <p className="text-muted-foreground">이 주제에 연결된 강의가 아직 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {topic.lectures.map((lecture) => {
            const status = STATUS_LABELS[lecture.status]
            const dateStr = formatDate(new Date(lecture.date))
            return (
              <Link
                key={lecture.id}
                href={`/lectures/${dateStr}/${lecture.slug}`}
                className="block"
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className={`text-xs ${status?.className}`}>
                            {status?.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {dateStr}
                          </span>
                        </div>
                        <h3 className="font-medium truncate">
                          {lecture.sequence ? `${lecture.sequence}강. ` : ""}
                          {lecture.title}
                        </h3>
                        {lecture.summary && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {lecture.summary}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                        <Eye className="h-3 w-3" />
                        {lecture.viewCount}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
