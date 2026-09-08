import type { RecommendedProduct } from "@prisma/client"

/**
 * Prisma Decimal 은 JSON 으로 문자열이 되므로 클라이언트가 바로 계산에 쓸 수 있도록
 * 숫자로 변환해서 내려준다.
 */
export function serializeRecommendedProduct(product: RecommendedProduct) {
  return {
    ...product,
    price: Number(product.price),
    originalPrice: product.originalPrice === null ? null : Number(product.originalPrice),
    rating: Number(product.rating),
  }
}

export type SerializedRecommendedProduct = ReturnType<typeof serializeRecommendedProduct>

/** 정가 대비 할인율(%). 정가가 없거나 판매가보다 낮으면 0. */
export function discountRate(price: number, originalPrice: number | null): number {
  if (!originalPrice || originalPrice <= price) return 0
  return Math.round((1 - price / originalPrice) * 100)
}
