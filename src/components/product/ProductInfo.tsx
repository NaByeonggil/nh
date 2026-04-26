"use client"

import { useState } from "react"
import { ShoppingCart, Heart, Minus, Plus, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { RatingStars } from "./RatingStars"
import {
  formatPrice,
  formatDiscount,
  formatStockStatus,
  type Product,
} from "@/lib/product-data"
import { cn } from "@/lib/utils"

interface ProductInfoProps {
  product: Product
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0])
  const [selectedColor, setSelectedColor] = useState(product.colors[0].name)
  const [quantity, setQuantity] = useState(1)

  const decrementQuantity = () => setQuantity((q) => Math.max(1, q - 1))
  const incrementQuantity = () => setQuantity((q) => Math.min(product.stockCount, q + 1))

  return (
    <div className="space-y-6">
      {/* Product Name & Price */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
        
        <div className="flex items-center gap-3">
          <RatingStars rating={product.rating} size={20} showValue />
          <span className="text-sm text-muted-foreground">
            ({product.reviewCount} reviews)
          </span>
        </div>

        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <>
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
              <Badge variant="destructive" className="bg-red-500">
                {formatDiscount(product.originalPrice, product.price)}
              </Badge>
            </>
          )}
        </div>
      </div>

      <Separator />

      {/* Product Description */}
      <div>
        <p className="text-muted-foreground leading-relaxed">{product.description}</p>
      </div>

      <Separator />

      {/* Size Selection */}
      {product.sizes.length > 1 && (
        <div className="space-y-3">
          <label className="text-sm font-medium">Size</label>
          <ToggleGroup 
            type="single" 
            value={selectedSize} 
            onValueChange={(value) => setSelectedSize(value as string)}
          >
            {product.sizes.map((size) => (
              <ToggleGroupItem key={size} value={size} className="min-w-[60px]">
                {size}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      )}

      {/* Color Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium">
          Color: <span className="font-normal text-muted-foreground">{selectedColor}</span>
        </label>
        <div className="flex gap-2">
          {product.colors.map((color) => (
            <button
              key={color.name}
              onClick={() => color.available && setSelectedColor(color.name)}
              disabled={!color.available}
              className={cn(
                "relative h-10 w-10 rounded-full border-2 transition-all",
                selectedColor === color.name
                  ? "border-primary ring-2 ring-primary ring-offset-2"
                  : "border-muted-foreground/30 hover:border-muted-foreground",
                !color.available && "cursor-not-allowed opacity-50"
              )}
              style={{ backgroundColor: color.value }}
              title={color.name}
            >
              {selectedColor === color.name && (
                <Check
                  className={cn(
                    "absolute inset-0 m-auto h-5 w-5",
                    color.value === "#FFFFFF" || color.value === "#ffffff"
                      ? "text-black"
                      : "text-white"
                  )}
                  strokeWidth={3}
                />
              )}
              {!color.available && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-0.5 w-full rotate-45 bg-red-500" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Stock Status */}
      <div className="flex items-center gap-2">
        {product.inStock ? (
          <>
            <Check className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-600">
              {formatStockStatus(product.stockCount)}
            </span>
          </>
        ) : (
          <span className="font-medium text-red-600">Out of Stock</span>
        )}
      </div>

      {/* Quantity & Add to Cart */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Quantity</label>
          <div className="flex items-center border rounded-lg">
            <Button
              variant="ghost"
              size="icon"
              onClick={decrementQuantity}
              disabled={quantity <= 1}
              className="h-10 w-10"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center font-medium">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={incrementQuantity}
              disabled={quantity >= product.stockCount}
              className="h-10 w-10"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-3">
          <Button size="lg" className="flex-1" disabled={!product.inStock}>
            <ShoppingCart className="mr-2 h-5 w-5" />
            Add to Cart
          </Button>
          <Button size="lg" variant="outline">
            <Heart className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Shipping Info */}
      <div className="rounded-lg bg-muted p-4">
        <p className="text-sm text-muted-foreground">{product.shippingInfo}</p>
      </div>
    </div>
  )
}
