"use client"

import { useState, useEffect, useRef } from "react"
import { getImageUrl } from "@/lib/image-url"
import { formatPrice } from "@/lib/helpers"
import { discountRate } from "@/lib/recommended-products"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Image as ImageIcon,
  Plus,
  Edit,
  Trash2,
  Save,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Loader2,
  Upload,
  Link as LinkIcon,
  Star,
} from "lucide-react"

interface RecommendedProduct {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  price: number
  originalPrice: number | null
  rating: number
  reviewCount: number
  purchaseUrl: string | null
  isActive: boolean
  order: number
  createdAt: string
  updatedAt: string
}

const emptyForm = {
  name: "",
  description: "",
  imageUrl: "",
  price: "",
  originalPrice: "",
  rating: "0",
  reviewCount: "0",
  purchaseUrl: "",
  isActive: true,
}

export default function RecommendedProductsPage() {
  const [products, setProducts] = useState<RecommendedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState<RecommendedProduct | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [reordering, setReordering] = useState(false)
  const [uploadMethod, setUploadMethod] = useState<"file" | "url">("file")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState(emptyForm)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/recommended-products")
      if (response.ok) {
        setProducts(await response.json())
      } else {
        alert("추천 제품 목록을 불러오지 못했습니다.")
      }
    } catch (error) {
      console.error("Failed to fetch recommended products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (file: File) => {
    setUploading(true)
    try {
      const body = new FormData()
      body.append("file", file)

      const response = await fetch("/api/upload/products", { method: "POST", body })
      const data = await response.json()

      if (response.ok) {
        setFormData((prev) => ({ ...prev, imageUrl: data.imageUrl }))
      } else {
        alert(data.error || "업로드 중 오류가 발생했습니다.")
      }
    } catch (error) {
      console.error("File upload error:", error)
      alert("업로드 중 오류가 발생했습니다.")
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileUpload(file)
  }

  const resetForm = () => {
    setEditingProduct(null)
    setFormData(emptyForm)
    setUploadMethod("file")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const price = Number(formData.price)
    if (!formData.name.trim() || !formData.price || Number.isNaN(price)) {
      alert("제품명과 판매가는 필수입니다.")
      return
    }

    const originalPrice = formData.originalPrice ? Number(formData.originalPrice) : null
    if (originalPrice !== null && (Number.isNaN(originalPrice) || originalPrice < price)) {
      alert("정가는 판매가보다 크거나 같아야 합니다.")
      return
    }

    const rating = Number(formData.rating || 0)
    if (Number.isNaN(rating) || rating < 0 || rating > 5) {
      alert("평점은 0~5 사이로 입력해주세요.")
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(
        editingProduct
          ? `/api/admin/recommended-products/${editingProduct.id}`
          : "/api/admin/recommended-products",
        {
          method: editingProduct ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            imageUrl: formData.imageUrl.trim() || null,
            price,
            originalPrice,
            rating,
            reviewCount: Number(formData.reviewCount || 0),
            purchaseUrl: formData.purchaseUrl.trim() || null,
            isActive: formData.isActive,
          }),
        }
      )

      if (response.ok) {
        resetForm()
        setIsDialogOpen(false)
        fetchProducts()
      } else {
        const data = await response.json().catch(() => ({}))
        alert(data.error || "저장 중 오류가 발생했습니다.")
      }
    } catch (error) {
      console.error("Failed to save recommended product:", error)
      alert("저장 중 오류가 발생했습니다.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (product: RecommendedProduct) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || "",
      imageUrl: product.imageUrl || "",
      price: String(product.price),
      originalPrice: product.originalPrice === null ? "" : String(product.originalPrice),
      rating: String(product.rating),
      reviewCount: String(product.reviewCount),
      purchaseUrl: product.purchaseUrl || "",
      isActive: product.isActive,
    })
    setUploadMethod(product.imageUrl ? "url" : "file")
    setIsDialogOpen(true)
  }

  const handleDelete = async (product: RecommendedProduct) => {
    if (!confirm(`"${product.name}" 을(를) 삭제하시겠습니까?`)) return

    try {
      const response = await fetch(`/api/admin/recommended-products/${product.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchProducts()
      } else {
        alert("삭제 중 오류가 발생했습니다.")
      }
    } catch (error) {
      console.error("Failed to delete recommended product:", error)
      alert("삭제 중 오류가 발생했습니다.")
    }
  }

  const handleToggleActive = async (product: RecommendedProduct, isActive: boolean) => {
    // 낙관적 갱신 후 실패하면 서버 상태로 되돌린다.
    setProducts((prev) =>
      prev.map((item) => (item.id === product.id ? { ...item, isActive } : item))
    )

    try {
      const response = await fetch(`/api/admin/recommended-products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      })
      if (!response.ok) throw new Error("toggle failed")
    } catch (error) {
      console.error("Failed to toggle recommended product:", error)
      alert("상태 변경 중 오류가 발생했습니다.")
      fetchProducts()
    }
  }

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= products.length || reordering) return

    const current = products[index]
    const target = products[targetIndex]

    const reordered = [...products]
    reordered[index] = target
    reordered[targetIndex] = current
    setProducts(reordered)

    setReordering(true)
    try {
      // 두 항목의 order 값을 맞바꾼다. 같은 값이면 인덱스로 새로 부여한다.
      const currentOrder = current.order === target.order ? targetIndex : target.order
      const targetOrder = current.order === target.order ? index : current.order

      await Promise.all(
        [
          { id: current.id, order: currentOrder },
          { id: target.id, order: targetOrder },
        ].map(({ id, order }) =>
          fetch(`/api/admin/recommended-products/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order }),
          })
        )
      )
    } catch (error) {
      console.error("Failed to reorder recommended products:", error)
    } finally {
      setReordering(false)
      fetchProducts()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">추천제품 관리</h1>
          <p className="text-muted-foreground">
            보충제 페이지 상단에 노출되는 추천 제품을 관리합니다.
          </p>
        </div>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              추천 제품 추가
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "추천 제품 수정" : "추천 제품 추가"}
              </DialogTitle>
              <DialogDescription>
                외부 쇼핑몰 구매 링크로 연결되는 큐레이션 제품 정보를 입력하세요.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">제품명 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="예: 오메가3 1000mg"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="추천 이유나 제품 특징을 간단히 적어주세요."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>제품 이미지</Label>
                <Tabs
                  value={uploadMethod}
                  onValueChange={(value) => setUploadMethod(value as "file" | "url")}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="file">
                      <Upload className="h-4 w-4 mr-2" />
                      파일 업로드
                    </TabsTrigger>
                    <TabsTrigger value="url">
                      <LinkIcon className="h-4 w-4 mr-2" />
                      URL 입력
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="file" className="space-y-3">
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="recommendedProductImage"
                      />
                      <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          JPG, PNG, WebP 파일을 선택하세요 (최대 5MB)
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={uploading}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {uploading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              업로드 중...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              파일 선택
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="url" className="space-y-3">
                    <Input
                      value={formData.imageUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, imageUrl: e.target.value })
                      }
                      placeholder="https://example.com/product.jpg"
                    />
                  </TabsContent>
                </Tabs>

                {formData.imageUrl && (
                  <div className="mt-4 border rounded-lg overflow-hidden">
                    <div className="bg-muted/50 px-3 py-2 text-sm font-medium">미리보기</div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getImageUrl(formData.imageUrl)}
                      alt="Preview"
                      className="w-full h-48 object-contain bg-white"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">판매가 (원) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="29000"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="originalPrice">정가 (원)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.originalPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, originalPrice: e.target.value })
                    }
                    placeholder="비워두면 할인 표시 없음"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rating">평점 (0~5)</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reviewCount">리뷰 수</Label>
                  <Input
                    id="reviewCount"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.reviewCount}
                    onChange={(e) =>
                      setFormData({ ...formData, reviewCount: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchaseUrl">구매 링크</Label>
                <Input
                  id="purchaseUrl"
                  type="url"
                  value={formData.purchaseUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, purchaseUrl: e.target.value })
                  }
                  placeholder="https://smartstore.naver.com/..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
                <Label htmlFor="isActive">활성화 (사이트에 노출)</Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={submitting}
                >
                  취소
                </Button>
                <Button type="submit" disabled={submitting || uploading}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      처리 중...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingProduct ? "수정" : "추가"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* List */}
      {products.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">등록된 추천 제품이 없습니다</h3>
            <p className="text-muted-foreground">첫 번째 추천 제품을 추가해보세요.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {products.map((product, index) => {
            const rate = discountRate(product.price, product.originalPrice)

            return (
              <Card key={product.id} className={!product.isActive ? "opacity-60" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* 순서 변경 */}
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        disabled={index === 0 || reordering}
                        onClick={() => handleMove(index, "up")}
                        aria-label="위로 이동"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        disabled={index === products.length - 1 || reordering}
                        onClick={() => handleMove(index, "down")}
                        aria-label="아래로 이동"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* 썸네일 */}
                    <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={getImageUrl(product.imageUrl)}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none"
                          }}
                        />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>

                    {/* 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg truncate">{product.name}</h3>
                        {!product.isActive && <Badge variant="secondary">비노출</Badge>}
                        {rate > 0 && <Badge variant="destructive">{rate}% 할인</Badge>}
                      </div>

                      {product.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {product.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-2 text-sm flex-wrap">
                        <span className="font-bold text-primary">
                          {formatPrice(product.price)}
                        </span>
                        {rate > 0 && product.originalPrice !== null && (
                          <span className="text-muted-foreground line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {product.rating.toFixed(1)} ({product.reviewCount})
                        </span>
                      </div>

                      {product.purchaseUrl && (
                        <a
                          href={product.purchaseUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-2 text-xs text-muted-foreground hover:text-primary"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span className="truncate max-w-[320px]">{product.purchaseUrl}</span>
                        </a>
                      )}
                    </div>

                    {/* 액션 */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Switch
                        checked={product.isActive}
                        onCheckedChange={(checked) => handleToggleActive(product, checked)}
                        aria-label="노출 여부"
                      />
                      <Button variant="outline" size="icon" onClick={() => handleEdit(product)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(product)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
