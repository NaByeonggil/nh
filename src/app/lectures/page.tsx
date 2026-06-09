"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Search, Calendar, Eye, Layers, FileStack } from "lucide-react"
import { formatDate, timeAgo } from "@/lib/helpers"

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "작성중", className: "bg-gray-100 text-gray-600" },
  REVIEWED: { label: "검토됨", className: "bg-blue-50 text-blue-700" },
  FINAL: { label: "최종본", className: "bg-green-50 text-green-700" },
}

interface TopicRef {
  name: string
  slug: string
}

interface LectureItem {
  id: string
  slug: string
  title: string
  date: string
  sequence?: number
  summary?: string
  status: keyof typeof STATUS_LABELS
  viewCount: number
  topics: TopicRef[]
  _count: { revisions: number }
}

interface LectureListResponse {
  lectures: LectureItem[]
  totalCount: number
  currentPage: number
  totalPages: number
}

export default function LecturesPage() {
  const [lectures, setLectures] = useState<LectureItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const fetchLectures = useCallback(async (page: number, searchTerm: string) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        ...(searchTerm && { search: searchTerm }),
      })
      const res = await fetch(`/api/lectures?${params}`)
      if (res.ok) {
        const data: LectureListResponse = await res.json()
        setLectures(data.lectures)
        setCurrentPage(data.currentPage)
        setTotalPages(data.totalPages)
        setTotalCount(data.totalCount)
      }
    } catch (error) {
      console.error("Failed to fetch lectures:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLectures(currentPage, search)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchLectures(1, search)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">전체 강의</h1>
          </div>
          <p className="text-muted-foreground mb-6">
            강의 요약을 날짜순으로 모아봅니다. 주제별 정리는{" "}
            <Link href="/topics" className="text-primary underline">
              주제별 보기
            </Link>
            에서 확인하세요.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex flex-1 max-w-md space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="제목, 요약, 본문으로 검색..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch}>검색</Button>
            </div>
            <Button variant="outline" asChild>
              <Link href="/topics">
                <Layers className="h-4 w-4 mr-1" /> 주제별 보기
              </Link>
            </Button>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-full mb-1" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : lectures.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">강의 노트가 없습니다</h3>
              <p className="text-muted-foreground">아직 등록된 강의 요약이 없습니다.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lectures.map((lecture) => {
              const status = STATUS_LABELS[lecture.status]
              const dateStr = formatDate(new Date(lecture.date))
              return (
                <Card key={lecture.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className={status?.className}>
                        {status?.label}
                      </Badge>
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Eye className="h-3 w-3" />
                        <span>{lecture.viewCount}</span>
                      </div>
                    </div>

                    <CardTitle className="text-lg leading-tight">
                      <Link
                        href={`/lectures/${dateStr}/${lecture.slug}`}
                        className="hover:text-primary transition-colors"
                      >
                        {lecture.sequence ? `${lecture.sequence}강. ` : ""}
                        {lecture.title}
                      </Link>
                    </CardTitle>

                    {lecture.summary && (
                      <CardDescription className="line-clamp-3">
                        {lecture.summary}
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="p-4 pt-0 space-y-3">
                    {lecture.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {lecture.topics.map((t) => (
                          <Link key={t.slug} href={`/topics/${t.slug}`}>
                            <Badge variant="outline" className="text-xs hover:bg-muted">
                              #{t.name}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{dateStr}</span>
                      </div>
                      {lecture._count.revisions > 0 && (
                        <div className="flex items-center space-x-1">
                          <FileStack className="h-4 w-4" />
                          <span>추가본 {lecture._count.revisions}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                이전
              </Button>
              <span className="px-4 text-sm text-muted-foreground">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                다음
              </Button>
            </div>
          </div>
        )}

        {!loading && totalCount > 0 && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            전체 {totalCount}개 강의 · 최근 업데이트{" "}
            {lectures.length > 0 ? timeAgo(new Date(lectures[0].date)) : "-"}
          </p>
        )}
      </div>
    </div>
  )
}
