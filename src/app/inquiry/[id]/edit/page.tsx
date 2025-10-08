"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save, X } from "lucide-react"

interface InquiryData {
  id: string
  title: string
  content: string
  authorName?: string
  authorEmail?: string
  authorPhone?: string
  isPrivate: boolean
  password?: string
  attachments: string[]
  author?: {
    id: string
  }
}

interface PageProps {
  params: Promise<{ id: string }>
}

function EditInquiryContent({ id }: { id: string }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [inquiry, setInquiry] = useState<InquiryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    authorName: "",
    authorEmail: "",
    authorPhone: "",
    isPrivate: false,
    password: ""
  })

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin")
      return
    }
    
    fetchInquiry()
  }, [session, id])

  const fetchInquiry = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/inquiries/${id}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || "문의를 불러올 수 없습니다.")
        return
      }

      const data = await response.json()
      
      // 권한 체크: 작성자이거나 관리자인지 확인
      if (data.author?.id !== session?.user.id && session?.user.role !== "ADMIN") {
        setError("수정 권한이 없습니다.")
        return
      }

      setInquiry(data)
      setFormData({
        title: data.title,
        content: data.content,
        authorName: data.authorName || "",
        authorEmail: data.authorEmail || "",
        authorPhone: data.authorPhone || "",
        isPrivate: data.isPrivate,
        password: ""
      })
      
    } catch (error) {
      setError("문의를 불러오는 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.content.trim()) {
      alert("제목과 내용을 입력해주세요.")
      return
    }

    if (formData.isPrivate && !formData.password.trim()) {
      alert("비공개 문의인 경우 암호를 입력해주세요.")
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(`/api/inquiries/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push(`/inquiry/${id}`)
      } else {
        const errorData = await response.json()
        alert(errorData.error || "문의 수정 중 오류가 발생했습니다.")
      }
    } catch (error) {
      alert("문의 수정 중 오류가 발생했습니다.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <Card>
              <CardHeader>
                <div className="h-6 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-10 bg-muted rounded"></div>
                  <div className="h-32 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <X className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">오류가 발생했습니다</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button asChild>
                <Link href="/inquiry">목록으로 돌아가기</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!inquiry) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" asChild>
            <Link href={`/inquiry/${id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              뒤로가기
            </Link>
          </Button>
        </div>

        {/* Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle>문의 수정</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <Label htmlFor="title">제목 <span className="text-red-500">*</span></Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="문의 제목을 입력해주세요"
                  required
                />
              </div>

              {/* Author Info (for non-members or admin editing) */}
              {(!inquiry.author || session?.user.role === "ADMIN") && (
                <>
                  <div>
                    <Label htmlFor="authorName">이름</Label>
                    <Input
                      id="authorName"
                      value={formData.authorName}
                      onChange={(e) => handleChange("authorName", e.target.value)}
                      placeholder="이름을 입력해주세요"
                    />
                  </div>

                  <div>
                    <Label htmlFor="authorEmail">이메일</Label>
                    <Input
                      id="authorEmail"
                      type="email"
                      value={formData.authorEmail}
                      onChange={(e) => handleChange("authorEmail", e.target.value)}
                      placeholder="이메일을 입력해주세요"
                    />
                  </div>

                  <div>
                    <Label htmlFor="authorPhone">전화번호</Label>
                    <Input
                      id="authorPhone"
                      value={formData.authorPhone}
                      onChange={(e) => handleChange("authorPhone", e.target.value)}
                      placeholder="전화번호를 입력해주세요"
                    />
                  </div>
                </>
              )}

              {/* Content */}
              <div>
                <Label htmlFor="content">내용 <span className="text-red-500">*</span></Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleChange("content", e.target.value)}
                  placeholder="문의 내용을 입력해주세요"
                  rows={10}
                  required
                />
              </div>

              {/* Privacy Settings */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPrivate"
                    checked={formData.isPrivate}
                    onCheckedChange={(checked) => handleChange("isPrivate", checked as boolean)}
                  />
                  <Label htmlFor="isPrivate" className="text-sm">
                    비공개 문의 (암호 설정 필요)
                  </Label>
                </div>

                {formData.isPrivate && (
                  <div>
                    <Label htmlFor="password">암호 <span className="text-red-500">*</span></Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      placeholder="비공개 문의 암호를 입력해주세요"
                      required={formData.isPrivate}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      기존 암호를 변경하려면 새 암호를 입력하세요. 비워두면 기존 암호가 유지됩니다.
                    </p>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" asChild>
                  <Link href={`/inquiry/${id}`}>취소</Link>
                </Button>
                <Button type="submit" disabled={submitting}>
                  <Save className="h-4 w-4 mr-2" />
                  {submitting ? "수정 중..." : "수정 완료"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default async function EditInquiryPage({ params }: PageProps) {
  const { id } = await params
  return <EditInquiryContent id={id} />
}