"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RatingStars } from "./RatingStars"
import { formatPrice, formatDiscount, type RelatedProduct } from "@/lib/product-data"
import { ShoppingCart, Heart, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  product: RelatedProduct
  onAddToCart?: (product: RelatedProduct) => void
  href?: string
}

export function ProductCard({ product, onAddToCart, href }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onAddToCart?.(product)
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsWishlisted(!isWishlisted)
  }

  const cardContent = (
    <Card
      className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-soft-lg border-gray-100 hover:border-gray-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-all duration-500 group-hover:scale-110"
        />

        {/* Gradient overlay on hover */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Discount Badge */}
        {product.originalPrice && (
          <Badge className="absolute left-3 top-3 bg-red-500 hover:bg-red-600 text-white font-bold px-2.5 py-1 shadow-lg">
            {formatDiscount(product.originalPrice, product.price)}
          </Badge>
        )}

        {/* Action Buttons */}
        <div
          className={cn(
            "absolute right-3 top-3 flex flex-col gap-2 transition-all duration-300",
            isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
          )}
        >
          <Button
            size="icon"
            variant="secondary"
            className={cn(
              "h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-white transition-all",
              isWishlisted && "bg-red-50 hover:bg-red-100"
            )}
            onClick={handleWishlist}
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-colors",
                isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
              )}
            />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-white"
          >
            <Eye className="h-4 w-4 text-gray-600" />
          </Button>
        </div>

        {/* Quick Add to Cart Button */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 p-3 transition-all duration-300",
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <Button
            className="w-full bg-primary hover:bg-primary-600 text-white shadow-lg gap-2"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4" />
            장바구니 담기
          </Button>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
          {product.name}
        </h3>
        <div className="mt-2 flex items-center gap-1">
          <RatingStars rating={product.rating} size={14} />
          <span className="text-xs text-muted-foreground">
            ({product.reviewCount.toLocaleString()})
          </span>
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="p-4 pt-0">
        <div className="flex items-baseline gap-2 w-full">
          <span className="text-lg font-bold text-primary">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
  )

  if (href) {
    return <Link href={href}>{cardContent}</Link>
  }

  return cardContent
}
