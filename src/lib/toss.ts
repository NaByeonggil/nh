import { loadTossPayments } from "@tosspayments/payment-sdk"

export const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || "test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq"

export interface PaymentData {
  orderId: string
  orderName: string
  amount: number
  customerName?: string
  customerEmail?: string
}

export interface PaymentSuccessResponse {
  paymentKey: string
  orderId: string
  amount: number
}

export interface PaymentFailResponse {
  code: string
  message: string
  orderId?: string
}

export const initializeTossPayments = async () => {
  try {
    const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY)
    return tossPayments
  } catch (error) {
    console.error("Failed to initialize Toss Payments:", error)
    throw new Error("결제 시스템을 초기화할 수 없습니다.")
  }
}

export const requestPayment = async (paymentData: PaymentData) => {
  try {
    const tossPayments = await initializeTossPayments()
    
    const result = await tossPayments.requestPayment("카드", {
      amount: paymentData.amount,
      orderId: paymentData.orderId,
      orderName: paymentData.orderName,
      customerName: paymentData.customerName,
      customerEmail: paymentData.customerEmail,
      successUrl: `${window.location.origin}/payment/success`,
      failUrl: `${window.location.origin}/payment/fail`,
    })
    
    return result
  } catch (error) {
    console.error("Payment request failed:", error)
    throw error
  }
}

export const getPaymentMethods = async () => {
  try {
    const tossPayments = await initializeTossPayments()
    return {
      tossPayments
    }
  } catch (error) {
    console.error("Failed to get payment methods:", error)
    throw error
  }
}