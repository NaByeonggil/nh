"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  Plus,
  Search,
  Pencil,
  Trash2,
  Calendar,
  Eye,
  FileStack,
} from "lucide-react"
import { formatDate } from "@/lib/helpers"

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "작성중", className: "bg-gray-100 text-gray-600" },
  REVIEWED: { label: "검토됨", className: "bg-blue-50 text-blue-700" },
  FINAL: { label: "최종본", className: "bg-green-50 text-green-700" },
}

interface LectureItem {
  id: string
  slug: string
  title: string
  date: string
  sequence?: number
  status: keyof typeof STATUS_LABELS
  viewCount: number
  topics: { name: string; slug: string }[]
  _count: { revisions: number }
}

export default function AdminLecturesPage() {
  const [lectures, setLectures] = useState<LectureItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [totalCount, setTotalCount] = useState(0)

  const fetchLectures = useCallback(async (searchTerm: string) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        limit: "100",
        status: "all",
        ...(searchTerm && { search: searchTerm }),
      })
      const res = await fetch(`/api/lectures?${params}`)
      if (res.ok) {
        const data = await res.json()
        setLectures(data.lectures)
        setTotalCount(data.totalCount)
      }
    } catch (e) {
      console.error("Failed to fetch lectures:", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLectures("")
  }, [fetchLectures])

  const handleDelete = async (lecture: LectureItem) => {
    if (!confirm(`"${lecture.title}" 강의 노트를 삭제할까요? 추가본도 함께 삭제됩니다.`)) return
    try {
      const res = await fetch(`/api/lectures/${lecture.id}`, { method: "DELETE" })
      if (res.ok) {
        setLectures((prev) => prev.filter((l) => l.id !== lecture.id))
        setTotalCount((c) => c - 1)
      } else {
        const data = await res.json().catch(() => ({}))
        alert(data.error || "삭제 중 오류가 발생했습니다.")
      }
    } catch (e) {
      console.error("Delete error:", e)
      alert("삭제 중 오류가 발생했습니다.")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <BookOpen className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">강의 요약 관리</h1>
            <p className="text-muted-foreground">전체 {totalCount}개 강의 노트</p>
          </div>
        </div>
        <Button asChild>
          <Link href="/admin/lectures/new">
            <Plus className="h-4 w-4 mr-2" />새 강의 작성
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="flex max-w-md space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="제목, 요약, 본문으로 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && fetchLectures(search)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={() => fetchLectures(search)}>
          검색
        </Button>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-muted-foreground animate-pulse">로딩 중...</div>
      ) : lectures.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">강의 노트가 없습니다</h3>
            <p className="text-muted-foreground mb-4">
              첫 강의 요약을 작성해보세요.
            </p>
            <Button asChild>
              <Link href="/admin/lectures/new">
                <Plus className="h-4 w-4 mr-2" />새 강의 작성
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {lectures.map((lecture) => {
            const status = STATUS_LABELS[lecture.status]
            return (
              <Card key={lecture.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="secondary" className={`text-xs ${status?.className}`}>
                          {status?.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(new Date(lecture.date))}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {lecture.viewCount}
                        </span>
                        {lecture._count.revisions > 0 && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <FileStack className="h-3 w-3" />
                            추가본 {lecture._count.revisions}
                          </span>
                        )}
                      </div>
                      <h3 className="font-medium truncate">
                        {lecture.sequence ? `${lecture.sequence}강. ` : ""}
                        {lecture.title}
                      </h3>
                      {lecture.topics.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {lecture.topics.map((t) => (
                            <Badge key={t.slug} variant="outline" className="text-xs">
                              #{t.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/lectures/${lecture.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(lecture)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
