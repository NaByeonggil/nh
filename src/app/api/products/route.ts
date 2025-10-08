import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { productSchema } from "@/lib/validations"
import { z } from "zod"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category')
    const search = searchParams.get('search') || ''
    const inStock = searchParams.get('inStock')

    const skip = (page - 1) * limit

    // 검색 조건 구성
    const where: any = {}
    
    if (category && category !== 'all') {
      where.category = category
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ]
    }
    
    if (inStock !== null && inStock !== undefined) {
      where.inStock = inStock === 'true'
    }

    // 총 개수 조회
    const totalCount = await db.product.count({ where })

    // 상품 목록 조회
    const products = await db.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    })

    // 이미지 JSON 파싱
    const processedProducts = products.map(product => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      discountPrice: product.discountRate > 0 
        ? Number(product.price) * (1 - product.discountRate / 100) 
        : null
    }))

    return NextResponse.json({
      products: processedProducts,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
    })

  } catch (error) {
    console.error("Products fetch error:", error)
    return NextResponse.json(
      { error: "상품 목록을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // 유효성 검사
    const validatedData = productSchema.parse(body)

    // 할인가 계산
    const discountPrice = validatedData.discountRate > 0 
      ? validatedData.price * (1 - validatedData.discountRate / 100)
      : null

    // 이미지 JSON 문자열로 변환
    const imagesJson = validatedData.images 
      ? JSON.stringify(validatedData.images)
      : null

    // 상품 생성
    const product = await db.product.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        price: validatedData.price,
        discountRate: validatedData.discountRate,
        discountPrice,
        category: validatedData.category,
        images: imagesJson,
        inStock: validatedData.inStock,
      }
    })

    // 응답용 데이터 가공
    const responseProduct = {
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
    }

    return NextResponse.json(responseProduct, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Product creation error:", error)
    return NextResponse.json(
      { error: "상품 등록 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}