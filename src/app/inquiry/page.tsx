"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Search, Lock, Eye, Calendar, User, PenTool } from "lucide-react"
import { formatDateTime, timeAgo } from "@/lib/helpers"

interface Inquiry {
  id: string
  title: string
  content: string
  authorName?: string
  isPrivate: boolean
  viewCount: number
  createdAt: string
  author?: {
    id: string
    name: string
    isExpert: boolean
  }
  _count: {
    comments: number
  }
}

interface InquiryListResponse {
  inquiries: Inquiry[]
  totalCount: number
  currentPage: number
  totalPages: number
}

export default function InquiryPage() {
  const { data: session } = useSession()
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const fetchInquiries = async (page: number = 1, searchTerm: string = "") => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
      })

      const response = await fetch(`/api/inquiries?${params}`)
      if (response.ok) {
        const data: InquiryListResponse = await response.json()
        setInquiries(data.inquiries)
        setCurrentPage(data.currentPage)
        setTotalPages(data.totalPages)
        setTotalCount(data.totalCount)
      }
    } catch (error) {
      console.error("Failed to fetch inquiries:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInquiries(currentPage, search)
  }, [currentPage])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchInquiries(1, search)
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
            <MessageSquare className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">문의게시판</h1>
          </div>
          <p className="text-muted-foreground mb-6">
            전문가와 직접 상담하고 궁금한 점을 해결하세요. 개인적인 문의는 암호를 설정하여 보호할 수 있습니다.
          </p>

          {/* Search & Create */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 max-w-md space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="제목, 내용, 작성자로 검색..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch}>검색</Button>
            </div>
            
            <Button asChild>
              <Link href="/inquiry/new">
                <PenTool className="h-4 w-4 mr-2" />
                문의하기
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">전체 문의</p>
                  <p className="text-2xl font-bold">{totalCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Lock className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">비공개 문의</p>
                  <p className="text-2xl font-bold">
                    {inquiries.filter(q => q.isPrivate).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">총 조회수</p>
                  <p className="text-2xl font-bold">
                    {inquiries.reduce((sum, q) => sum + q.viewCount, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inquiry List */}
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : inquiries.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">문의가 없습니다</h3>
                <p className="text-muted-foreground mb-4">
                  첫 번째 문의를 작성해보세요.
                </p>
                <Button asChild>
                  <Link href="/inquiry/new">문의하기</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            inquiries.map((inquiry) => (
              <Card key={inquiry.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Link 
                          href={`/inquiry/${inquiry.id}`}
                          className="text-lg font-semibold hover:text-primary transition-colors"
                        >
                          {inquiry.title}
                        </Link>
                        {inquiry.isPrivate && (
                          <Badge variant="secondary" className="text-xs">
                            <Lock className="h-3 w-3 mr-1" />
                            비공개
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                        {inquiry.content.replace(/<[^>]*>/g, "").substring(0, 150)}...
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>
                            {inquiry.author?.name || inquiry.authorName || "익명"}
                            {inquiry.author?.isExpert && (
                              <Badge variant="secondary" className="ml-1 text-xs">전문가</Badge>
                            )}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{timeAgo(new Date(inquiry.createdAt))}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{inquiry._count.comments}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{inquiry.viewCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

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