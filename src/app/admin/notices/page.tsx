"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Bell,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Star,
} from "lucide-react"
import { formatDate } from "@/lib/helpers"

interface Notice {
  id: string
  title: string
  content: string
  important: boolean
  published: boolean
  isPopup: boolean
  popupStartDate: string | null
  popupEndDate: string | null
  popupShowOnce: boolean
  createdAt: string
}

interface FormState {
  title: string
  content: string
  important: boolean
  published: boolean
  isPopup: boolean
  popupStartDate: string
  popupEndDate: string
  popupShowOnce: boolean
}

const EMPTY_FORM: FormState = {
  title: "",
  content: "",
  important: false,
  published: true,
  isPopup: false,
  popupStartDate: "",
  popupEndDate: "",
  popupShowOnce: true,
}

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const fetchNotices = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/notices?admin=true")
      if (res.ok) {
        setNotices(await res.json())
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || "공지사항을 불러오지 못했습니다.")
      }
    } catch (e) {
      console.error("Failed to fetch notices:", e)
      setError("공지사항을 불러오지 못했습니다.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotices()
  }, [fetchNotices])

  const set = (field: keyof FormState, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm(true)
    setError("")
    setSuccess("")
  }

  const openEdit = (notice: Notice) => {
    setForm({
      title: notice.title,
      content: notice.content,
      important: notice.important,
      published: notice.published,
      isPopup: notice.isPopup,
      popupStartDate: notice.popupStartDate ? notice.popupStartDate.slice(0, 10) : "",
      popupEndDate: notice.popupEndDate ? notice.popupEndDate.slice(0, 10) : "",
      popupShowOnce: notice.popupShowOnce,
    })
    setEditingId(notice.id)
    setShowForm(true)
    setError("")
    setSuccess("")
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  const handleSubmit = async () => {
    if (!form.title.trim()) return setError("제목을 입력해주세요.")
    if (!form.content.trim()) return setError("내용을 입력해주세요.")

    setSaving(true)
    setError("")

    const payload = {
      ...form,
      title: form.title.trim(),
      content: form.content.trim(),
      popupStartDate: form.isPopup && form.popupStartDate ? form.popupStartDate : null,
      popupEndDate: form.isPopup && form.popupEndDate ? form.popupEndDate : null,
    }

    try {
      const url = editingId ? `/api/notices/${editingId}` : "/api/notices"
      const method = editingId ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setSuccess(editingId ? "공지사항이 수정되었습니다." : "공지사항이 등록되었습니다.")
        closeForm()
        fetchNotices()
        setTimeout(() => setSuccess(""), 2000)
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || "저장 중 오류가 발생했습니다.")
      }
    } catch (e) {
      console.error("Notice submit error:", e)
      setError("저장 중 오류가 발생했습니다.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (notice: Notice) => {
    if (!confirm(`"${notice.title}" 공지사항을 삭제할까요?`)) return
    try {
      const res = await fetch(`/api/notices/${notice.id}`, { method: "DELETE" })
      if (res.ok) {
        setNotices((prev) => prev.filter((n) => n.id !== notice.id))
      } else {
        const data = await res.json().catch(() => ({}))
        alert(data.error || "삭제 중 오류가 발생했습니다.")
      }
    } catch (e) {
      console.error("Delete error:", e)
      alert("삭제 중 오류가 발생했습니다.")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Bell className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">공지사항 관리</h1>
            <p className="text-muted-foreground">전체 {notices.length}개</p>
          </div>
        </div>
        {!showForm && (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />새 공지사항
          </Button>
        )}
      </div>

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "공지사항 수정" : "새 공지사항"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">제목 *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="공지사항 제목"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">내용 *</Label>
              <Textarea
                id="content"
                value={form.content}
                onChange={(e) => set("content", e.target.value)}
                placeholder="공지사항 내용"
                rows={8}
              />
            </div>

            <div className="flex flex-wrap gap-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  checked={form.published}
                  onCheckedChange={(c) => set("published", c)}
                />
                <Label htmlFor="published" className="font-normal">
                  {form.published ? "발행됨" : "미발행"}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="important"
                  checked={form.important}
                  onCheckedChange={(c) => set("important", c)}
                />
                <Label htmlFor="important" className="font-normal">
                  중요 공지
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPopup"
                  checked={form.isPopup}
                  onCheckedChange={(c) => set("isPopup", c)}
                />
                <Label htmlFor="isPopup" className="font-normal">
                  팝업으로 표시
                </Label>
              </div>
            </div>

            {/* 팝업 설정 */}
            {form.isPopup && (
              <div className="rounded-md border p-4 space-y-4 bg-muted/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="popupStartDate">팝업 시작일 (선택)</Label>
                    <Input
                      id="popupStartDate"
                      type="date"
                      value={form.popupStartDate}
                      onChange={(e) => set("popupStartDate", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="popupEndDate">팝업 종료일 (선택)</Label>
                    <Input
                      id="popupEndDate"
                      type="date"
                      value={form.popupEndDate}
                      onChange={(e) => set("popupEndDate", e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="popupShowOnce"
                    checked={form.popupShowOnce}
                    onCheckedChange={(c) => set("popupShowOnce", c)}
                  />
                  <Label htmlFor="popupShowOnce" className="font-normal">
                    하루에 한 번만 표시 (다시 보지 않기 지원)
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  시작·종료일을 비우면 발행 즉시부터 계속 노출됩니다.
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSubmit} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "저장 중..." : "저장"}
              </Button>
              <Button variant="outline" onClick={closeForm} disabled={saving}>
                <X className="h-4 w-4 mr-2" />
                취소
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List */}
      {loading ? (
        <div className="text-muted-foreground animate-pulse">로딩 중...</div>
      ) : notices.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">공지사항이 없습니다</h3>
            <p className="text-muted-foreground mb-4">첫 공지사항을 등록해보세요.</p>
            {!showForm && (
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" />새 공지사항
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notices.map((notice) => (
            <Card key={notice.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {notice.important && (
                        <Badge className="bg-red-50 text-red-700 text-xs flex items-center gap-1">
                          <Star className="h-3 w-3" /> 중요
                        </Badge>
                      )}
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          notice.published
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {notice.published ? "발행됨" : "미발행"}
                      </Badge>
                      {notice.isPopup && (
                        <Badge variant="outline" className="text-xs">
                          팝업
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDate(new Date(notice.createdAt))}
                      </span>
                    </div>
                    <h3 className="font-medium truncate">{notice.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1 whitespace-pre-wrap">
                      {notice.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => openEdit(notice)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(notice)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
