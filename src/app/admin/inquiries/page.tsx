"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  MessageSquare, 
  Search, 
  Lock, 
  Eye, 
  Calendar, 
  User,
  ExternalLink,
  Filter,
  Clock
} from "lucide-react"
import { formatDateTime, timeAgo } from "@/lib/helpers"

interface AdminInquiry {
  id: string
  title: string
  content: string
  authorName?: string
  authorEmail?: string
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
  inquiries: AdminInquiry[]
  totalCount: number
  currentPage: number
  totalPages: number
}

export default function AdminInquiriesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [inquiries, setInquiries] = useState<AdminInquiry[]>([])
  const [loading, setLoading] = useState(true)

  // 권한 확인
  useEffect(() => {
    if (status === "loading") return
    
    if (!session?.user) {
      router.push("/auth/signin")
      return
    }

    if (session.user.role !== "ADMIN" && !(session.user as any).canManageInquiry) {
      alert("문의 관리 권한이 없습니다.")
      router.push("/admin")
      return
    }
  }, [session, status, router])
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [filter, setFilter] = useState<'all' | 'private' | 'pending'>('all')

  const fetchInquiries = async (page: number = 1, searchTerm: string = "", filterType: string = 'all') => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "15",
        ...(searchTerm && { search: searchTerm }),
        ...(filterType !== 'all' && { filter: filterType }),
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
    fetchInquiries(currentPage, search, filter)
  }, [currentPage, filter])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchInquiries(1, search, filter)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const getStatusBadge = (inquiry: AdminInquiry) => {
    if (inquiry._count.comments === 0) {
      return <Badge variant="destructive">답변 대기</Badge>
    }
    return <Badge variant="secondary">답변 완료</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">문의 관리</h1>
        <p className="text-muted-foreground">
          사용자 문의를 확인하고 답변을 관리하세요.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">답변 대기</p>
                <p className="text-2xl font-bold">
                  {inquiries.filter(q => q._count.comments === 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Lock className="h-5 w-5 text-red-500" />
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

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-1 space-x-2">
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
            
            <div className="flex space-x-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                size="sm"
              >
                전체
              </Button>
              <Button
                variant={filter === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilter('pending')}
                size="sm"
              >
                답변 대기
              </Button>
              <Button
                variant={filter === 'private' ? 'default' : 'outline'}
                onClick={() => setFilter('private')}
                size="sm"
              >
                비공개
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inquiry List */}
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
            <p className="text-muted-foreground">
              조건에 맞는 문의를 찾을 수 없습니다.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <Card key={inquiry.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold">{inquiry.title}</h3>
                      {inquiry.isPrivate && (
                        <Badge variant="secondary" className="text-xs">
                          <Lock className="h-3 w-3 mr-1" />
                          비공개
                        </Badge>
                      )}
                      {getStatusBadge(inquiry)}
                    </div>
                    
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {inquiry.content.replace(/<[^>]*>/g, "").substring(0, 200)}...
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>
                          {inquiry.author?.name || inquiry.authorName || "익명"}
                          {inquiry.author?.isExpert && (
                            <Badge variant="secondary" className="ml-1 text-xs">전문가</Badge>
                          )}
                        </span>
                      </div>
                      
                      {inquiry.authorEmail && (
                        <div className="flex items-center space-x-1">
                          <span>📧 {inquiry.authorEmail}</span>
                        </div>
                      )}
                      
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
                  
                  <div className="flex space-x-2 ml-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/inquiry/${inquiry.id}`}>
                        <ExternalLink className="h-4 w-4 mr-1" />
                        보기
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
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
  )
}