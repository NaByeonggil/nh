"use client"

import { useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowLeft,
  Package
} from "lucide-react"
import { useCart } from "@/hooks/useCart"
import { formatPrice } from "@/lib/helpers"

export default function CartPage() {
  const { 
    cart, 
    isLoading, 
    updateQuantity, 
    removeItem, 
    clearCart, 
    totalItems, 
    totalPrice 
  } = useCart()

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold">장바구니</h1>
            <Button variant="ghost" asChild>
              <Link href="/supplements">
                <ArrowLeft className="h-4 w-4 mr-2" />
                쇼핑 계속하기
              </Link>
            </Button>
          </div>

          {/* Empty Cart */}
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">장바구니가 비어있습니다</h3>
              <p className="text-muted-foreground mb-6">
                관심 있는 상품을 장바구니에 담아보세요.
              </p>
              <Button asChild>
                <Link href="/supplements">
                  상품 둘러보기
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">
            장바구니 ({totalItems}개)
          </h1>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={clearCart}>
              전체 비우기
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/supplements">
                <ArrowLeft className="h-4 w-4 mr-2" />
                쇼핑 계속하기
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <Card key={item.productId}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 relative bg-muted rounded-md overflow-hidden">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Package className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1">
                        <Link 
                          href={`/supplements/${item.productId}`}
                          className="hover:text-primary transition-colors"
                        >
                          {item.name}
                        </Link>
                      </h3>
                      
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-primary">
                          {formatPrice(item.discountPrice || item.price)}
                        </span>
                        {item.discountPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(item.price)}
                          </span>
                        )}
                      </div>

                      {!item.inStock && (
                        <p className="text-sm text-destructive mb-2">
                          현재 품절된 상품입니다
                        </p>
                      )}

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border rounded-md">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="px-3 py-1 font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= 10}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.productId)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatPrice((item.discountPrice || item.price) * item.quantity)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>주문 요약</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>상품 금액</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>배송비</span>
                    <span className="text-green-600">무료</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-semibold text-lg">
                  <span>총 결제 금액</span>
                  <span className="text-primary">{formatPrice(totalPrice)}</span>
                </div>

                <div className="space-y-2">
                  <Button className="w-full" size="lg" asChild>
                    <Link href="/checkout">
                      주문하기 ({totalItems}개)
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/supplements">
                      쇼핑 계속하기
                    </Link>
                  </Button>
                </div>

                {/* Benefits */}
                <div className="mt-6 p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">혜택 안내</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• 50,000원 이상 무료배송</li>
                    <li>• 7일 내 무료 교환/환불</li>
                    <li>• 전문가 상담 서비스</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}