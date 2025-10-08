"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Package, Loader2, Upload, X } from "lucide-react"
import { formatPrice } from "@/lib/helpers"

interface PageProps {
  params: Promise<{ id: string }>
}

function EditProductContent({ id }: { id: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discountPrice: "",
    category: "",
    stock: "",
    imageUrl: "",
    isActive: true,
    ingredients: "",
    usage: "",
    precautions: "",
    manufacturer: "",
    origin: "",
  })

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${id}`)
      if (response.ok) {
        const data = await response.json()
        setFormData({
          name: data.name || "",
          description: data.description || "",
          price: data.price?.toString() || "",
          discountPrice: data.discountPrice?.toString() || "",
          category: data.category || "",
          stock: data.stock?.toString() || "",
          imageUrl: data.imageUrl || "",
          isActive: data.isActive ?? true,
          ingredients: data.ingredients || "",
          usage: data.usage || "",
          precautions: data.precautions || "",
          manufacturer: data.manufacturer || "",
          origin: data.origin || "",
        })
        setImagePreview(data.imageUrl || null)
      } else {
        alert("상품 정보를 불러오는데 실패했습니다.")
        router.push("/admin/products")
      }
    } catch (error) {
      console.error("Failed to fetch product:", error)
      alert("상품 정보를 불러오는데 실패했습니다.")
      router.push("/admin/products")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    if (name === "imageUrl") {
      setImagePreview(value || null)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload/products", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.error || "이미지 업로드에 실패했습니다.")
        return
      }

      const data = await response.json()
      const imageUrl = data.imageUrl

      // formData 업데이트
      setFormData(prev => ({
        ...prev,
        imageUrl
      }))

      // 미리보기 설정
      setImagePreview(imageUrl)

    } catch (error) {
      console.error("이미지 업로드 오류:", error)
      alert("이미지 업로드 중 오류가 발생했습니다.")
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      imageUrl: ""
    }))
    setImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.price || !formData.category) {
      alert("필수 항목을 모두 입력해주세요.")
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
          stock: parseInt(formData.stock) || 0,
        })
      })

      if (response.ok) {
        alert("상품이 성공적으로 수정되었습니다.")
        router.push("/admin/products")
      } else {
        const error = await response.text()
        alert(`상품 수정 중 오류가 발생했습니다: ${error}`)
      }
    } catch (error) {
      console.error("Failed to update product:", error)
      alert("상품 수정 중 오류가 발생했습니다.")
    } finally {
      setSubmitting(false)
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            뒤로가기
          </Button>
          <div>
            <h1 className="text-2xl font-bold">상품 수정</h1>
            <p className="text-muted-foreground">
              상품 정보를 수정하세요.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
            <CardDescription>
              상품의 기본 정보를 수정하세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">상품명 *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="예: 비타민 C 1000mg"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">카테고리 *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData(prev => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="카테고리 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vitamin">비타민</SelectItem>
                    <SelectItem value="mineral">미네랄</SelectItem>
                    <SelectItem value="omega3">오메가3</SelectItem>
                    <SelectItem value="probiotics">프로바이오틱스</SelectItem>
                    <SelectItem value="protein">프로틴</SelectItem>
                    <SelectItem value="other">기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">상품 설명</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="상품에 대한 간단한 설명을 입력하세요."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">판매가 (원) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="30000"
                  required
                  min="0"
                  step="100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountPrice">할인가 (원)</Label>
                <Input
                  id="discountPrice"
                  name="discountPrice"
                  type="number"
                  value={formData.discountPrice}
                  onChange={handleChange}
                  placeholder="25000"
                  min="0"
                  step="100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">재고 수량</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="100"
                  min="0"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData(prev => ({ ...prev, isActive: checked }))
                }
              />
              <Label htmlFor="isActive">판매 활성화</Label>
            </div>
          </CardContent>
        </Card>

        {/* 상세 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>상세 정보</CardTitle>
            <CardDescription>
              상품의 상세 정보를 수정하세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ingredients">성분</Label>
              <Textarea
                id="ingredients"
                name="ingredients"
                value={formData.ingredients}
                onChange={handleChange}
                placeholder="주요 성분을 입력하세요."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="usage">복용 방법</Label>
              <Textarea
                id="usage"
                name="usage"
                value={formData.usage}
                onChange={handleChange}
                placeholder="1일 1회, 1회 1정을 충분한 물과 함께 복용하세요."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="precautions">주의사항</Label>
              <Textarea
                id="precautions"
                name="precautions"
                value={formData.precautions}
                onChange={handleChange}
                placeholder="임산부, 수유부는 복용 전 의사와 상담하세요."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manufacturer">제조사</Label>
                <Input
                  id="manufacturer"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  placeholder="○○제약"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="origin">원산지</Label>
                <Input
                  id="origin"
                  name="origin"
                  value={formData.origin}
                  onChange={handleChange}
                  placeholder="대한민국"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 이미지 */}
        <Card>
          <CardHeader>
            <CardTitle>상품 이미지</CardTitle>
            <CardDescription>
              파일을 업로드하거나 이미지 URL을 직접 입력하세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 파일 업로드 */}
            <div className="space-y-2">
              <Label>이미지 파일 업로드</Label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                  id="imageFileInput"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('imageFileInput')?.click()}
                  disabled={uploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? '업로드 중...' : '파일 선택'}
                </Button>
                {imagePreview && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4 mr-2" />
                    제거
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                JPG, PNG, WebP 파일을 지원합니다 (최대 5MB)
              </p>
            </div>

            {/* 또는 URL 직접 입력 */}
            <div className="space-y-2">
              <Label htmlFor="imageUrl">또는 이미지 URL 직접 입력</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                disabled={uploading}
              />
            </div>

            {/* 이미지 미리보기 */}
            {imagePreview && (
              <div className="border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">미리보기</p>
                <div className="aspect-square max-w-xs mx-auto bg-muted rounded-lg overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="상품 이미지 미리보기"
                    className="w-full h-full object-cover"
                    onError={() => setImagePreview(null)}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 버튼 */}
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={submitting}
          >
            취소
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                처리 중...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                변경사항 저장
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params
  return <EditProductContent id={id} />
}