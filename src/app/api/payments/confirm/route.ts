import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY || "test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R"

interface PaymentConfirmRequest {
  paymentKey: string
  orderId: string
  amount: number
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      )
    }

    const body: PaymentConfirmRequest = await request.json()
    const { paymentKey, orderId, amount } = body

    // 주문 정보 조회
    const order = await db.order.findFirst({
      where: {
        orderNumber: orderId,
        userId: session.user.id
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: "주문을 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    // 금액 검증
    if (Number(order.totalAmount) !== amount) {
      return NextResponse.json(
        { error: "결제 금액이 일치하지 않습니다." },
        { status: 400 }
      )
    }

    // Toss Payments API로 결제 승인 요청
    const tossResponse = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${Buffer.from(TOSS_SECRET_KEY + ":").toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
    })

    if (!tossResponse.ok) {
      const errorData = await tossResponse.json()
      console.error("Toss payment confirmation failed:", errorData)
      return NextResponse.json(
        { error: "결제 승인에 실패했습니다." },
        { status: 400 }
      )
    }

    const paymentData = await tossResponse.json()

    // 주문 상태를 "결제 완료"로 업데이트
    const updatedOrder = await db.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        paymentKey,
        paidAt: new Date(),
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
              }
            }
          }
        }
      }
    })

    // 응답용 데이터 가공
    const responseOrder = {
      ...updatedOrder,
      items: updatedOrder.items.map(item => ({
        ...item,
        product: {
          ...item.product,
          images: item.product.images ? JSON.parse(item.product.images) : [],
        }
      }))
    }

    return NextResponse.json({
      order: responseOrder,
      payment: paymentData,
    })

  } catch (error) {
    console.error("Payment confirmation error:", error)
    return NextResponse.json(
      { error: "결제 승인 처리 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}