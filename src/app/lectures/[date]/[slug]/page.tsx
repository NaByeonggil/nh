"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  BookOpen,
  Calendar,
  Eye,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  FileStack,
} from "lucide-react"
import { formatDate } from "@/lib/helpers"
import { markdownToHtml } from "@/lib/markdown"

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "작성중", className: "bg-gray-100 text-gray-600" },
  REVIEWED: { label: "검토됨", className: "bg-blue-50 text-blue-700" },
  FINAL: { label: "최종본", className: "bg-green-50 text-green-700" },
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"]

interface Revision {
  id: string
  note: string
  createdAt: string
}

interface Lecture {
  id: string
  slug: string
  title: string
  date: string
  sequence?: number
  summary?: string
  body?: string
  status: keyof typeof STATUS_LABELS
  viewCount: number
  keyPoints: string[]
  tags: string[]
  questions: string[]
  topics: { name: string; slug: string }[]
  revisions: Revision[]
}

export default function LectureDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [lecture, setLecture] = useState<Lecture | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const fetchLecture = async () => {
      try {
        const res = await fetch(`/api/lectures/${slug}`)
        if (res.ok) {
          setLecture(await res.json())
        } else {
          setNotFound(true)
        }
      } catch (error) {
        console.error("Failed to fetch lecture:", error)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    fetchLecture()
  }, [slug])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-2/3" />
          <div className="h-4 bg-muted rounded w-1/3" />
          <div className="h-40 bg-muted rounded" />
        </div>
      </div>
    )
  }

  if (notFound || !lecture) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-3xl text-center">
        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-xl font-semibold mb-2">강의 노트를 찾을 수 없습니다</h1>
        <Button asChild className="mt-4">
          <Link href="/lectures">전체 강의로 돌아가기</Link>
        </Button>
      </div>
    )
  }

  const status = STATUS_LABELS[lecture.status]
  const dateObj = new Date(lecture.date)
  const weekday = WEEKDAYS[dateObj.getDay()]

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/lectures">
          <ArrowLeft className="h-4 w-4 mr-1" /> 전체 강의
        </Link>
      </Button>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary" className={status?.className}>
            {status?.label}
          </Badge>
          {lecture.topics.map((t) => (
            <Link key={t.slug} href={`/topics/${t.slug}`}>
              <Badge variant="outline" className="hover:bg-muted">
                #{t.name}
              </Badge>
            </Link>
          ))}
        </div>

        <h1 className="text-3xl font-bold mb-3">
          {lecture.sequence ? `${lecture.sequence}강. ` : ""}
          {lecture.title}
        </h1>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {formatDate(dateObj)} ({weekday})
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {lecture.viewCount}
          </span>
        </div>
      </div>

      {lecture.summary && (
        <Card className="mb-6 bg-muted/40">
          <CardContent className="p-4">
            <p className="text-sm leading-relaxed">{lecture.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Key points */}
      {lecture.keyPoints.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" /> 핵심 포인트
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {lecture.keyPoints.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Body */}
      {lecture.body && (
        <div
          className="prose prose-sm max-w-none mb-6 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: markdownToHtml(lecture.body) }}
        />
      )}

      {/* Questions */}
      {lecture.questions.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-amber-600" /> 추가 확인할 질문
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {lecture.questions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Revisions (추가본) */}
      {lecture.revisions.length > 0 && (
        <>
          <Separator className="my-6" />
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
            <FileStack className="h-5 w-5 text-primary" /> 추가본 ({lecture.revisions.length})
          </h2>
          <div className="space-y-3">
            {lecture.revisions.map((rev, i) => (
              <Card key={rev.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">
                    추가본 #{i + 1} · {formatDate(new Date(rev.createdAt))}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm whitespace-pre-wrap leading-relaxed">
                  {rev.note}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Tags */}
      {lecture.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-8">
          {lecture.tags.map((tag, i) => (
            <Badge key={i} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
