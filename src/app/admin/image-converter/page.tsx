"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Wand2,
  Upload,
  Download,
  ImageIcon,
  Loader2,
  X,
  AlertCircle,
  ArrowRight,
} from "lucide-react"
import { formatFileSize } from "@/lib/helpers"

const FORMATS = [
  { value: "webp", label: "WebP (권장·고압축)" },
  { value: "jpeg", label: "JPEG" },
  { value: "png", label: "PNG (무손실)" },
  { value: "avif", label: "AVIF (최신·최고압축)" },
]

interface ConvertResult {
  originalName: string
  url: string
  format: string
  originalSize: number
  convertedSize: number
  savedPercent: number
  width: number | null
  height: number | null
}

export default function ImageConverterPage() {
  const [files, setFiles] = useState<File[]>([])
  const [format, setFormat] = useState("webp")
  const [quality, setQuality] = useState(80)
  const [maxWidth, setMaxWidth] = useState("")
  const [converting, setConverting] = useState(false)
  const [results, setResults] = useState<ConvertResult[]>([])
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const onPick = (fileList: FileList | null) => {
    if (!fileList) return
    setFiles(Array.from(fileList))
    setResults([])
    setError("")
  }

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleConvert = async () => {
    if (files.length === 0) {
      setError("변환할 이미지를 선택해주세요.")
      return
    }
    setConverting(true)
    setError("")
    setResults([])

    try {
      const fd = new FormData()
      files.forEach((f) => fd.append("files", f))
      fd.append("format", format)
      fd.append("quality", String(quality))
      if (maxWidth) fd.append("maxWidth", maxWidth)

      const res = await fetch("/api/admin/image-converter", { method: "POST", body: fd })
      const data = await res.json()
      if (res.ok) {
        setResults(data.results)
      } else {
        setError(data.error || "변환에 실패했습니다.")
      }
    } catch (e) {
      console.error("convert error:", e)
      setError("변환 중 오류가 발생했습니다.")
    } finally {
      setConverting(false)
    }
  }

  const totalOriginal = results.reduce((s, r) => s + r.originalSize, 0)
  const totalConverted = results.reduce((s, r) => s + r.convertedSize, 0)
  const totalSaved =
    totalOriginal > 0 ? Math.round((1 - totalConverted / totalOriginal) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Wand2 className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">이미지 변환</h1>
          <p className="text-muted-foreground">
            이미지를 WebP·AVIF 등으로 변환해 용량을 줄입니다. (최대 20MB/장)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 입력 + 옵션 */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>이미지 선택</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/40 transition-colors"
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  onPick(e.dataTransfer.files)
                }}
              >
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  클릭하거나 이미지를 끌어다 놓으세요 (여러 장 가능)
                </p>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => onPick(e.target.files)}
                />
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  {files.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-sm border rounded-md px-3 py-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <ImageIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="truncate">{f.name}</span>
                        <span className="text-muted-foreground shrink-0">
                          ({formatFileSize(f.size)})
                        </span>
                      </div>
                      <button onClick={() => removeFile(i)} className="text-muted-foreground hover:text-destructive">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 결과 */}
          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>변환 결과</span>
                  <Badge className="bg-green-50 text-green-700">
                    총 {formatFileSize(totalOriginal)} → {formatFileSize(totalConverted)} ({totalSaved}% 절감)
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {results.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 border rounded-md p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.url} alt={r.originalName} className="h-14 w-14 object-cover rounded border" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{r.originalName}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap">
                        <span>{formatFileSize(r.originalSize)}</span>
                        <ArrowRight className="h-3 w-3" />
                        <span className="text-foreground font-medium">{formatFileSize(r.convertedSize)}</span>
                        <Badge variant="outline" className="text-[10px] uppercase">{r.format}</Badge>
                        {r.width && <span>{r.width}×{r.height}</span>}
                        <Badge
                          variant="secondary"
                          className={r.savedPercent >= 0 ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}
                        >
                          {r.savedPercent >= 0 ? `${r.savedPercent}% 절감` : `${-r.savedPercent}% 증가`}
                        </Badge>
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={r.url} download>
                        <Download className="h-4 w-4 mr-1" /> 저장
                      </a>
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* 옵션 사이드바 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>변환 옵션</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="format">변환 형식</Label>
                <select
                  id="format"
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                >
                  {FORMATS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quality">
                  품질: <span className="font-semibold">{quality}</span>
                  {format === "png" && <span className="text-xs text-muted-foreground"> (PNG는 무손실 압축)</span>}
                </Label>
                <input
                  id="quality"
                  type="range"
                  min={1}
                  max={100}
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value, 10))}
                  className="w-full accent-primary"
                />
                <p className="text-xs text-muted-foreground">낮을수록 용량↓ 화질↓ (권장 75~85)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxWidth">최대 가로폭 (px, 선택)</Label>
                <Input
                  id="maxWidth"
                  type="number"
                  min={1}
                  placeholder="예: 1200 (비우면 원본 유지)"
                  value={maxWidth}
                  onChange={(e) => setMaxWidth(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">큰 이미지를 지정 폭으로 축소(확대는 안 함)</p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button className="w-full" onClick={handleConvert} disabled={converting || files.length === 0}>
                {converting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> 변환 중...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" /> {files.length > 0 ? `${files.length}장 변환` : "변환"}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
