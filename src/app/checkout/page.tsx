"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { 
  ShoppingCart, 
  ArrowLeft, 
  Package,
  CreditCard,
  MapPin,
  Phone,
  User
} from "lucide-react"
import { useCart } from "@/hooks/useCart"
import { formatPrice } from "@/lib/helpers"
import { requestPayment } from "@/lib/toss"

interface OrderRequest {
  items: {
    productId: string
    quantity: number
  }[]
}

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { cart, clearCart, totalItems, totalPrice } = useCart()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [orderData, setOrderData] = useState({
    recipientName: "",
    recipientPhone: "",
    deliveryAddress: "",
    deliveryMemo: "",
  })

  const [paymentMethod, setPaymentMethod] = useState("카드")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/checkout")
      return
    }

    if (cart.length === 0) {
      router.push("/cart")
      return
    }

    // 세션에서 사용자 정보 자동 입력
    if (session?.user) {
      setOrderData(prev => ({
        ...prev,
        recipientName: session.user.name || "",
      }))
    }
  }, [status, session, cart.length, router])

  const handleInputChange = (field: string, value: string) => {
    setOrderData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateForm = () => {
    if (!orderData.recipientName.trim()) {
      setError("받는 분 이름을 입력해주세요.")
      return false
    }
    if (!orderData.recipientPhone.trim()) {
      setError("받는 분 연락처를 입력해주세요.")
      return false
    }
    if (!orderData.deliveryAddress.trim()) {
      setError("배송 주소를 입력해주세요.")
      return false
    }
    return true
  }

  const handleSubmitOrder = async () => {
    if (!validateForm()) return

    try {
      setIsLoading(true)
      setError("")

      // 주문 데이터 구성
      const orderRequest: OrderRequest = {
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderRequest),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "주문 생성에 실패했습니다.")
      }

      const order = await response.json()

      // Toss Payments로 결제 요청
      try {
        await requestPayment({
          orderId: order.orderNumber,
          orderName: `옆집약사 주문 ${order.items.length}건`,
          amount: order.totalAmount,
          customerName: orderData.recipientName,
          customerEmail: session?.user?.email || undefined,
        })
        
        // 결제 성공 시 장바구니 비우기 (성공 페이지에서 처리)
        // clearCart() - 결제 성공 후에 처리
        
      } catch (paymentError) {
        console.error("Payment request failed:", paymentError)
        // 결제 실패 시 에러 처리 (사용자가 취소하거나 실패한 경우)
        // 주문은 이미 생성되었으므로 상태를 유지
        setError("결제 요청에 실패했습니다. 다시 시도해주세요.")
      }

    } catch (error) {
      console.error("Order submission error:", error)
      setError(error instanceof Error ? error.message : "주문 처리 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
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

  if (status === "unauthenticated" || cart.length === 0) {
    return null // 리디렉션 처리됨
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">주문하기</h1>
          <Button variant="ghost" asChild>
            <Link href="/cart">
              <ArrowLeft className="h-4 w-4 mr-2" />
              장바구니로 돌아가기
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Form */}
          <div className="space-y-6">
            {/* Delivery Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  배송 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipientName">받는 분 이름 *</Label>
                    <Input
                      id="recipientName"
                      value={orderData.recipientName}
                      onChange={(e) => handleInputChange("recipientName", e.target.value)}
                      placeholder="받는 분 이름을 입력하세요"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recipientPhone">받는 분 연락처 *</Label>
                    <Input
                      id="recipientPhone"
                      value={orderData.recipientPhone}
                      onChange={(e) => handleInputChange("recipientPhone", e.target.value)}
                      placeholder="010-0000-0000"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryAddress">배송 주소 *</Label>
                  <Textarea
                    id="deliveryAddress"
                    value={orderData.deliveryAddress}
                    onChange={(e) => handleInputChange("deliveryAddress", e.target.value)}
                    placeholder="배송받을 주소를 상세히 입력해주세요"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryMemo">배송 메모</Label>
                  <Textarea
                    id="deliveryMemo"
                    value={orderData.deliveryMemo}
                    onChange={(e) => handleInputChange("deliveryMemo", e.target.value)}
                    placeholder="배송 시 요청사항이 있으시면 입력해주세요"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  결제 방법
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "카드", label: "신용/체크카드", icon: "💳" },
                    { value: "계좌이체", label: "계좌이체", icon: "🏦" },
                    { value: "가상계좌", label: "가상계좌", icon: "🏧" },
                    { value: "휴대폰", label: "휴대폰", icon: "📱" },
                  ].map((method) => (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => setPaymentMethod(method.value)}
                      className={`p-3 border rounded-lg text-left transition-colors ${
                        paymentMethod === method.value
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{method.icon}</span>
                        <span className="font-medium text-sm">{method.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700">
                    <strong>토스페이먼츠</strong>를 통해 안전하게 결제됩니다.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>주문 상품 ({totalItems}개)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.map((item) => (
                  <div key={item.productId} className="flex items-start space-x-3">
                    <div className="w-16 h-16 relative bg-muted rounded-md overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm mb-1 truncate">
                        {item.name}
                      </h4>
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="font-medium">
                          {formatPrice(item.discountPrice || item.price)}
                        </span>
                        <span className="text-muted-foreground">
                          × {item.quantity}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm font-medium">
                      {formatPrice((item.discountPrice || item.price) * item.quantity)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Payment Summary */}
            <Card>
              <CardHeader>
                <CardTitle>결제 금액</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>상품 금액</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>배송비</span>
                    <span className="text-green-600">무료</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-semibold text-lg">
                  <span>총 결제 금액</span>
                  <span className="text-primary">{formatPrice(totalPrice)}</span>
                </div>

                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleSubmitOrder}
                  disabled={isLoading}
                >
                  {isLoading ? "주문 처리 중..." : `${formatPrice(totalPrice)} 주문하기`}
                </Button>

                <div className="text-xs text-muted-foreground text-center space-y-1">
                  <p>주문하기 버튼을 클릭하면 결제 페이지로 이동합니다.</p>
                  <p>토스페이먼츠를 통해 안전하게 결제됩니다.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}