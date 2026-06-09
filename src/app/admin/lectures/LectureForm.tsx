"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RichEditor } from "@/components/ui/rich-editor"
import { ArrowLeft, Save, AlertCircle, CheckCircle } from "lucide-react"

export interface LectureFormValues {
  id?: string
  slug?: string
  title: string
  date: string // yyyy-MM-dd
  sequence: string // 빈 문자열 허용 (입력값)
  status: "DRAFT" | "REVIEWED" | "FINAL"
  summary: string
  body: string
  topics: string // 쉼표 구분
  tags: string // 쉼표 구분
  keyPoints: string // 줄바꿈 구분
  questions: string // 줄바꿈 구분
}

const STATUS_OPTIONS: { value: LectureFormValues["status"]; label: string }[] = [
  { value: "DRAFT", label: "작성중 (DRAFT)" },
  { value: "REVIEWED", label: "검토됨 (REVIEWED)" },
  { value: "FINAL", label: "최종본 (FINAL)" },
]

const splitLines = (s: string) =>
  s.split("\n").map((v) => v.trim()).filter(Boolean)

const splitCommas = (s: string) =>
  s.split(",").map((v) => v.trim()).filter(Boolean)

export function LectureForm({
  initial,
  mode,
}: {
  initial: LectureFormValues
  mode: "create" | "edit"
}) {
  const router = useRouter()
  const [form, setForm] = useState<LectureFormValues>(initial)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const set = (field: keyof LectureFormValues, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async () => {
    if (!form.title.trim()) return setError("제목을 입력해주세요.")
    if (!form.date) return setError("강의 날짜를 입력해주세요.")

    setIsLoading(true)
    setError("")

    const payload = {
      title: form.title.trim(),
      date: form.date,
      sequence: form.sequence ? parseInt(form.sequence, 10) : undefined,
      status: form.status,
      summary: form.summary.trim() || undefined,
      body: form.body.trim() || undefined,
      topics: splitCommas(form.topics),
      tags: splitCommas(form.tags),
      keyPoints: splitLines(form.keyPoints),
      questions: splitLines(form.questions),
    }

    try {
      const url =
        mode === "create" ? "/api/lectures" : `/api/lectures/${initial.id}`
      const method = mode === "create" ? "POST" : "PATCH"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setSuccess(mode === "create" ? "강의 노트가 등록되었습니다!" : "수정되었습니다!")
        setTimeout(() => router.push("/admin/lectures"), 1200)
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || "저장 중 오류가 발생했습니다.")
        setIsLoading(false)
      }
    } catch (e) {
      console.error("Lecture submit error:", e)
      setError("저장 중 오류가 발생했습니다.")
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button variant="outline" asChild>
            <Link href="/admin/lectures">
              <ArrowLeft className="h-4 w-4 mr-2" />
              목록으로
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {mode === "create" ? "새 강의 요약 작성" : "강의 요약 수정"}
            </h1>
            <p className="text-muted-foreground">
              기록은 날짜별로, 탐색은 주제별로 정리합니다.
            </p>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? "저장 중..." : "저장"}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
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
                  placeholder="예: 약동학 기초 - 흡수와 분포"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="summary">요약</Label>
                <Textarea
                  id="summary"
                  placeholder="강의 한두 줄 요약 (목록·검색에 노출됩니다)"
                  value={form.summary}
                  onChange={(e) => set("summary", e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>본문 및 정리</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="keyPoints">핵심 포인트 (한 줄에 하나)</Label>
                <Textarea
                  id="keyPoints"
                  placeholder={"흡수 속도는 제형에 따라 달라진다\n분포용적은 약물의 친유성과 관련된다"}
                  value={form.keyPoints}
                  onChange={(e) => set("keyPoints", e.target.value)}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body">본문</Label>
                <RichEditor
                  value={form.body}
                  onChange={(value) => set("body", value)}
                  placeholder="강의 상세 내용을 입력하세요. 툴바로 서식·이미지를 넣을 수 있습니다."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="questions">추가 확인할 질문 (한 줄에 하나)</Label>
                <Textarea
                  id="questions"
                  placeholder={"신장애 환자에서 용량 조절은?\n약물 상호작용 사례 정리"}
                  value={form.questions}
                  onChange={(e) => set("questions", e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>강의 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">강의 날짜 * (요일은 자동 표시)</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.date}
                  onChange={(e) => set("date", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sequence">회차</Label>
                <Input
                  id="sequence"
                  type="number"
                  min={1}
                  placeholder="예: 12"
                  value={form.sequence}
                  onChange={(e) => set("sequence", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">상태</Label>
                <select
                  id="status"
                  value={form.status}
                  onChange={(e) => set("status", e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>분류</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="topics">주제 (쉼표로 구분)</Label>
                <Input
                  id="topics"
                  placeholder="약동학, 약물 상호작용"
                  value={form.topics}
                  onChange={(e) => set("topics", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  입력한 주제는 없으면 자동 생성되어 주제 허브에 연결됩니다.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">태그 (쉼표로 구분)</Label>
                <Input
                  id="tags"
                  placeholder="기초, 시험범위"
                  value={form.tags}
                  onChange={(e) => set("tags", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
