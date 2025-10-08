"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { 
  CheckCircle, 
  Package, 
  ArrowRight, 
  Home,
  CreditCard,
  Clock
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

function OrderCompleteContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get("orderNumber")
  
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!orderNumber) {
      router.push("/")
      return
    }

    fetchOrderDetails()
  }, [orderNumber, router])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch(`/api/orders?orderNumber=${orderNumber}`)
      
      if (!response.ok) {
        throw new Error("주문 정보를 불러올 수 없습니다.")
      }

      const data = await response.json()
      
      // 주문번호로 필터링
      const targetOrder = data.orders.find((order: Order) => order.orderNumber === orderNumber)
      
      if (!targetOrder) {
        throw new Error("주문을 찾을 수 없습니다.")
      }

      setOrder(targetOrder)
      
    } catch (error) {
      console.error("Order fetch error:", error)
      setError(error instanceof Error ? error.message : "주문 정보를 불러오는 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
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

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">주문 정보를 찾을 수 없습니다</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button asChild>
                <Link href="/">홈으로 돌아가기</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "PAID":
      case "PREPARING":
        return "bg-blue-100 text-blue-800"
      case "SHIPPED":
        return "bg-purple-100 text-purple-800"
      case "DELIVERED":
        return "bg-green-100 text-green-800"
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">주문이 완료되었습니다!</h1>
          <p className="text-muted-foreground">
            주문번호: <span className="font-mono font-medium">{order.orderNumber}</span>
          </p>
        </div>

        {/* Order Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>주문 상태</span>
              <span 
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}
              >
                {getStatusText(order.status)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">주문 일시</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleString("ko-KR")}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">결제 금액</p>
                  <p className="text-sm font-semibold text-primary">
                    {formatPrice(order.totalAmount)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Package className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">주문 상품</p>
                  <p className="text-sm text-muted-foreground">
                    {order.items.length}개 상품
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>주문 상품</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-medium">{item.product.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(item.price)} × {item.quantity}개
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
            
            <Separator />
            
            <div className="flex justify-between items-center font-semibold text-lg">
              <span>총 결제 금액</span>
              <span className="text-primary">{formatPrice(order.totalAmount)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>다음 단계</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-1">결제 안내</h4>
                <p className="text-sm text-blue-700">
                  별도 연락을 통해 결제 방법을 안내드릴 예정입니다.
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-1">배송 안내</h4>
                <p className="text-sm text-green-700">
                  결제 확인 후 1-2일 내 배송이 시작됩니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/my/orders">
              <Package className="h-4 w-4 mr-2" />
              주문 내역 확인
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/supplements">
              <ArrowRight className="h-4 w-4 mr-2" />
              쇼핑 계속하기
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              홈으로 가기
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function OrderCompletePage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    }>
      <OrderCompleteContent />
    </Suspense>
  )
}