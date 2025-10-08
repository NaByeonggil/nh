"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  MessageSquare, 
  FileText, 
  Package, 
  TrendingUp,
  Clock,
  Eye,
  Activity
} from "lucide-react"

interface DashboardStats {
  totalUsers: number
  totalInquiries: number
  pendingInquiries: number
  totalContent: number
  totalProducts: number
  recentActivity: ActivityItem[]
}

interface ActivityItem {
  id: string
  type: 'inquiry' | 'user' | 'content'
  title: string
  timestamp: string
  user?: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      // 임시 데이터 - 실제로는 API에서 가져와야 함
      const mockStats: DashboardStats = {
        totalUsers: 247,
        totalInquiries: 89,
        pendingInquiries: 12,
        totalContent: 34,
        totalProducts: 156,
        recentActivity: [
          {
            id: "1",
            type: "inquiry",
            title: "새로운 문의: 항암 치료 관련 질문",
            timestamp: "2024-01-15T10:30:00Z",
            user: "김○○"
          },
          {
            id: "2", 
            type: "user",
            title: "새 사용자 가입",
            timestamp: "2024-01-15T09:15:00Z",
            user: "이○○"
          },
          {
            id: "3",
            type: "content",
            title: "생활습관 가이드 업데이트",
            timestamp: "2024-01-15T08:45:00Z",
            user: "관리자"
          },
          {
            id: "4",
            type: "inquiry",
            title: "새로운 문의: 부작용 관련 상담",
            timestamp: "2024-01-14T16:20:00Z",
            user: "박○○"
          },
          {
            id: "5",
            type: "user",
            title: "새 사용자 가입",
            timestamp: "2024-01-14T14:30:00Z",
            user: "최○○"
          }
        ]
      }
      
      setStats(mockStats)
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'inquiry':
        return <MessageSquare className="h-4 w-4 text-blue-500" />
      case 'user':
        return <Users className="h-4 w-4 text-green-500" />
      case 'content':
        return <FileText className="h-4 w-4 text-purple-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'inquiry':
        return <Badge variant="secondary" className="bg-blue-50 text-blue-700">문의</Badge>
      case 'user':
        return <Badge variant="secondary" className="bg-green-50 text-green-700">사용자</Badge>
      case 'content':
        return <Badge variant="secondary" className="bg-purple-50 text-purple-700">컨텐츠</Badge>
      default:
        return <Badge variant="secondary">기타</Badge>
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return `${diffInMinutes}분 전`
    } else if (diffInHours < 24) {
      return `${diffInHours}시간 전`
    } else {
      return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">대시보드</h1>
          <p className="text-muted-foreground">
            옆집약사 관리자 대시보드에 오신 것을 환영합니다.
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">데이터를 불러올 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">대시보드</h1>
        <p className="text-muted-foreground">
          옆집약사 관리자 대시보드에 오신 것을 환영합니다.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 사용자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              전월 대비 +12%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 문의</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInquiries}</div>
            <p className="text-xs text-muted-foreground">
              <Clock className="inline h-3 w-3 mr-1" />
              답변 대기: {stats.pendingInquiries}개
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">컨텐츠</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContent}</div>
            <p className="text-xs text-muted-foreground">
              <Eye className="inline h-3 w-3 mr-1" />
              게시된 글
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">상품</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              등록된 상품
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
            <CardDescription>
              최근 사이트에서 일어난 활동들을 확인하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      {getActivityBadge(activity.type)}
                      <span className="text-sm text-muted-foreground">
                        {formatTime(activity.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm font-medium truncate">
                      {activity.title}
                    </p>
                    {activity.user && (
                      <p className="text-xs text-muted-foreground">
                        사용자: {activity.user}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>빠른 액션</CardTitle>
            <CardDescription>
              자주 사용하는 관리 기능들
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <Card className="p-3 hover:bg-muted/50 cursor-pointer transition-colors">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">답변 대기 문의</p>
                    <p className="text-xs text-muted-foreground">
                      {stats.pendingInquiries}개의 문의가 답변을 기다리고 있습니다
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-3 hover:bg-muted/50 cursor-pointer transition-colors">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">신규 사용자</p>
                    <p className="text-xs text-muted-foreground">
                      오늘 5명의 새로운 사용자가 가입했습니다
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-3 hover:bg-muted/50 cursor-pointer transition-colors">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium">컨텐츠 관리</p>
                    <p className="text-xs text-muted-foreground">
                      새로운 건강 정보를 게시하세요
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}