"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  MessageSquare,
  FileText,
  Package,
  TrendingUp,
  Clock,
  Eye,
  Activity,
  Wifi,
  Calendar,
  BarChart3
} from "lucide-react"

interface DashboardStats {
  totalUsers: number
  totalInquiries: number
  pendingInquiries: number
  totalContent: number
  totalProducts: number
  inStockProducts: number
  todayUsersCount: number
  recentActivity: ActivityItem[]
}

interface ActivityItem {
  id: string
  type: 'inquiry' | 'user' | 'content'
  title: string
  timestamp: string
  user?: string
}

interface AnalyticsData {
  realtime: { visitors: number }
  today: { visitors: number; pageviews: number }
  week: { visitors: number; pageviews: number }
  month: { visitors: number; pageviews: number }
  dailyStats: { date: string; visitors: number; pageviews: number }[]
  popularPages: { path: string; count: number }[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics')
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    }
  }

  useEffect(() => {
    Promise.all([fetchStats(), fetchAnalytics()]).finally(() => setLoading(false))

    // 실시간 접속자는 30초마다 갱신
    const interval = setInterval(fetchAnalytics, 30000)
    return () => clearInterval(interval)
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

  const getPageName = (path: string) => {
    const pageNames: Record<string, string> = {
      '/': '홈페이지',
      '/lifestyle': '생활습관 식이요법',
      '/treatment': '표준치료 동향',
      '/inquiry': '문의 게시판',
      '/supplements': '영양제 추천',
      '/about': '소개',
    }
    return pageNames[path] || path
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">대시보드</h1>
        <p className="text-muted-foreground">
          옆집약사 관리자 대시보드에 오신 것을 환영합니다.
        </p>
      </div>

      {/* 실시간 접속자 배너 */}
      {analytics && (
        <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Wifi className="h-8 w-8" />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                  </span>
                </div>
                <div>
                  <p className="text-sm opacity-90">실시간 접속자</p>
                  <p className="text-3xl font-bold">{analytics.realtime.visitors}명</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-8 text-center">
                <div>
                  <p className="text-sm opacity-90">오늘</p>
                  <p className="text-xl font-bold">{analytics.today.visitors}명</p>
                  <p className="text-xs opacity-75">{analytics.today.pageviews} PV</p>
                </div>
                <div>
                  <p className="text-sm opacity-90">이번 주</p>
                  <p className="text-xl font-bold">{analytics.week.visitors}명</p>
                  <p className="text-xs opacity-75">{analytics.week.pageviews} PV</p>
                </div>
                <div>
                  <p className="text-sm opacity-90">이번 달</p>
                  <p className="text-xl font-bold">{analytics.month.visitors}명</p>
                  <p className="text-xs opacity-75">{analytics.month.pageviews} PV</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      {stats && (
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
                오늘 {stats.todayUsersCount}명 가입
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
                <Package className="inline h-3 w-3 mr-1" />
                재고 있음: {stats.inStockProducts}개
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 접속 통계 탭 */}
      {analytics && (
        <Tabs defaultValue="daily" className="space-y-4">
          <TabsList>
            <TabsTrigger value="daily" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              일별 통계
            </TabsTrigger>
            <TabsTrigger value="pages" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              인기 페이지
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily">
            <Card>
              <CardHeader>
                <CardTitle>최근 7일 방문 통계</CardTitle>
                <CardDescription>일별 방문자 수와 페이지뷰</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.dailyStats.map((day) => {
                    const maxVisitors = Math.max(...analytics.dailyStats.map(d => d.visitors), 1)
                    const percentage = (day.visitors / maxVisitors) * 100

                    return (
                      <div key={day.date} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">
                            {new Date(day.date).toLocaleDateString('ko-KR', {
                              month: 'short',
                              day: 'numeric',
                              weekday: 'short'
                            })}
                          </span>
                          <span className="text-muted-foreground">
                            {day.visitors}명 / {day.pageviews} PV
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pages">
            <Card>
              <CardHeader>
                <CardTitle>오늘 인기 페이지</CardTitle>
                <CardDescription>가장 많이 방문한 페이지</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.popularPages.length > 0 ? (
                    analytics.popularPages.map((page, index) => {
                      const maxCount = analytics.popularPages[0]?.count || 1
                      const percentage = (page.count / maxCount) * 100

                      return (
                        <div key={page.path} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium flex items-center gap-2">
                              <span className="text-muted-foreground">#{index + 1}</span>
                              {getPageName(page.path)}
                            </span>
                            <span className="text-muted-foreground">{page.count}회</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      아직 오늘의 방문 데이터가 없습니다.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Recent Activity */}
      {stats && (
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
                        오늘 {stats.todayUsersCount}명의 새로운 사용자가 가입했습니다
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
      )}
    </div>
  )
}
