"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Stethoscope, Search, Calendar, Eye, TrendingUp } from "lucide-react"
import { formatDateTime, timeAgo, extractExcerpt } from "@/lib/helpers"
import { CONTENT_CATEGORIES } from "@/lib/constants"

interface ContentItem {
  id: string
  title: string
  excerpt?: string
  thumbnail?: string
  category: string
  published: boolean
  viewCount: number
  createdAt: string
  updatedAt: string
}

interface ContentListResponse {
  contents: ContentItem[]
  totalCount: number
  currentPage: number
  totalPages: number
}

export default function TreatmentPage() {
  const [contents, setContents] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const fetchContents = async (page: number = 1, searchTerm: string = "") => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        category: "TREATMENT",
        published: "true",
        ...(searchTerm && { search: searchTerm }),
      })

      const response = await fetch(`/api/content?${params}`)
      if (response.ok) {
        const data: ContentListResponse = await response.json()
        setContents(data.contents)
        setCurrentPage(data.currentPage)
        setTotalPages(data.totalPages)
        setTotalCount(data.totalCount)
      }
    } catch (error) {
      console.error("Failed to fetch contents:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContents(currentPage, search)
  }, [currentPage])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchContents(1, search)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Stethoscope className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">표준치료 동향</h1>
          </div>
          <p className="text-muted-foreground mb-6">
            최신 암 치료 동향과 표준 치료법에 대한 정보를 제공합니다.
            의학계의 새로운 연구 결과와 임상 가이드라인을 확인하세요.
          </p>

          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex flex-1 max-w-md space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="제목, 내용으로 검색..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch}>검색</Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Stethoscope className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">치료 정보</p>
                  <p className="text-2xl font-bold">{totalCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">총 조회수</p>
                  <p className="text-2xl font-bold">
                    {contents.reduce((sum, c) => sum + c.viewCount, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">최신 업데이트</p>
                  <p className="text-sm font-bold">
                    {contents.length > 0 ? timeAgo(new Date(contents[0].createdAt)) : "없음"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <div className="aspect-video bg-muted animate-pulse"></div>
                <CardContent className="p-4">
                  <div className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-full mb-1"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : contents.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">컨텐츠가 없습니다</h3>
              <p className="text-muted-foreground">
                아직 게시된 치료 정보가 없습니다.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contents.map((content) => (
              <Card key={content.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                {/* Thumbnail */}
                <div className="aspect-video relative bg-muted">
                  {content.thumbnail ? (
                    <Image
                      src={content.thumbnail}
                      alt={content.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Stethoscope className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                      {CONTENT_CATEGORIES[content.category as keyof typeof CONTENT_CATEGORIES]}
                    </Badge>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Eye className="h-3 w-3" />
                      <span>{content.viewCount}</span>
                    </div>
                  </div>
                  
                  <CardTitle className="text-lg leading-tight">
                    <Link 
                      href={`/treatment/${content.id}`}
                      className="hover:text-primary transition-colors"
                    >
                      {content.title}
                    </Link>
                  </CardTitle>
                  
                  {content.excerpt && (
                    <CardDescription className="line-clamp-3">
                      {content.excerpt}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="p-4 pt-0">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{timeAgo(new Date(content.createdAt))}</span>
                    </div>
                    
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/treatment/${content.id}`}>
                        자세히 보기
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                이전
              </Button>
              
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 2 && page <= currentPage + 2)
                ) {
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  )
                } else if (
                  page === currentPage - 3 ||
                  page === currentPage + 3
                ) {
                  return <span key={page} className="px-2">...</span>
                }
                return null
              })}
              
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
      </div>
    </div>
  )
}