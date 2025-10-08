"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  CheckCircle, 
  Package, 
  ArrowRight, 
  Home,
  Loader2
} from "lucide-react"
import { formatPrice } from "@/lib/helpers"

interface PaymentSuccessData {
  order: {
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
  payment: {
    paymentKey: string
    method: string
    totalAmount: number
    approvedAt: string
  }
}

function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [data, setData] = useState<PaymentSuccessData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const paymentKey = searchParams.get("paymentKey")
  const orderId = searchParams.get("orderId")
  const amount = searchParams.get("amount")

  useEffect(() => {
    if (!paymentKey || !orderId || !amount) {
      setError("결제 정보가 올바르지 않습니다.")
      setLoading(false)
      return
    }

    confirmPayment()
  }, [paymentKey, orderId, amount])

  const confirmPayment = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch("/api/payments/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentKey,
          orderId,
          amount: parseInt(amount!),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "결제 승인에 실패했습니다.")
      }

      const result = await response.json()
      setData(result)

      // 결제 성공 시 장바구니 비우기 (localStorage에서)
      if (typeof window !== "undefined") {
        localStorage.removeItem("cart")
        // 페이지 새로고침하여 장바구니 상태 업데이트
        window.dispatchEvent(new Event("storage"))
      }

    } catch (error) {
      console.error("Payment confirmation error:", error)
      setError(error instanceof Error ? error.message : "결제 승인 처리 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold mb-2">결제를 승인하고 있습니다</h3>
              <p className="text-muted-foreground">잠시만 기다려주세요...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">결제 승인에 실패했습니다</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <div className="flex space-x-2 justify-center">
                <Button variant="outline" asChild>
                  <Link href="/cart">장바구니로 돌아가기</Link>
                </Button>
                <Button asChild>
                  <Link href="/">홈으로 가기</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const { order, payment } = data

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">결제가 완료되었습니다!</h1>
          <p className="text-muted-foreground">
            주문번호: <span className="font-mono font-medium">{order.orderNumber}</span>
          </p>
        </div>

        {/* Payment Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>결제 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">결제 금액</p>
                <p className="text-lg font-semibold text-primary">
                  {formatPrice(payment.totalAmount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">결제 수단</p>
                <p className="font-medium">{payment.method || "카드"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">결제 승인 시간</p>
                <p className="font-medium">
                  {new Date(payment.approvedAt).toLocaleString("ko-KR")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">결제 키</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {payment.paymentKey.substring(0, 20)}...
                </p>
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
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>다음 안내</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-1">배송 준비</h4>
                <p className="text-sm text-green-700">
                  주문이 접수되었으며, 1-2일 내 배송을 시작합니다.
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-1">배송 조회</h4>
                <p className="text-sm text-blue-700">
                  배송 시작 시 SMS 또는 이메일로 운송장 번호를 안내드립니다.
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

export default function PaymentSuccessPage() {
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
      <PaymentSuccessContent />
    </Suspense>
  )
}