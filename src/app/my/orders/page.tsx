"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Package, 
  Calendar, 
  CreditCard,
  ArrowRight,
  Eye,
  ShoppingCart
} from "lucide-react"
import { formatPrice } from "@/lib/helpers"

interface Order {
  id: string
  orderNumber: string
  totalAmount: number
  status: string
  createdAt: string
  items: {
    id: string
    quantity: number
    price: number
    product: {
      id: string
      name: string
      images: string[]
    }
  }[]
}

interface OrdersResponse {
  orders: Order[]
  totalCount: number
  currentPage: number
  totalPages: number
}

export default function MyOrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }
    
    if (status === "authenticated") {
      fetchOrders()
    }
  }, [status, router, currentPage, statusFilter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError("")

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(statusFilter !== "all" && { status: statusFilter })
      })

      const response = await fetch(`/api/orders?${params}`)
      
      if (!response.ok) {
        throw new Error("주문 목록을 불러올 수 없습니다.")
      }

      const data: OrdersResponse = await response.json()
      setOrders(data.orders)
      setTotalPages(data.totalPages)
      
    } catch (error) {
      console.error("Orders fetch error:", error)
      setError(error instanceof Error ? error.message : "주문 목록을 불러오는 중 오류가 발생했습니다.")
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
      case "PREPARING":
        return "default"
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

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">내 주문 내역</h1>
          <Button variant="outline" asChild>
            <Link href="/supplements">
              <ShoppingCart className="h-4 w-4 mr-2" />
              쇼핑하기
            </Link>
          </Button>
        </div>

        {/* Status Filter */}
        <div className="flex space-x-2 mb-6">
          {[
            { value: "all", label: "전체" },
            { value: "PENDING", label: "결제 대기" },
            { value: "PAID", label: "결제 완료" },
            { value: "SHIPPED", label: "배송 중" },
            { value: "DELIVERED", label: "배송 완료" },
          ].map((filter) => (
            <Button
              key={filter.value}
              variant={statusFilter === filter.value ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setStatusFilter(filter.value)
                setCurrentPage(1)
              }}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="h-20 bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">오류가 발생했습니다</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchOrders}>다시 시도</Button>
            </CardContent>
          </Card>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">주문 내역이 없습니다</h3>
              <p className="text-muted-foreground mb-6">
                아직 주문하신 상품이 없어요. 다양한 건강 보조제를 둘러보세요!
              </p>
              <Button asChild>
                <Link href="/supplements">상품 둘러보기</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <CardTitle className="text-lg">
                          주문번호: {order.orderNumber}
                        </CardTitle>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(order.createdAt).toLocaleDateString("ko-KR")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={getStatusVariant(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground mt-1">
                        <CreditCard className="h-4 w-4" />
                        <span className="font-medium text-primary">
                          {formatPrice(order.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.items.slice(0, 2).map((item) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                          {item.product.images && item.product.images.length > 0 ? (
                            <Image
                              src={item.product.images[0]}
                              alt={item.product.name}
                              width={48}
                              height={48}
                              className="object-cover rounded-md"
                            />
                          ) : (
                            <Package className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">
                            {item.product.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {formatPrice(item.price)} × {item.quantity}개
                          </p>
                        </div>
                        <div className="text-sm font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                    
                    {order.items.length > 2 && (
                      <div className="text-center py-2">
                        <span className="text-sm text-muted-foreground">
                          외 {order.items.length - 2}개 상품
                        </span>
                      </div>
                    )}
                  </div>

                  <Separator className="my-4" />

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      총 {order.items.length}개 상품
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/order-complete?orderNumber=${order.orderNumber}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        상세보기
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center space-x-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  이전
                </Button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = Math.max(1, Math.min(totalPages, currentPage - 2 + i))
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  )
                })}
                
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  다음
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}