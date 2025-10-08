"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  ShoppingCart, 
  Heart, 
  Share2, 
  Pill,
  Package,
  Shield,
  Truck,
  RotateCcw,
  Plus,
  Minus
} from "lucide-react"
import { formatPrice } from "@/lib/helpers"
import { useCart } from "@/hooks/useCart"

interface Product {
  id: string
  name: string
  description: string
  price: number
  discountRate: number
  discountPrice?: number
  category?: string
  images: string[]
  inStock: boolean
  createdAt: string
  updatedAt: string
}

interface PageProps {
  params: Promise<{ id: string }>
}

function ProductDetailContent({ id }: { id: string }) {
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()

  const fetchProduct = async () => {
    try {
      setLoading(true)
      setError("")
      
      const response = await fetch(`/api/products/${id}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || "상품을 불러올 수 없습니다.")
        return
      }

      const data = await response.json()
      setProduct(data)
      
    } catch (error) {
      setError("상품을 불러오는 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProduct()
  }, [id])

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = () => {
    if (!product) return
    
    const priceInfo = getDisplayPrice(product)
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      discountPrice: priceInfo.hasDiscount ? priceInfo.currentPrice : undefined,
      quantity,
      image: product.images[0],
      inStock: product.inStock,
    })
    
    alert(`${product.name} ${quantity}개가 장바구니에 추가되었습니다.`)
  }

  const handleBuyNow = () => {
    if (!product) return
    
    // 장바구니에 추가하고 바로 결제 페이지로 이동
    const priceInfo = getDisplayPrice(product)
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      discountPrice: priceInfo.hasDiscount ? priceInfo.currentPrice : undefined,
      quantity,
      image: product.images[0],
      inStock: product.inStock,
    })
    
    router.push("/checkout")
  }

  const getDisplayPrice = (product: Product) => {
    if (product.discountRate > 0 && product.discountPrice) {
      return {
        currentPrice: product.discountPrice,
        originalPrice: product.price,
        hasDiscount: true,
      }
    }
    return {
      currentPrice: product.price,
      originalPrice: null,
      hasDiscount: false,
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-muted rounded"></div>
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
                <div className="h-12 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">상품을 찾을 수 없습니다</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button asChild>
                <Link href="/supplements">목록으로 돌아가기</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const priceInfo = getDisplayPrice(product)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link href="/supplements" className="hover:text-primary">보충제</Link>
          <span>/</span>
          {product.category && (
            <>
              <span>{product.category}</span>
              <span>/</span>
            </>
          )}
          <span className="text-foreground">{product.name}</span>
        </div>

        {/* Back Button */}
        <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          뒤로가기
        </Button>

        {/* Product Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square relative bg-muted rounded-lg overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[selectedImageIndex]}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Pill className="h-24 w-24 text-muted-foreground" />
                </div>
              )}
              
              {!product.inStock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Badge variant="secondary" className="bg-white text-black text-lg px-4 py-2">
                    품절
                  </Badge>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                      selectedImageIndex === index ? 'border-primary' : 'border-muted'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category & Stock Status */}
            <div className="flex items-center space-x-2">
              {product.category && (
                <Badge variant="outline">
                  {product.category}
                </Badge>
              )}
              <Badge variant={product.inStock ? "secondary" : "destructive"}>
                {product.inStock ? "재고 있음" : "품절"}
              </Badge>
              {product.discountRate > 0 && (
                <Badge variant="destructive">
                  {product.discountRate}% 할인
                </Badge>
              )}
            </div>

            {/* Product Name */}
            <h1 className="text-2xl lg:text-3xl font-bold">{product.name}</h1>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(priceInfo.currentPrice)}
                </span>
                {priceInfo.hasDiscount && priceInfo.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(priceInfo.originalPrice)}
                  </span>
                )}
              </div>
              {priceInfo.hasDiscount && (
                <p className="text-sm text-green-600">
                  {formatPrice(priceInfo.originalPrice! - priceInfo.currentPrice)} 절약!
                </p>
              )}
            </div>

            {/* Description */}
            <div className="prose max-w-none">
              <p className="text-muted-foreground whitespace-pre-line">
                {product.description}
              </p>
            </div>

            <Separator />

            {/* Quantity & Actions */}
            <div className="space-y-4">
              {/* Quantity Selector */}
              <div className="flex items-center space-x-4">
                <span className="font-medium">수량:</span>
                <div className="flex items-center border rounded-md">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= 10}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">
                  (최대 10개)
                </span>
              </div>

              {/* Total Price */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <span className="font-medium">총 금액:</span>
                <span className="text-xl font-bold text-primary">
                  {formatPrice(priceInfo.currentPrice * quantity)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  장바구니
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleBuyNow}
                  disabled={!product.inStock}
                >
                  바로 구매
                </Button>
              </div>

              {/* Wishlist & Share */}
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm">
                  <Heart className="h-4 w-4 mr-1" />
                  찜하기
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 className="h-4 w-4 mr-1" />
                  공유하기
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">품질 보증</h3>
              <p className="text-sm text-muted-foreground">
                엄격한 품질 관리를 통과한 검증된 제품
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Truck className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">빠른 배송</h3>
              <p className="text-sm text-muted-foreground">
                주문 후 1-2일 내 신속 배송
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <RotateCcw className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">안심 교환</h3>
              <p className="text-sm text-muted-foreground">
                7일 내 무료 교환/환불 가능
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Product Details */}
        <Card>
          <CardHeader>
            <CardTitle>상품 상세 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose max-w-none">
              <div className="whitespace-pre-line">
                {product.description}
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">제품 정보</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• 브랜드: 옆집약사 추천</li>
                  <li>• 제조국: 대한민국</li>
                  <li>• 보관방법: 실온 보관</li>
                  <li>• 유통기한: 제조일로부터 24개월</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">주의사항</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• 개봉 후 밀폐 보관</li>
                  <li>• 직사광선 피해 보관</li>
                  <li>• 알레르기 체질은 성분 확인</li>
                  <li>• 복용 전 전문가 상담 권장</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params
  return <ProductDetailContent id={id} />
}