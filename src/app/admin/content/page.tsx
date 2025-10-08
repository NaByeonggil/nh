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
  Search, 
  Plus, 
  FileText, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  User,
  Heart,
  TrendingUp,
  Book,
  Stethoscope,
  Activity
} from "lucide-react"
import { formatDateTime, timeAgo } from "@/lib/helpers"

interface Content {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  category: "LIFESTYLE" | "TREATMENT" | "NUTRITION" | "GENERAL"
  tags: string[]
  isPublished: boolean
  publishedAt: string | null
  viewCount: number
  likeCount: number
  createdAt: string
  updatedAt: string
  author: {
    id: string
    name: string | null
    email: string
    isExpert: boolean
  }
  _count: {
    comments: number
  }
}

interface ContentStats {
  totalContent: number
  publishedContent: number
  draftContent: number
  totalViews: number
  totalLikes: number
  thisWeekContent: number
}

export default function AdminContentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [contents, setContents] = useState<Content[]>([])
  const [stats, setStats] = useState<ContentStats>({
    totalContent: 0,
    publishedContent: 0,
    draftContent: 0,
    totalViews: 0,
    totalLikes: 0,
    thisWeekContent: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<"all" | "LIFESTYLE" | "TREATMENT" | "NUTRITION" | "GENERAL">("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all")

  // 권한 확인
  useEffect(() => {
    if (status === "loading") return
    
    if (!session?.user) {
      router.push("/auth/signin")
      return
    }

    if (session.user.role !== "ADMIN" && !(session.user as any).canManageContent) {
      alert("컨텐츠 관리 권한이 없습니다.")
      router.push("/admin")
      return
    }
  }, [session, status, router])

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      setLoading(true)
      
      // API에서 콘텐츠 가져오기
      const response = await fetch("/api/content?limit=100")
      if (!response.ok) throw new Error("Failed to fetch content")
      
      const data = await response.json()
      const contentData = data.contents || []
      
      // 데이터 형식 변환
      const formattedContent = contentData.map((item: any) => ({
        ...item,
        isPublished: item.published,
        publishedAt: item.createdAt,
        likeCount: 0,
        slug: item.title.toLowerCase().replace(/\s+/g, '-'),
        tags: [],
        author: {
          id: "admin",
          name: "관리자",
          email: "admin@example.com",
          isExpert: true
        },
        _count: {
          comments: 0
        }
      }))
      
      setContents(formattedContent)
      
      // 통계 계산
      const totalContent = formattedContent.length
      const publishedContent = formattedContent.filter((c: any) => c.published).length
      const draftContent = formattedContent.filter((c: any) => !c.published).length
      const totalViews = formattedContent.reduce((sum: number, c: any) => sum + (c.viewCount || 0), 0)
      const totalLikes = 0
      
      // 이번 주 콘텐츠
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      const thisWeekContent = formattedContent.filter((c: any) => 
        new Date(c.createdAt) >= oneWeekAgo
      ).length
      
      setStats({
        totalContent,
        publishedContent,
        draftContent,
        totalViews,
        totalLikes,
        thisWeekContent
      })
      
      /* 임시 데이터 주석 처리
      const mockContent: Content[] = [{
          id: "1",
          title: "암 환자를 위한 균형 잡힌 식단 가이드",
          slug: "balanced-diet-for-cancer-patients",
          excerpt: "암 치료 중 영양 균형을 유지하는 방법과 권장 식단을 소개합니다.",
          content: "상세 내용...",
          category: "NUTRITION",
          tags: ["식단", "영양", "암치료"],
          isPublished: true,
          publishedAt: "2024-01-10T09:00:00Z",
          viewCount: 1250,
          likeCount: 89,
          createdAt: "2024-01-09T14:30:00Z",
          updatedAt: "2024-01-15T10:20:00Z",
          author: {
            id: "expert1",
            name: "김영양사",
            email: "nutrition@example.com",
            isExpert: true
          },
          _count: { comments: 23 }
        },
        {
          id: "2",
          title: "항암 치료 중 운동의 효과와 주의사항",
          slug: "exercise-during-cancer-treatment",
          excerpt: "항암 치료 중에도 안전하게 할 수 있는 운동과 그 효과에 대해 알아봅시다.",
          content: "상세 내용...",
          category: "LIFESTYLE",
          tags: ["운동", "생활습관", "항암치료"],
          isPublished: true,
          publishedAt: "2024-01-12T11:00:00Z",
          viewCount: 980,
          likeCount: 67,
          createdAt: "2024-01-11T16:45:00Z",
          updatedAt: "2024-01-14T09:15:00Z",
          author: {
            id: "expert2",
            name: "이재활의학과의사",
            email: "rehab@example.com",
            isExpert: true
          },
          _count: { comments: 15 }
        },
        {
          id: "3",
          title: "최신 면역항암제 치료법 동향",
          slug: "latest-immunotherapy-trends",
          excerpt: "최근 개발된 면역항암제들과 그 치료 효과에 대한 최신 정보입니다.",
          content: "상세 내용...",
          category: "TREATMENT",
          tags: ["면역항암제", "치료법", "최신동향"],
          isPublished: false,
          publishedAt: null,
          viewCount: 0,
          likeCount: 0,
          createdAt: "2024-01-14T13:20:00Z",
          updatedAt: "2024-01-15T14:30:00Z",
          author: {
            id: "expert3",
            name: "박종양내과의사",
            email: "oncology@example.com",
            isExpert: true
          },
          _count: { comments: 0 }
        },
        {
          id: "4",
          title: "암 환자 가족을 위한 케어 가이드",
          slug: "caregiver-guide-for-families",
          excerpt: "암 환자를 돌보는 가족들이 알아야 할 케어 방법과 심리적 지원에 대해 다룹니다.",
          content: "상세 내용...",
          category: "GENERAL",
          tags: ["가족케어", "심리지원", "돌봄"],
          isPublished: true,
          publishedAt: "2024-01-13T15:30:00Z",
          viewCount: 750,
          likeCount: 45,
          createdAt: "2024-01-12T10:00:00Z",
          updatedAt: "2024-01-13T16:00:00Z",
          author: {
            id: "expert4",
            name: "정간호사",
            email: "nurse@example.com",
            isExpert: true
          },
          _count: { comments: 18 }
        },
        {
          id: "5",
          title: "보완 대체 요법의 올바른 이해",
          slug: "understanding-complementary-therapies",
          excerpt: "전통 치료와 함께 시행할 수 있는 보완 요법들에 대한 정확한 정보를 제공합니다.",
          content: "상세 내용...",
          category: "TREATMENT",
          tags: ["보완요법", "대체의학", "통합치료"],
          isPublished: true,
          publishedAt: "2024-01-08T08:00:00Z",
          viewCount: 1100,
          likeCount: 72,
          createdAt: "2024-01-07T12:30:00Z",
          updatedAt: "2024-01-08T09:00:00Z",
          author: {
            id: "expert5",
            name: "한한의사",
            email: "oriental@example.com",
            isExpert: true
          },
          _count: { comments: 31 }
        }
      ]}] */
    } catch (error) {
      console.error("Failed to fetch content:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (contentId: string) => {
    if (!confirm("정말 이 콘텐츠를 삭제하시겠습니까?")) return

    try {
      // API 호출로 콘텐츠 삭제
      const response = await fetch(`/api/content/${contentId}`, {
        method: "DELETE"
      })
      
      if (response.ok) {
        setContents(contents.filter(c => c.id !== contentId))
      } else {
        alert("콘텐츠 삭제 중 오류가 발생했습니다.")
      }
    } catch (error) {
      console.error("Failed to delete content:", error)
      alert("콘텐츠 삭제 중 오류가 발생했습니다.")
    }
  }

  const handleTogglePublish = async (contentId: string, isPublished: boolean) => {
    try {
      const response = await fetch(`/api/content/${contentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          isPublished: !isPublished,
          publishedAt: !isPublished ? new Date().toISOString() : null
        })
      })
      
      if (response.ok) {
        setContents(contents.map(c => 
          c.id === contentId 
            ? { 
                ...c, 
                isPublished: !isPublished, 
                publishedAt: !isPublished ? new Date().toISOString() : null 
              } 
            : c
        ))
      } else {
        alert("발행 상태 변경 중 오류가 발생했습니다.")
      }
    } catch (error) {
      console.error("Failed to toggle publish status:", error)
      alert("발행 상태 변경 중 오류가 발생했습니다.")
    }
  }

  const getCategoryText = (category: string) => {
    switch (category) {
      case "LIFESTYLE": return "생활습관"
      case "TREATMENT": return "치료정보"
      case "NUTRITION": return "영양정보"
      case "GENERAL": return "일반정보"
      default: return category
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "LIFESTYLE": return <Activity className="h-4 w-4" />
      case "TREATMENT": return <Stethoscope className="h-4 w-4" />
      case "NUTRITION": return <Book className="h-4 w-4" />
      case "GENERAL": return <FileText className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const filteredContents = contents.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         content.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         content.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = categoryFilter === "all" || content.category === categoryFilter
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "published" && content.isPublished) ||
                         (statusFilter === "draft" && !content.isPublished)
    return matchesSearch && matchesCategory && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">콘텐츠 관리</h1>
          <p className="text-muted-foreground">
            건강 정보 콘텐츠를 작성하고 관리하세요.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/content/new">
            <Plus className="h-4 w-4 mr-2" />
            콘텐츠 작성
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">전체 콘텐츠</p>
                <p className="text-2xl font-bold">{stats.totalContent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">발행됨</p>
                <p className="text-2xl font-bold">{stats.publishedContent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Edit className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">임시저장</p>
                <p className="text-2xl font-bold">{stats.draftContent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">총 조회수</p>
                <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">총 좋아요</p>
                <p className="text-2xl font-bold">{stats.totalLikes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-indigo-500" />
              <div>
                <p className="text-sm font-medium">이번 주</p>
                <p className="text-2xl font-bold">{stats.thisWeekContent}</p>
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
                  placeholder="제목, 내용, 태그로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {["all", "LIFESTYLE", "TREATMENT", "NUTRITION", "GENERAL"].map(category => (
                <Button
                  key={category}
                  variant={categoryFilter === category ? 'default' : 'outline'}
                  onClick={() => setCategoryFilter(category as any)}
                  size="sm"
                >
                  {category === "all" ? "전체" : getCategoryText(category)}
                </Button>
              ))}
            </div>
            
            <div className="flex gap-2">
              {["all", "published", "draft"].map(status => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  onClick={() => setStatusFilter(status as any)}
                  size="sm"
                >
                  {status === "all" ? "전체" : status === "published" ? "발행됨" : "임시저장"}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content List */}
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
      ) : filteredContents.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">콘텐츠가 없습니다</h3>
            <p className="text-muted-foreground mb-4">
              조건에 맞는 콘텐츠를 찾을 수 없습니다.
            </p>
            <Button asChild>
              <Link href="/admin/content/new">
                <Plus className="h-4 w-4 mr-2" />
                첫 콘텐츠 작성하기
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredContents.map((content) => (
            <Card key={content.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold">{content.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {getCategoryIcon(content.category)}
                        <span className="ml-1">{getCategoryText(content.category)}</span>
                      </Badge>
                      {content.isPublished ? (
                        <Badge variant="secondary" className="bg-green-50 text-green-700">발행됨</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-orange-50 text-orange-700">임시저장</Badge>
                      )}
                    </div>
                    
                    <p className="text-muted-foreground text-sm mb-3">
                      {content.excerpt}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{content.author.name}</span>
                        {content.author.isExpert && (
                          <Badge variant="secondary" className="text-xs">전문가</Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {content.isPublished && content.publishedAt 
                            ? `발행: ${timeAgo(new Date(content.publishedAt))}`
                            : `작성: ${timeAgo(new Date(content.createdAt))}`
                          }
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{content.viewCount.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Heart className="h-4 w-4" />
                        <span>{content.likeCount}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <FileText className="h-4 w-4" />
                        <span>{content._count.comments}개 댓글</span>
                      </div>
                    </div>
                    
                    {content.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {content.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={
                          content.category === "LIFESTYLE" ? `/lifestyle/${content.id}` :
                          content.category === "TREATMENT" ? `/treatment/${content.id}` :
                          `/admin/content/${content.id}`
                        } target="_blank">
                          <Eye className="h-4 w-4 mr-1" />
                          보기
                        </Link>
                      </Button>
                      
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/content/${content.id}/edit`}>
                          <Edit className="h-4 w-4 mr-1" />
                          수정
                        </Link>
                      </Button>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant={content.isPublished ? "secondary" : "default"}
                        size="sm"
                        onClick={() => handleTogglePublish(content.id, content.isPublished)}
                      >
                        {content.isPublished ? "발행 취소" : "발행"}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(content.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}