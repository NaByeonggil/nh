"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  XCircle, 
  ArrowLeft, 
  Home,
  RefreshCw
} from "lucide-react"

function PaymentFailContent() {
  const searchParams = useSearchParams()
  
  const code = searchParams.get("code")
  const message = searchParams.get("message")
  const orderId = searchParams.get("orderId")

  const getErrorMessage = (code: string | null) => {
    switch (code) {
      case "PAY_PROCESS_CANCELED":
        return "사용자가 결제를 취소했습니다."
      case "PAY_PROCESS_ABORTED":
        return "결제 진행 중 오류가 발생했습니다."
      case "REJECT_CARD_COMPANY":
        return "카드사에서 결제를 거절했습니다."
      case "INVALID_CARD_EXPIRATION":
        return "카드 유효기간을 확인해주세요."
      case "INVALID_STOPPED_CARD":
        return "정지된 카드입니다."
      case "EXCEED_MAX_DAILY_PAYMENT_COUNT":
        return "일일 결제 한도를 초과했습니다."
      case "EXCEED_MAX_PAYMENT_MONEY":
        return "결제 금액 한도를 초과했습니다."
      case "CARD_PROCESSING_ERROR":
        return "카드사 처리 중 오류가 발생했습니다."
      case "EXCEED_MAX_AMOUNT":
        return "최대 결제 금액을 초과했습니다."
      case "INVALID_ACCOUNT_INFO":
        return "계좌 정보가 올바르지 않습니다."
      default:
        return message || "결제 중 오류가 발생했습니다."
    }
  }

  const getSolution = (code: string | null) => {
    switch (code) {
      case "PAY_PROCESS_CANCELED":
        return "다시 결제를 진행해보세요."
      case "REJECT_CARD_COMPANY":
      case "INVALID_CARD_EXPIRATION":
      case "INVALID_STOPPED_CARD":
        return "다른 카드로 결제하시거나 카드사에 문의해보세요."
      case "EXCEED_MAX_DAILY_PAYMENT_COUNT":
      case "EXCEED_MAX_PAYMENT_MONEY":
      case "EXCEED_MAX_AMOUNT":
        return "내일 다시 시도하시거나 다른 결제 수단을 이용해보세요."
      case "INVALID_ACCOUNT_INFO":
        return "계좌 정보를 확인하시고 다시 시도해보세요."
      default:
        return "잠시 후 다시 시도하시거나 고객센터에 문의해주세요."
    }
  }

  const isUserCancellation = code === "PAY_PROCESS_CANCELED"

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Fail Header */}
        <div className="text-center mb-8">
          <XCircle className={`h-16 w-16 mx-auto mb-4 ${
            isUserCancellation ? "text-orange-500" : "text-red-500"
          }`} />
          <h1 className="text-2xl font-bold mb-2">
            {isUserCancellation ? "결제가 취소되었습니다" : "결제에 실패했습니다"}
          </h1>
          {orderId && (
            <p className="text-muted-foreground">
              주문번호: <span className="font-mono font-medium">{orderId}</span>
            </p>
          )}
        </div>

        {/* Error Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <XCircle className="h-5 w-5 mr-2 text-destructive" />
              오류 상세
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">오류 내용</h4>
              <p className="text-muted-foreground">
                {getErrorMessage(code)}
              </p>
            </div>
            
            {code && (
              <div>
                <h4 className="font-medium mb-2">오류 코드</h4>
                <p className="font-mono text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                  {code}
                </p>
              </div>
            )}

            <div>
              <h4 className="font-medium mb-2">해결 방법</h4>
              <p className="text-muted-foreground">
                {getSolution(code)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Helpful Tips */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>결제 관련 도움말</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-1">다른 결제 수단</h4>
                <p className="text-sm text-blue-700">
                  카드, 계좌이체, 가상계좌 등 다양한 결제 수단을 이용하실 수 있습니다.
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-1">고객 지원</h4>
                <p className="text-sm text-green-700">
                  결제 관련 문의사항이 있으시면 고객센터로 연락해주세요.
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-1">장바구니 보관</h4>
                <p className="text-sm text-yellow-700">
                  선택하신 상품들은 장바구니에 그대로 보관되어 있습니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/cart">
              <RefreshCw className="h-4 w-4 mr-2" />
              다시 결제하기
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/checkout">
              <ArrowLeft className="h-4 w-4 mr-2" />
              주문서로 돌아가기
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              홈으로 가기
            </Link>
          </Button>
        </div>

        {/* Contact Info */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>결제 관련 문의: 고객센터 1588-0000 (평일 09:00-18:00)</p>
        </div>
      </div>
    </div>
  )
}

export default function PaymentFailPage() {
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
      <PaymentFailContent />
    </Suspense>
  )
}