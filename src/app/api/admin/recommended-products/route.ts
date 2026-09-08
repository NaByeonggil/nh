import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { recommendedProductSchema } from "@/lib/validations"
import { serializeRecommendedProduct } from "@/lib/recommended-products"
import { revalidateTag } from "next/cache"
import { z } from "zod"

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 })
  }
  return null
}

export async function GET() {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    const products = await db.recommendedProduct.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    })

    return NextResponse.json(products.map(serializeRecommendedProduct))
  } catch (error) {
    console.error("추천 제품 목록 조회 오류:", error)
    return NextResponse.json(
      { error: "추천 제품 목록을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    const data = recommendedProductSchema.parse(await request.json())

    // 순서를 지정하지 않으면 목록 맨 뒤에 붙인다.
    let order = data.order
    if (order === undefined) {
      const maxOrder = await db.recommendedProduct.aggregate({ _max: { order: true } })
      order = (maxOrder._max.order ?? -1) + 1
    }

    const product = await db.recommendedProduct.create({
      data: {
        name: data.name,
        description: data.description || null,
        imageUrl: data.imageUrl || null,
        price: data.price,
        originalPrice: data.originalPrice ?? null,
        rating: data.rating,
        reviewCount: data.reviewCount,
        purchaseUrl: data.purchaseUrl || null,
        isActive: data.isActive,
        order,
      },
    })

    revalidateTag("recommended-products")
    return NextResponse.json(serializeRecommendedProduct(product), { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "입력값을 확인해주세요.", details: error.errors },
        { status: 400 }
      )
    }

    console.error("추천 제품 생성 오류:", error)
    return NextResponse.json(
      { error: "추천 제품 등록 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
