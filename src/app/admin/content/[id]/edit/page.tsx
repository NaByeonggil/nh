"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Eye, Upload, X } from "lucide-react"
import Image from "next/image"
import { CONTENT_CATEGORIES } from "@/lib/constants"

// Import the RichEditor component
import { RichEditor } from "@/components/ui/rich-editor"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditContentPage({ params }: PageProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [content, setContent] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "LIFESTYLE",
    published: false,
    thumbnail: ""
  })

  useEffect(() => {
    const loadContent = async () => {
      const resolvedParams = await params
      fetchContent(resolvedParams.id)
    }
    loadContent()
  }, [params])

  const fetchContent = async (contentId: string) => {
    try {
      const response = await fetch(`/api/content/${contentId}`)
      if (response.ok) {
        const data = await response.json()
        setContent(data)
      } else {
        alert("콘텐츠를 불러올 수 없습니다.")
        router.push("/admin/content")
      }
    } catch (error) {
      console.error("Failed to fetch content:", error)
      alert("콘텐츠를 불러오는 중 오류가 발생했습니다.")
      router.push("/admin/content")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    const resolvedParams = await params
    try {
      const response = await fetch(`/api/content/${resolvedParams.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(content)
      })

      if (response.ok) {
        alert("콘텐츠가 수정되었습니다.")
        router.push("/admin/content")
      } else {
        const error = await response.text()
        alert(`저장 중 오류가 발생했습니다: ${error}`)
      }
    } catch (error) {
      console.error("Failed to save content:", error)
      alert("저장 중 오류가 발생했습니다.")
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/upload/content", {
        method: "POST",
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setContent({ ...content, thumbnail: data.url })
      } else {
        alert("이미지 업로드에 실패했습니다.")
      }
    } catch (error) {
      console.error("Failed to upload image:", error)
      alert("이미지 업로드 중 오류가 발생했습니다.")
    }
  }


  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">콘텐츠 수정</h1>
          <p className="text-muted-foreground">콘텐츠를 수정하고 업데이트하세요.</p>
        </div>
        <Button variant="ghost" asChild>
          <Link href="/admin/content">
            <ArrowLeft className="h-4 w-4 mr-2" />
            목록으로
          </Link>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">제목 *</Label>
              <Input
                id="title"
                value={content.title}
                onChange={(e) => setContent({ ...content, title: e.target.value })}
                placeholder="콘텐츠 제목을 입력하세요"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">요약</Label>
              <Textarea
                id="excerpt"
                value={content.excerpt}
                onChange={(e) => setContent({ ...content, excerpt: e.target.value })}
                placeholder="콘텐츠 요약을 입력하세요 (검색 결과에 표시됨)"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">카테고리</Label>
                <Select
                  value={content.category}
                  onValueChange={(value) => setContent({ ...content, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LIFESTYLE">생활습관 식이요법</SelectItem>
                    <SelectItem value="TREATMENT">표준치료 동향</SelectItem>
                    <SelectItem value="NOTICE">공지사항</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="published">발행 상태</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="published"
                    checked={content.published}
                    onCheckedChange={(checked) => setContent({ ...content, published: checked })}
                  />
                  <Label htmlFor="published" className="font-normal">
                    {content.published ? "발행됨" : "임시저장"}
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Thumbnail */}
        <Card>
          <CardHeader>
            <CardTitle>썸네일 이미지</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {content.thumbnail && (
                <div className="relative w-full max-w-md">
                  <Image
                    src={content.thumbnail}
                    alt="썸네일"
                    width={400}
                    height={225}
                    className="rounded-lg object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setContent({ ...content, thumbnail: "" })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              <div>
                <Label htmlFor="thumbnail-upload" className="cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">클릭하여 이미지를 업로드하세요</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF (최대 5MB)</p>
                  </div>
                  <input
                    id="thumbnail-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file)
                    }}
                  />
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle>내용</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="min-h-[400px]">
              <RichEditor
                value={content.content}
                onChange={(value) => setContent({ ...content, content: value })}
                placeholder="콘텐츠 내용을 입력하세요..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/content")}
          >
            취소
          </Button>
          
          <div className="space-x-2">
            {content.category !== "NOTICE" && (
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  const resolvedParams = await params
                  const url = content.category === "LIFESTYLE" 
                    ? `/lifestyle/${resolvedParams.id}`
                    : `/treatment/${resolvedParams.id}`
                  window.open(url, "_blank")
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                미리보기
              </Button>
            )}
            
            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "저장 중..." : "저장"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}