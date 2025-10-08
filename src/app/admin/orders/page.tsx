"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye,
  Edit,
  Filter,
  Calendar,
  User,
  CreditCard
} from "lucide-react"
import { formatPrice, formatDateTime, timeAgo } from "@/lib/helpers"

interface Order {
  id: string
  orderNumber: string
  totalAmount: number
  status: "PENDING" | "PAID" | "PREPARING" | "SHIPPED" | "DELIVERED" | "CANCELLED"
  paymentKey: string | null
  paidAt: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string | null
    email: string
  }
  items: OrderItem[]
}

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    imageUrl: string | null
  }
}

interface OrderStats {
  totalOrders: number
  pendingOrders: number
  paidOrders: number
  shippedOrders: number
  deliveredOrders: number
  cancelledOrders: number
  totalRevenue: number
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    pendingOrders: 0,
    paidOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "PENDING" | "PAID" | "PREPARING" | "SHIPPED" | "DELIVERED" | "CANCELLED">("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/orders")
      
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
        
        // 통계 계산
        const orders = data.orders || []
        const totalOrders = orders.length
        const pendingOrders = orders.filter((o: Order) => o.status === "PENDING").length
        const paidOrders = orders.filter((o: Order) => o.status === "PAID").length
        const shippedOrders = orders.filter((o: Order) => o.status === "SHIPPED").length
        const deliveredOrders = orders.filter((o: Order) => o.status === "DELIVERED").length
        const cancelledOrders = orders.filter((o: Order) => o.status === "CANCELLED").length
        const totalRevenue = orders
          .filter((o: Order) => ["PAID", "PREPARING", "SHIPPED", "DELIVERED"].includes(o.status))
          .reduce((sum: number, o: Order) => sum + Number(o.totalAmount), 0)
        
        setStats({
          totalOrders,
          pendingOrders,
          paidOrders,
          shippedOrders,
          deliveredOrders,
          cancelledOrders,
          totalRevenue
        })
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId: string, newStatus: Order["status"]) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (response.ok) {
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: newStatus, updatedAt: new Date().toISOString() } : order
        ))
      } else {
        alert("주문 상태 업데이트 중 오류가 발생했습니다.")
      }
    } catch (error) {
      console.error("Failed to update order status:", error)
      alert("주문 상태 업데이트 중 오류가 발생했습니다.")
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING": return "결제 대기"
      case "PAID": return "결제 완료" 
      case "PREPARING": return "배송 준비"
      case "SHIPPED": return "배송 중"
      case "DELIVERED": return "배송 완료"
      case "CANCELLED": return "주문 취소"
      default: return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING": return <Clock className="h-4 w-4" />
      case "PAID": return <CreditCard className="h-4 w-4" />
      case "PREPARING": return <Package className="h-4 w-4" />
      case "SHIPPED": return <Truck className="h-4 w-4" />
      case "DELIVERED": return <CheckCircle className="h-4 w-4" />
      case "CANCELLED": return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "PENDING": return "secondary"
      case "PAID": return "default"
      case "PREPARING": return "secondary"
      case "SHIPPED": return "secondary"
      case "DELIVERED": return "secondary"
      case "CANCELLED": return "destructive"
      default: return "secondary"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "text-orange-600"
      case "PAID": return "text-blue-600"
      case "PREPARING": return "text-purple-600"
      case "SHIPPED": return "text-indigo-600"
      case "DELIVERED": return "text-green-600"
      case "CANCELLED": return "text-red-600"
      default: return "text-gray-600"
    }
  }

  const getNextStatus = (currentStatus: Order["status"]) => {
    switch (currentStatus) {
      case "PAID": return "PREPARING"
      case "PREPARING": return "SHIPPED"
      case "SHIPPED": return "DELIVERED"
      default: return null
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (order.user.name && order.user.name.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">주문 관리</h1>
        <p className="text-muted-foreground">
          고객 주문을 관리하고 배송 상태를 업데이트하세요.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">전체 주문</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">결제 대기</p>
                <p className="text-2xl font-bold">{stats.pendingOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">결제 완료</p>
                <p className="text-2xl font-bold">{stats.paidOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Truck className="h-5 w-5 text-indigo-500" />
              <div>
                <p className="text-sm font-medium">배송 중</p>
                <p className="text-2xl font-bold">{stats.shippedOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">배송 완료</p>
                <p className="text-2xl font-bold">{stats.deliveredOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">취소</p>
                <p className="text-2xl font-bold">{stats.cancelledOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">총 매출</p>
                <p className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</p>
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
                  placeholder="주문번호, 고객명, 이메일로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {["all", "PENDING", "PAID", "PREPARING", "SHIPPED", "DELIVERED", "CANCELLED"].map(status => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  onClick={() => setStatusFilter(status as any)}
                  size="sm"
                >
                  {status === "all" ? "전체" : getStatusText(status)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
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
      ) : filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">주문이 없습니다</h3>
            <p className="text-muted-foreground">
              조건에 맞는 주문을 찾을 수 없습니다.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold">{order.orderNumber}</h3>
                      <Badge variant={getStatusVariant(order.status)} className={getStatusColor(order.status)}>
                        <span className="flex items-center space-x-1">
                          {getStatusIcon(order.status)}
                          <span>{getStatusText(order.status)}</span>
                        </span>
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{order.user.name || "익명"} ({order.user.email})</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{timeAgo(new Date(order.createdAt))}</span>
                      </div>
                      {order.paidAt && (
                        <div className="flex items-center space-x-1">
                          <CreditCard className="h-4 w-4" />
                          <span>결제: {timeAgo(new Date(order.paidAt))}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-semibold text-primary">
                        {formatPrice(Number(order.totalAmount))}
                      </p>
                      
                      <div className="text-sm text-muted-foreground">
                        상품 {order.items?.length || 0}개
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    {getNextStatus(order.status) && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleStatusUpdate(order.id, getNextStatus(order.status)!)}
                      >
                        {getStatusText(getNextStatus(order.status)!)}로 변경
                      </Button>
                    )}
                    
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      상세보기
                    </Button>
                    
                    {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusUpdate(order.id, "CANCELLED")}
                        className="text-red-600 hover:text-red-700"
                      >
                        취소
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Order Items Preview */}
                {order.items && order.items.length > 0 && (
                  <div className="border-t pt-4 mt-4">
                    <div className="flex space-x-4 overflow-x-auto">
                      {order.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center space-x-3 min-w-0 flex-shrink-0">
                          <div className="w-12 h-12 bg-muted rounded-md overflow-hidden">
                            {item.product.imageUrl ? (
                              <img 
                                src={item.product.imageUrl} 
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{item.product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.quantity}개 × {formatPrice(Number(item.price))}
                            </p>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="flex items-center">
                          <span className="text-sm text-muted-foreground">
                            +{order.items.length - 3}개 더
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}