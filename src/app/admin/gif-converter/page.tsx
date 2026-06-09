"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Film,
  Upload,
  Download,
  Loader2,
  X,
  AlertCircle,
  ArrowRight,
  FileVideo,
} from "lucide-react"
import { formatFileSize } from "@/lib/helpers"

type Mode = "to-gif" | "to-mp4"

interface ConvertResult {
  originalName: string
  url: string
  mode: Mode
  outputType: string
  originalSize: number
  convertedSize: number
  savedPercent: number
}

export default function GifConverterPage() {
  const [mode, setMode] = useState<Mode>("to-gif")
  const [file, setFile] = useState<File | null>(null)
  const [fps, setFps] = useState(12)
  const [width, setWidth] = useState("480")
  const [startTime, setStartTime] = useState("")
  const [duration, setDuration] = useState("")
  const [converting, setConverting] = useState(false)
  const [result, setResult] = useState<ConvertResult | null>(null)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const accept = mode === "to-gif" ? "video/*,image/gif" : "image/gif"

  const pick = (files: FileList | null) => {
    if (!files || files.length === 0) return
    setFile(files[0])
    setResult(null)
    setError("")
  }

  const handleConvert = async () => {
    if (!file) {
      setError("변환할 파일을 선택해주세요.")
      return
    }
    setConverting(true)
    setError("")
    setResult(null)
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("mode", mode)
      if (mode === "to-gif") {
        fd.append("fps", String(fps))
        fd.append("width", width)
        if (startTime) fd.append("startTime", startTime)
        if (duration) fd.append("duration", duration)
      }
      const res = await fetch("/api/admin/gif-converter", { method: "POST", body: fd })
      const data = await res.json()
      if (res.ok) setResult(data)
      else setError(data.error || "변환에 실패했습니다.")
    } catch (e) {
      console.error("gif convert error:", e)
      setError("변환 중 오류가 발생했습니다.")
    } finally {
      setConverting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Film className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">GIF 변환</h1>
          <p className="text-muted-foreground">
            동영상을 GIF로 만들거나, 용량이 큰 GIF를 MP4로 변환합니다. (최대 50MB)
          </p>
        </div>
      </div>

      {/* 모드 토글 */}
      <div className="flex gap-2">
        <Button
          variant={mode === "to-gif" ? "default" : "outline"}
          onClick={() => {
            setMode("to-gif")
            setFile(null)
            setResult(null)
            setError("")
          }}
        >
          <Film className="h-4 w-4 mr-1" /> 동영상 → GIF
        </Button>
        <Button
          variant={mode === "to-mp4" ? "default" : "outline"}
          onClick={() => {
            setMode("to-mp4")
            setFile(null)
            setResult(null)
            setError("")
          }}
        >
          <FileVideo className="h-4 w-4 mr-1" /> GIF → MP4 (용량↓)
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 입력 + 결과 */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{mode === "to-gif" ? "동영상 선택" : "GIF 선택"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/40 transition-colors"
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  pick(e.dataTransfer.files)
                }}
              >
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  {mode === "to-gif"
                    ? "동영상(mp4/webm/mov) 또는 GIF를 올리세요"
                    : "GIF 파일을 올리세요"}
                </p>
                <input
                  ref={inputRef}
                  type="file"
                  accept={accept}
                  className="hidden"
                  onChange={(e) => pick(e.target.files)}
                />
              </div>

              {file && (
                <div className="flex items-center justify-between text-sm border rounded-md px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileVideo className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="truncate">{file.name}</span>
                    <span className="text-muted-foreground shrink-0">({formatFileSize(file.size)})</span>
                  </div>
                  <button onClick={() => setFile(null)} className="text-muted-foreground hover:text-destructive">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>변환 결과</span>
                  <Badge className={result.savedPercent >= 0 ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}>
                    {formatFileSize(result.originalSize)} → {formatFileSize(result.convertedSize)} (
                    {result.savedPercent >= 0 ? `${result.savedPercent}% 절감` : `${-result.savedPercent}% 증가`})
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md border overflow-hidden bg-muted/30 flex justify-center p-3">
                  {result.outputType === "image/gif" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={result.url} alt={result.originalName} className="max-h-72 object-contain" />
                  ) : (
                    <video src={result.url} controls loop className="max-h-72" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="truncate">{result.originalName}</span>
                  <ArrowRight className="h-3 w-3" />
                  <Badge variant="outline" className="uppercase">{result.outputType.split("/")[1]}</Badge>
                  <Button variant="outline" size="sm" asChild className="ml-auto">
                    <a href={result.url} download>
                      <Download className="h-4 w-4 mr-1" /> 저장
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 옵션 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>변환 옵션</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mode === "to-gif" ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fps">
                      프레임레이트(FPS): <span className="font-semibold">{fps}</span>
                    </Label>
                    <input
                      id="fps"
                      type="range"
                      min={5}
                      max={30}
                      value={fps}
                      onChange={(e) => setFps(parseInt(e.target.value, 10))}
                      className="w-full accent-primary"
                    />
                    <p className="text-xs text-muted-foreground">높을수록 부드럽지만 용량↑ (권장 10~15)</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="width">가로폭 (px)</Label>
                    <Input id="width" type="number" min={80} max={1280} value={width} onChange={(e) => setWidth(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startTime">시작 지점 (선택)</Label>
                    <Input id="startTime" placeholder="예: 3 또는 00:00:03" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">길이(초, 선택)</Label>
                    <Input id="duration" type="number" min={1} placeholder="예: 5 (비우면 전체)" value={duration} onChange={(e) => setDuration(e.target.value)} />
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  GIF를 웹 스트리밍에 적합한 MP4(H.264)로 변환합니다. 보통 용량이 크게 줄어듭니다.
                </p>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button className="w-full" onClick={handleConvert} disabled={converting || !file}>
                {converting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> 변환 중...
                  </>
                ) : (
                  <>
                    <Film className="h-4 w-4 mr-2" /> 변환
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">동영상 길이에 따라 수십 초 걸릴 수 있습니다.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
