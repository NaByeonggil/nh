import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    // 상품 조회
    const product = await db.product.findUnique({
      where: { id }
    })

    if (!product) {
      return NextResponse.json(
        { error: "상품을 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    // 이미지 JSON 파싱 및 할인가 계산
    const processedProduct = {
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      discountPrice: product.discountRate > 0 
        ? Number(product.price) * (1 - product.discountRate / 100) 
        : null
    }

    return NextResponse.json(processedProduct)

  } catch (error) {
    console.error("Product fetch error:", error)
    return NextResponse.json(
      { error: "상품을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 }
      )
    }

    const body = await request.json()

    // 기존 상품 조회
    const existingProduct = await db.product.findUnique({
      where: { id: id }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: "상품을 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    // 할인가 계산
    const discountPrice = body.discountRate > 0 
      ? body.price * (1 - body.discountRate / 100)
      : null

    // 이미지 JSON 문자열로 변환
    const imagesJson = body.images 
      ? JSON.stringify(body.images)
      : existingProduct.images

    // 상품 업데이트
    const updatedProduct = await db.product.update({
      where: { id: id },
      data: {
        name: body.name,
        description: body.description,
        price: body.price,
        discountRate: body.discountRate || 0,
        discountPrice,
        category: body.category,
        images: imagesJson,
        inStock: body.inStock,
        updatedAt: new Date(),
      }
    })

    // 응답용 데이터 가공
    const responseProduct = {
      ...updatedProduct,
      images: updatedProduct.images ? JSON.parse(updatedProduct.images) : [],
    }

    return NextResponse.json(responseProduct)

  } catch (error) {
    console.error("Product update error:", error)
    return NextResponse.json(
      { error: "상품 수정 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 }
      )
    }

    // 기존 상품 조회
    const existingProduct = await db.product.findUnique({
      where: { id: id }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: "상품을 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    // 상품 삭제
    await db.product.delete({
      where: { id: id }
    })

    return NextResponse.json({ message: "상품이 삭제되었습니다." })

  } catch (error) {
    console.error("Product delete error:", error)
    return NextResponse.json(
      { error: "상품 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}