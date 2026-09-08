"use client"

import { useEffect, useState } from "react"
import { getImageUrl } from "@/lib/image-url"
import { formatPrice } from "@/lib/helpers"
import { discountRate, type SerializedRecommendedProduct } from "@/lib/recommended-products"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Package, Star } from "lucide-react"

type RecommendedProduct = Omit<
  SerializedRecommendedProduct,
  "createdAt" | "updatedAt"
> & {
  createdAt: string
  updatedAt: string
}

/**
 * 관리자가 큐레이션한 추천 제품 목록.
 * 등록된 항목이 없으면 섹션 자체를 렌더링하지 않는다.
 */
export function RecommendedProducts() {
  const [products, setProducts] = useState<RecommendedProduct[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false

    fetch("/api/recommended-products")
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => {
        if (!cancelled) setProducts(Array.isArray(data) ? data : [])
      })
      .catch((error) => console.error("Failed to fetch recommended products:", error))
      .finally(() => {
        if (!cancelled) setLoaded(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (!loaded || products.length === 0) return null

  return (
    <section className="mb-10">
      <div className="flex items-center space-x-2 mb-4">
        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
        <h2 className="text-xl font-bold">약사가 추천하는 제품</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => {
          const rate = discountRate(product.price, product.originalPrice)

          return (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square relative bg-muted flex items-center justify-center">
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={getImageUrl(product.imageUrl)}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <Package className="h-16 w-16 text-muted-foreground" />
                )}

                {rate > 0 && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="destructive">{rate}% 할인</Badge>
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                <h3 className="font-semibold text-sm mb-2 line-clamp-2">{product.name}</h3>

                {product.description && (
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {product.description}
                  </p>
                )}

                {product.reviewCount > 0 && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{product.rating.toFixed(1)}</span>
                    <span>({product.reviewCount})</span>
                  </div>
                )}

                <div className="flex items-end justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="text-lg font-bold text-primary">
                      {formatPrice(product.price)}
                    </div>
                    {rate > 0 && product.originalPrice !== null && (
                      <div className="text-xs text-muted-foreground line-through">
                        {formatPrice(product.originalPrice)}
                      </div>
                    )}
                  </div>

                  {product.purchaseUrl && (
                    <Button asChild size="sm" className="h-8">
                      <a
                        href={product.purchaseUrl}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        구매하기
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
