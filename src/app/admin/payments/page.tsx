"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Search,
  Calendar,
  CreditCard,
  TrendingUp,
  DollarSign,
  Package
} from "lucide-react"
import { formatPrice } from "@/lib/helpers"

interface PaymentStats {
  totalRevenue: number
  totalOrders: number
  pendingOrders: number
  paidOrders: number
}

interface Order {
  id: string
  orderNumber: string
  totalAmount: number
  status: string
  paymentKey: string | null
  paidAt: string | null
  createdAt: string
  user: {
    name: string | null
    email: string
  }
}

export default function AdminPaymentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<PaymentStats>({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    paidOrders: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }
    
    if (session?.user.role !== "ADMIN") {
      router.push("/")
      return
    }
    
    if (status === "authenticated") {
      fetchData()
    }
  }, [status, session, router])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // 주문 목록 조회
      const ordersResponse = await fetch("/api/admin/orders")
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        setOrders(ordersData.orders || [])
        
        // 통계 계산
        const totalOrders = ordersData.orders?.length || 0
        const paidOrders = ordersData.orders?.filter((order: Order) => order.status === "PAID").length || 0
        const pendingOrders = ordersData.orders?.filter((order: Order) => order.status === "PENDING").length || 0
        const totalRevenue = ordersData.orders?.reduce((sum: number, order: Order) => {
          return order.status === "PAID" ? sum + Number(order.totalAmount) : sum
        }, 0) || 0
        
        setStats({
          totalRevenue,
          totalOrders,
          pendingOrders,
          paidOrders
        })
      }
      
    } catch (error) {
      console.error("Failed to fetch admin data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "결제 대기"
      case "PAID":
        return "결제 완료"
      case "PREPARING":
        return "배송 준비"
      case "SHIPPED":
        return "배송 중"
      case "DELIVERED":
        return "배송 완료"
      case "CANCELLED":
        return "주문 취소"
      default:
        return status
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "PENDING":
        return "secondary"
      case "PAID":
        return "default"
      case "PREPARING":
        return "secondary"
      case "SHIPPED":
        return "secondary"
      case "DELIVERED":
        return "secondary"
      case "CANCELLED":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const filteredOrders = orders.filter(order => 
    order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (order.user.name && order.user.name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (status === "loading") {
    return <div className="container mx-auto px-4 py-8">로딩 중...</div>
  }

  if (session?.user.role !== "ADMIN") {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">결제 관리</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">총 매출</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatPrice(stats.totalRevenue)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">총 주문</p>
                  <p className="text-2xl font-bold">{stats.totalOrders}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">결제 완료</p>
                  <p className="text-2xl font-bold text-green-600">{stats.paidOrders}</p>
                </div>
                <CreditCard className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">결제 대기</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingOrders}</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="주문번호, 고객명, 이메일로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>주문 내역</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">주문 내역이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h4 className="font-semibold">{order.orderNumber}</h4>
                          <p className="text-sm text-muted-foreground">
                            {order.user.name || order.user.email}
                          </p>
                        </div>
                        <Badge variant={getStatusVariant(order.status)}>
                          {getStatusText(order.status)}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatPrice(Number(order.totalAmount))}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString("ko-KR")}
                        </p>
                      </div>
                    </div>
                    
                    {order.paidAt && (
                      <div className="text-xs text-muted-foreground">
                        결제 완료: {new Date(order.paidAt).toLocaleString("ko-KR")}
                      </div>
                    )}
                    
                    {order.paymentKey && (
                      <div className="text-xs text-muted-foreground mt-1">
                        결제 키: {order.paymentKey.substring(0, 20)}...
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}