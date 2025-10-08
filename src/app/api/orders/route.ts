import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { orderSchema } from "@/lib/validations"
import { z } from "zod"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    const skip = (page - 1) * limit

    // 검색 조건 구성
    const where: any = {
      userId: session.user.id
    }
    
    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }

    // 총 개수 조회
    const totalCount = await db.order.count({ where })

    // 주문 목록 조회
    const orders = await db.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
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

    // 이미지 JSON 파싱
    const processedOrders = orders.map(order => ({
      ...order,
      items: order.items.map(item => ({
        ...item,
        product: {
          ...item.product,
          images: item.product.images ? JSON.parse(item.product.images) : [],
        }
      }))
    }))

    return NextResponse.json({
      orders: processedOrders,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
    })

  } catch (error) {
    console.error("Orders fetch error:", error)
    return NextResponse.json(
      { error: "주문 목록을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
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

    const body = await request.json()
    
    // 유효성 검사
    const validatedData = orderSchema.parse(body)

    // 주문번호 생성
    const orderNumber = `NH${Date.now()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`

    // 상품 정보 조회 및 총액 계산
    let totalAmount = 0
    const orderItems = []

    for (const item of validatedData.items) {
      const product = await db.product.findUnique({
        where: { id: item.productId }
      })

      if (!product) {
        return NextResponse.json(
          { error: `상품을 찾을 수 없습니다: ${item.productId}` },
          { status: 400 }
        )
      }

      if (!product.inStock) {
        return NextResponse.json(
          { error: `품절된 상품입니다: ${product.name}` },
          { status: 400 }
        )
      }

      // 할인가 적용
      const price = product.discountPrice || product.price
      totalAmount += Number(price) * item.quantity

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: Number(price),
      })
    }

    // 주문 생성
    const order = await db.order.create({
      data: {
        orderNumber,
        totalAmount,
        status: 'PENDING',
        userId: session.user.id,
        items: {
          create: orderItems
        }
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
      ...order,
      items: order.items.map(item => ({
        ...item,
        product: {
          ...item.product,
          images: item.product.images ? JSON.parse(item.product.images) : [],
        }
      }))
    }

    return NextResponse.json(responseOrder, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Order creation error:", error)
    return NextResponse.json(
      { error: "주문 생성 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}