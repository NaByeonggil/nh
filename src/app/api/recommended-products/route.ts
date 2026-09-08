import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { serializeRecommendedProduct } from "@/lib/recommended-products"

// 활성화된 추천 제품만 노출한다. 관리자가 수정하면 revalidateTag("recommended-products") 로 무효화된다.
export async function GET() {
  try {
    const products = await db.recommendedProduct.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    })

    return NextResponse.json(products.map(serializeRecommendedProduct))
  } catch (error) {
    console.error("추천 제품 조회 오류:", error)
    return NextResponse.json(
      { error: "추천 제품을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
