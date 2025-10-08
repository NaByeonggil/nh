"use client"

import { useState, useEffect, useRef } from "react"
import { getImageUrl } from "@/lib/image-url"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Image as ImageIcon,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Loader2,
  Upload,
  Link
} from "lucide-react"

interface HeroImage {
  id: string
  imageUrl: string
  title: string
  subtitle: string | null
  linkUrl: string | null
  linkText: string | null
  isActive: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export default function HeroImagesPage() {
  const [images, setImages] = useState<HeroImage[]>([])
  const [loading, setLoading] = useState(true)
  const [editingImage, setEditingImage] = useState<HeroImage | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadMethod, setUploadMethod] = useState<"file" | "url">("file")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    imageUrl: "",
    title: "",
    subtitle: "",
    linkUrl: "",
    linkText: "",
    isActive: true,
  })

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/hero-images")
      if (response.ok) {
        const data = await response.json()
        setImages(data.sort((a: HeroImage, b: HeroImage) => a.order - b.order))
      }
    } catch (error) {
      console.error("Failed to fetch hero images:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload/hero-images", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({ ...prev, imageUrl: data.imageUrl }))
        alert("이미지가 업로드되었습니다.")
      } else {
        const errorData = await response.json()
        alert(errorData.error || "업로드 중 오류가 발생했습니다.")
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
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.imageUrl || !formData.title) {
      alert("이미지 URL과 제목은 필수입니다.")
      return
    }

    setSubmitting(true)

    try {
      const url = editingImage
        ? `/api/admin/hero-images/${editingImage.id}`
        : "/api/admin/hero-images"

      const method = editingImage ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          order: editingImage ? editingImage.order : images.length,
        }),
      })

      if (response.ok) {
        alert(editingImage ? "수정되었습니다." : "추가되었습니다.")
        resetForm()
        fetchImages()
        setIsAddDialogOpen(false)
      } else {
        alert("작업 중 오류가 발생했습니다.")
      }
    } catch (error) {
      console.error("Failed to save hero image:", error)
      alert("작업 중 오류가 발생했습니다.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (image: HeroImage) => {
    setEditingImage(image)
    setFormData({
      imageUrl: image.imageUrl,
      title: image.title,
      subtitle: image.subtitle || "",
      linkUrl: image.linkUrl || "",
      linkText: image.linkText || "",
      isActive: image.isActive,
    })
    setIsAddDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return

    try {
      const response = await fetch(`/api/admin/hero-images/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        alert("삭제되었습니다.")
        fetchImages()
      } else {
        alert("삭제 중 오류가 발생했습니다.")
      }
    } catch (error) {
      console.error("Failed to delete hero image:", error)
      alert("삭제 중 오류가 발생했습니다.")
    }
  }

  const handleOrderChange = async (id: string, direction: "up" | "down") => {
    const index = images.findIndex((img) => img.id === id)
    const targetIndex = direction === "up" ? index - 1 : index + 1

    if (targetIndex < 0 || targetIndex >= images.length) return

    const newImages = [...images]
    const temp = newImages[index]
    newImages[index] = newImages[targetIndex]
    newImages[targetIndex] = temp

    // Update order values
    newImages[index].order = index
    newImages[targetIndex].order = targetIndex

    setImages(newImages)

    // Update in database
    try {
      await fetch(`/api/admin/hero-images/${id}/order`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: targetIndex }),
      })

      await fetch(`/api/admin/hero-images/${newImages[index].id}/order`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: index }),
      })
    } catch (error) {
      console.error("Failed to update order:", error)
      fetchImages() // Refresh on error
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/hero-images/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      })

      if (response.ok) {
        fetchImages()
      }
    } catch (error) {
      console.error("Failed to toggle active state:", error)
    }
  }

  const resetForm = () => {
    setEditingImage(null)
    setFormData({
      imageUrl: "",
      title: "",
      subtitle: "",
      linkUrl: "",
      linkText: "",
      isActive: true,
    })
    setUploadMethod("file")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
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
          <h1 className="text-3xl font-bold tracking-tight">히어로 이미지 관리</h1>
          <p className="text-muted-foreground">
            홈페이지 메인 카루셀 이미지를 관리합니다.
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              이미지 추가
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingImage ? "히어로 이미지 수정" : "히어로 이미지 추가"}
              </DialogTitle>
              <DialogDescription>
                카루셀에 표시될 이미지 정보를 입력하세요.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>이미지 등록 방법 *</Label>
                <Tabs value={uploadMethod} onValueChange={(value) => setUploadMethod(value as "file" | "url")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="file">
                      <Upload className="h-4 w-4 mr-2" />
                      파일 업로드
                    </TabsTrigger>
                    <TabsTrigger value="url">
                      <Link className="h-4 w-4 mr-2" />
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
                        id="imageFile"
                      />
                      <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          JPG, PNG, WebP, GIF 파일을 선택하세요 (최대 10MB)
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
                    <div className="space-y-2">
                      <Label htmlFor="imageUrl">이미지 URL</Label>
                      <Input
                        id="imageUrl"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                {formData.imageUrl && (
                  <div className="mt-4 border rounded-lg overflow-hidden">
                    <div className="bg-muted/50 px-3 py-2 text-sm font-medium">미리보기</div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getImageUrl(formData.imageUrl)}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = ""
                        e.currentTarget.style.display = "none"
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">제목 *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="메인 제목"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle">부제목</Label>
                <Textarea
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="부제목 또는 설명"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="linkUrl">링크 URL</Label>
                  <Input
                    id="linkUrl"
                    value={formData.linkUrl}
                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                    placeholder="/supplements"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkText">링크 텍스트</Label>
                  <Input
                    id="linkText"
                    value={formData.linkText}
                    onChange={(e) => setFormData({ ...formData, linkText: e.target.value })}
                    placeholder="자세히 보기"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
                <Label htmlFor="isActive">활성화</Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false)
                    resetForm()
                  }}
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
                      {editingImage ? "수정" : "추가"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Images List */}
      {images.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">히어로 이미지가 없습니다</h3>
            <p className="text-muted-foreground">
              첫 번째 히어로 이미지를 추가해보세요.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {images.map((image, index) => (
            <Card key={image.id} className={!image.isActive ? "opacity-60" : ""}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  {/* Image Preview */}
                  <div className="w-32 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getImageUrl(image.imageUrl)}
                      alt={image.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = ""
                        e.currentTarget.style.display = "none"
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{image.title}</h3>
                        {image.subtitle && (
                          <p className="text-sm text-muted-foreground">
                            {image.subtitle}
                          </p>
                        )}
                        {image.linkUrl && (
                          <div className="flex items-center space-x-2 mt-1">
                            <ExternalLink className="h-3 w-3" />
                            <span className="text-xs text-muted-foreground">
                              {image.linkUrl} - {image.linkText || "링크"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        {/* Order Controls */}
                        <div className="flex flex-col">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOrderChange(image.id, "up")}
                            disabled={index === 0}
                            className="h-6 px-1"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOrderChange(image.id, "down")}
                            disabled={index === images.length - 1}
                            className="h-6 px-1"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Active Toggle */}
                        <Switch
                          checked={image.isActive}
                          onCheckedChange={(checked) =>
                            handleToggleActive(image.id, checked)
                          }
                        />

                        {/* Edit & Delete */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(image)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(image.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">사용 안내</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• <strong>파일 업로드:</strong> 로컬 컴퓨터에서 이미지 파일을 직접 업로드 (권장)</p>
          <p>• <strong>URL 입력:</strong> 외부 이미지 URL을 입력하여 사용</p>
          <p>• 이미지는 1920x600 픽셀 이상을 권장합니다.</p>
          <p>• 지원 형식: JPG, PNG, WebP, GIF (최대 10MB)</p>
          <p>• 순서는 위/아래 화살표로 조정할 수 있습니다.</p>
          <p>• 비활성화된 이미지는 홈페이지에 표시되지 않습니다.</p>
          <p>• 최대 10개까지 등록 가능합니다.</p>
        </CardContent>
      </Card>
    </div>
  )
}