"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RichEditor } from "@/components/ui/rich-editor"
import {
  ArrowLeft,
  Save,
  Eye,
  FileText,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function NewContentPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "LIFESTYLE" as "LIFESTYLE" | "TREATMENT" | "NOTICE",
    published: false
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      setErrorMessage("제목을 입력해주세요.")
      return
    }

    if (!formData.content.trim()) {
      setErrorMessage("내용을 입력해주세요.")
      return
    }

    setIsLoading(true)
    setErrorMessage("")

    try {
      console.log("==== CLIENT SUBMIT DEBUG ====")
      console.log("formData.published:", formData.published)
      console.log("Full requestBody:", JSON.stringify(formData, null, 2))
      console.log("==============================")
      
      const response = await fetch("/api/admin/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const result = await response.json()
        setSuccessMessage(formData.published ? "콘텐츠가 성공적으로 발행되었습니다!" : "임시저장되었습니다!")

        // 3초 후 목록으로 이동
        setTimeout(() => {
          router.push("/admin/content")
        }, 1500)
      } else {
        const error = await response.json()
        setErrorMessage(error.message || "저장 중 오류가 발생했습니다.")
      }
    } catch (error) {
      console.error("Submit error:", error)
      setErrorMessage("저장 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryText = (category: string) => {
    switch (category) {
      case "LIFESTYLE": return "생활습관"
      case "TREATMENT": return "치료정보"
      case "NOTICE": return "공지사항"
      default: return category
    }
  }

  if (previewMode) {
    return (
      <div className="space-y-6">
        {/* Preview Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setPreviewMode(false)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              편집으로 돌아가기
            </Button>
            <Badge variant="outline">미리보기</Badge>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "저장 중..." : "저장"}
            </Button>
          </div>
        </div>

        {/* Preview Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2 mb-2">
              <CardTitle className="text-2xl">{formData.title || "제목을 입력하세요"}</CardTitle>
              <Badge variant="outline">{getCategoryText(formData.category)}</Badge>
            </div>
            {formData.excerpt && (
              <p className="text-lg text-muted-foreground">{formData.excerpt}</p>
            )}
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              {formData.content ? (
                <div dangerouslySetInnerHTML={{ __html: formData.content }} />
              ) : (
                <p className="text-muted-foreground italic">내용을 입력하세요</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            asChild
          >
            <Link href="/admin/content">
              <ArrowLeft className="h-4 w-4 mr-2" />
              목록으로
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">새 콘텐츠 작성</h1>
            <p className="text-muted-foreground">
              건강 정보 콘텐츠를 작성하여 환자들에게 도움이 되는 정보를 제공하세요.
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(true)}
          >
            <Eye className="h-4 w-4 mr-2" />
            미리보기
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "저장 중..." : "저장"}
          </Button>
        </div>
      </div>

      {/* Messages */}
      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Content Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">제목 *</Label>
                <Input
                  id="title"
                  placeholder="콘텐츠 제목을 입력하세요"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">요약 (선택사항)</Label>
                <Textarea
                  id="excerpt"
                  placeholder="콘텐츠의 간단한 요약을 입력하세요 (검색 결과에 표시됩니다)"
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange("excerpt", e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>내용 작성</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="content">내용 * (이미지를 삽입하려면 툴바의 이미지 아이콘을 클릭하세요)</Label>
                <RichEditor
                  value={formData.content}
                  onChange={(value) => handleInputChange("content", value)}
                  placeholder="콘텐츠 내용을 입력하세요..."
                />
                <p className="text-sm text-muted-foreground">
                  환자들에게 도움이 되는 정확하고 신뢰할 수 있는 정보를 제공해주세요.
                  이미지, 링크, 동영상 등 다양한 미디어를 활용하여 풍부한 콘텐츠를 작성할 수 있습니다.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>발행 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">카테고리</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                >
                  <option value="LIFESTYLE">생활습관</option>
                  <option value="TREATMENT">치료정보</option>
                  <option value="NOTICE">공지사항</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="published">발행 상태</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="published"
                    checked={formData.published}
                    onCheckedChange={(checked) => handleInputChange("published", checked)}
                  />
                  <Label htmlFor="published" className="font-normal">
                    {formData.published ? "발행됨" : "임시저장"}
                  </Label>
                </div>
              </div>

            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>작성 가이드</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium mb-1">📝 작성 시 주의사항</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• 의학적으로 정확한 정보를 제공하세요</li>
                    <li>• 환자가 이해하기 쉬운 용어를 사용하세요</li>
                    <li>• 개인차가 있음을 명시하세요</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-1">🎯 권장 구성</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• 도입부: 주제 소개</li>
                    <li>• 본문: 상세 설명</li>
                    <li>• 결론: 요약 및 권장사항</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}