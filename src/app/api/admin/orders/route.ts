import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status')

    const skip = (page - 1) * limit

    // 검색 조건 구성
    const where: any = {}
    
    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }

    // 총 개수 조회
    const totalCount = await db.order.count({ where })

    // 주문 목록 조회 (관리자용 - 모든 주문)
    const orders = await db.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
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
    console.error("Admin orders fetch error:", error)
    return NextResponse.json(
      { error: "주문 목록을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { orderId, status } = body

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "주문 ID와 상태가 필요합니다." },
        { status: 400 }
      )
    }

    // 주문 상태 업데이트
    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: { status: status.toUpperCase() },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
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
    const processedOrder = {
      ...updatedOrder,
      items: updatedOrder.items.map(item => ({
        ...item,
        product: {
          ...item.product,
          images: item.product.images ? JSON.parse(item.product.images) : [],
        }
      }))
    }

    return NextResponse.json(processedOrder)

  } catch (error) {
    console.error("Order status update error:", error)
    return NextResponse.json(
      { error: "주문 상태 업데이트 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}