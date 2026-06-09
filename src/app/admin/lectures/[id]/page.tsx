"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { LectureForm, type LectureFormValues } from "../LectureForm"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileStack, Plus, AlertCircle, CheckCircle } from "lucide-react"
import { formatDate } from "@/lib/helpers"

interface Revision {
  id: string
  note: string
  createdAt: string
}

export default function EditLecturePage() {
  const params = useParams()
  const id = params.id as string

  const [initial, setInitial] = useState<LectureFormValues | null>(null)
  const [revisions, setRevisions] = useState<Revision[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // 추가본 입력 상태
  const [note, setNote] = useState("")
  const [adding, setAdding] = useState(false)
  const [revError, setRevError] = useState("")
  const [revSuccess, setRevSuccess] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/lectures/${id}`)
        if (!res.ok) {
          setNotFound(true)
          return
        }
        const data = await res.json()
        setInitial({
          id: data.id,
          slug: data.slug,
          title: data.title,
          date: data.date ? String(data.date).slice(0, 10) : "",
          sequence: data.sequence != null ? String(data.sequence) : "",
          status: data.status,
          summary: data.summary || "",
          body: data.body || "",
          topics: (data.topics || []).map((t: { name: string }) => t.name).join(", "),
          tags: (data.tags || []).join(", "),
          keyPoints: (data.keyPoints || []).join("\n"),
          questions: (data.questions || []).join("\n"),
        })
        setRevisions(data.revisions || [])
      } catch (e) {
        console.error("Failed to load lecture:", e)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const addRevision = async () => {
    if (!note.trim()) return setRevError("추가본 내용을 입력해주세요.")
    setAdding(true)
    setRevError("")
    try {
      const res = await fetch(`/api/lectures/${id}/revisions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: note.trim() }),
      })
      if (res.ok) {
        const created: Revision = await res.json()
        setRevisions((prev) => [...prev, created])
        setNote("")
        setRevSuccess("추가본이 등록되었습니다.")
        setTimeout(() => setRevSuccess(""), 1500)
      } else {
        const data = await res.json().catch(() => ({}))
        setRevError(data.error || "추가본 등록 중 오류가 발생했습니다.")
      }
    } catch (e) {
      console.error("Add revision error:", e)
      setRevError("추가본 등록 중 오류가 발생했습니다.")
    } finally {
      setAdding(false)
    }
  }

  if (loading) {
    return <div className="animate-pulse text-muted-foreground">로딩 중...</div>
  }

  if (notFound || !initial) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>강의 노트를 찾을 수 없습니다.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-8">
      <LectureForm mode="edit" initial={initial} />

      {/* 추가본(addendum) 관리 — 별도 URL이 아니라 버전으로 누적 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileStack className="h-5 w-5 text-primary" />
            추가본 관리 ({revisions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {revisions.length > 0 && (
            <div className="space-y-2">
              {revisions.map((rev, i) => (
                <div key={rev.id} className="rounded-md border p-3 text-sm">
                  <p className="text-xs text-muted-foreground mb-1">
                    추가본 #{i + 1} · {formatDate(new Date(rev.createdAt))}
                  </p>
                  <p className="whitespace-pre-wrap">{rev.note}</p>
                </div>
              ))}
            </div>
          )}

          {revError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{revError}</AlertDescription>
            </Alert>
          )}
          {revSuccess && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{revSuccess}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="note">새 추가본</Label>
            <Textarea
              id="note"
              placeholder="원본 정리 이후 보완할 내용을 입력하세요."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
            />
            <Button onClick={addRevision} disabled={adding} variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              {adding ? "등록 중..." : "추가본 등록"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
