"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Pill, 
  Search, 
  Filter, 
  ShoppingCart, 
  Star,
  Package,
  TrendingUp
} from "lucide-react"
import { formatPrice } from "@/lib/helpers"

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

interface ProductListResponse {
  products: Product[]
  totalCount: number
  currentPage: number
  totalPages: number
}

const productCategories = [
  { value: 'all', label: '전체' },
  { value: 'vitamin', label: '비타민' },
  { value: 'mineral', label: '미네랄' },
  { value: 'omega', label: '오메가3' },
  { value: 'probiotic', label: '프로바이오틱스' },
  { value: 'herb', label: '허브' },
  { value: 'immune', label: '면역력' },
  { value: 'antioxidant', label: '항산화' },
]

export default function SupplementsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const fetchProducts = async (page: number = 1, searchTerm: string = "", categoryFilter: string = "all") => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        inStock: "true",
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
      })

      const response = await fetch(`/api/products?${params}`)
      if (response.ok) {
        const data: ProductListResponse = await response.json()
        setProducts(data.products)
        setCurrentPage(data.currentPage)
        setTotalPages(data.totalPages)
        setTotalCount(data.totalCount)
      }
    } catch (error) {
      console.error("Failed to fetch products:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts(currentPage, search, category)
  }, [currentPage, category])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchProducts(1, search, category)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory)
    setCurrentPage(1)
  }

  const getDisplayPrice = (product: Product) => {
    if (product.discountRate > 0 && product.discountPrice) {
      return (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-primary">
              {formatPrice(product.discountPrice)}
            </span>
            <Badge variant="destructive" className="text-xs">
              {product.discountRate}% 할인
            </Badge>
          </div>
          <span className="text-sm text-muted-foreground line-through">
            {formatPrice(product.price)}
          </span>
        </div>
      )
    }
    return (
      <span className="text-lg font-bold">
        {formatPrice(product.price)}
      </span>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Pill className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">보충제 궁금해요</h1>
          </div>
          <p className="text-muted-foreground mb-6">
            전문가가 추천하는 검증된 건강 보충제를 만나보세요.
            안전하고 효과적인 제품으로 건강을 지켜드립니다.
          </p>

          {/* Search & Filter */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex flex-1 max-w-md space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="상품명으로 검색..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch}>검색</Button>
            </div>
            
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {productCategories.map((cat) => (
                <Button
                  key={cat.value}
                  variant={category === cat.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryChange(cat.value)}
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">전체 상품</p>
                  <p className="text-2xl font-bold">{totalCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Pill className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">재고 있음</p>
                  <p className="text-2xl font-bold">
                    {products.filter(p => p.inStock).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">할인 상품</p>
                  <p className="text-2xl font-bold">
                    {products.filter(p => p.discountRate > 0).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i}>
                <div className="aspect-square bg-muted animate-pulse"></div>
                <CardContent className="p-4">
                  <div className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-full mb-1"></div>
                    <div className="h-6 bg-muted rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">상품이 없습니다</h3>
              <p className="text-muted-foreground">
                조건에 맞는 상품을 찾을 수 없습니다.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                {/* Product Image */}
                <Link href={`/supplements/${product.id}`}>
                  <div className="aspect-square relative bg-muted">
                    {product.images && product.images.length > 0 ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Pill className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                    
                    {/* Discount Badge */}
                    {product.discountRate > 0 && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="destructive">
                          {product.discountRate}% 할인
                        </Badge>
                      </div>
                    )}
                    
                    {/* Out of Stock Badge */}
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge variant="secondary" className="bg-white text-black">
                          품절
                        </Badge>
                      </div>
                    )}
                  </div>
                </Link>

                {/* Product Info */}
                <CardContent className="p-4">
                  <div className="mb-2">
                    {product.category && (
                      <Badge variant="outline" className="text-xs mb-2">
                        {productCategories.find(cat => cat.value === product.category)?.label || product.category}
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                    <Link 
                      href={`/supplements/${product.id}`}
                      className="hover:text-primary transition-colors"
                    >
                      {product.name}
                    </Link>
                  </h3>
                  
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      {getDisplayPrice(product)}
                    </div>
                    
                    <Button 
                      size="sm"
                      disabled={!product.inStock}
                      className="h-8"
                    >
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      {product.inStock ? "구매" : "품절"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                이전
              </Button>
              
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 2 && page <= currentPage + 2)
                ) {
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  )
                } else if (
                  page === currentPage - 3 ||
                  page === currentPage + 3
                ) {
                  return <span key={page} className="px-2">...</span>
                }
                return null
              })}
              
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                다음
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}