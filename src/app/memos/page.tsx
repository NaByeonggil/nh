"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Edit, Trash2, StickyNote, Eye } from "lucide-react"

type MemoCategory = "YOUTUBE" | "IT" | "HEALTH_SUPPLEMENT" | "PHARMACY" | "ETC"

interface Memo {
  id: string
  title: string
  content: string
  category: MemoCategory
  createdAt: string
  updatedAt: string
  author: {
    id: string
    name: string | null
    email: string
  }
}

const CATEGORIES = {
  ALL: { label: "전체", value: "" },
  YOUTUBE: { label: "유튜브 관련", value: "YOUTUBE" },
  IT: { label: "IT 관련", value: "IT" },
  HEALTH_SUPPLEMENT: { label: "건강기능식품외 관련", value: "HEALTH_SUPPLEMENT" },
  PHARMACY: { label: "약학 관련", value: "PHARMACY" },
  ETC: { label: "기타", value: "ETC" },
} as const

export default function MemosPage() {
  const router = useRouter()
  const [memos, setMemos] = useState<Memo[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchMemos()
  }, [page, search, category])

  const fetchMemos = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(search && { search }),
        ...(category && { category }),
      })

      const response = await fetch(`/api/admin/memos?${params}`)
      if (response.ok) {
        const data = await response.json()
        setMemos(data.memos)
        setTotalPages(data.pagination.totalPages)
        setTotal(data.pagination.total)
      }
    } catch (error) {
      console.error("메모 목록 조회 오류:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" 메모를 삭제하시겠습니까?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/memos/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        alert("메모가 삭제되었습니다.")
        fetchMemos()
      } else {
        alert("메모 삭제에 실패했습니다.")
      }
    } catch (error) {
      console.error("메모 삭제 오류:", error)
      alert("메모 삭제에 실패했습니다.")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-muted-foreground">
            총 {total}개의 메모
          </p>
        </div>
        <Button asChild>
          <Link href="/memos/new">
            <Plus className="mr-2 h-4 w-4" />
            새 메모
          </Link>
        </Button>
      </div>

      {/* 검색 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="제목 또는 내용으로 검색..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 카테고리 탭 */}
      <Tabs value={category} onValueChange={(value) => {
        setCategory(value)
        setPage(1)
      }}>
        <TabsList className="grid w-full grid-cols-6">
          {Object.values(CATEGORIES).map((cat) => (
            <TabsTrigger key={cat.value} value={cat.value}>
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* 메모 목록 */}
      <div className="grid gap-4">
        {memos.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <StickyNote className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {search ? "검색 결과가 없습니다." : "메모가 없습니다."}
              </p>
            </CardContent>
          </Card>
        ) : (
          memos.map((memo) => (
            <Card key={memo.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link href={`/memos/${memo.id}`}>
                      <CardTitle className="text-lg mb-2 hover:text-primary cursor-pointer transition-colors">
                        {memo.title}
                      </CardTitle>
                    </Link>
                    <CardDescription className="whitespace-pre-wrap">
                      {memo.content.substring(0, 200)}
                      {memo.content.length > 200 && "..."}
                    </CardDescription>
                    <div className="mt-3 text-xs text-muted-foreground">
                      <span>작성자: {memo.author.name || memo.author.email}</span>
                      <span className="mx-2">•</span>
                      <span>작성일: {formatDate(memo.createdAt)}</span>
                      {memo.updatedAt !== memo.createdAt && (
                        <>
                          <span className="mx-2">•</span>
                          <span>수정일: {formatDate(memo.updatedAt)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => router.push(`/memos/${memo.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      보기
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/memos/${memo.id}/edit`)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      수정
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(memo.id, memo.title)}
                    >
                      <Trash2 className="h-4 w-4 mr-1 text-destructive" />
                      삭제
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            이전
          </Button>
          <span className="flex items-center px-4">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            다음
          </Button>
        </div>
      )}
    </div>
  )
}
