"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HardDrive, AlertTriangle } from "lucide-react"

type Level = "ok" | "warn" | "critical"

interface DiskHealth {
  available: boolean
  stale: boolean
  level: Level
  issues: { level: Level; message: string }[]
  collectedAt: string
  device: string
  model: string | null
  capacityBytes: number | null
  wear: {
    percentageUsed: number
    availableSpare: number
    availableSpareThreshold: number
    writtenBytes: number
    mediaErrors: number
    temperature: number
    powerOnHours: number
    unsafeShutdowns: number
    estimatedRemainingDays: number | null
  }
  usage: {
    mount: string
    totalBytes: number
    usedBytes: number
    availBytes: number
    usedPercent: number
  }
  trend: {
    days: number
    dailyWrittenBytes: number | null
    daysUntilFull: number | null
  }
}

const formatBytes = (bytes: number) => {
  if (bytes >= 1e12) return `${(bytes / 1e12).toFixed(2)} TB`
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`
  return `${(bytes / 1e6).toFixed(0)} MB`
}

const formatDays = (days: number) => {
  if (days >= 365) return `약 ${(days / 365).toFixed(1)}년`
  return `약 ${days}일`
}

const barColor = (percent: number, warnAt: number, criticalAt: number) => {
  if (percent >= criticalAt) return "bg-red-500"
  if (percent >= warnAt) return "bg-amber-500"
  return "bg-green-500"
}

const levelBadge = (level: Level) => {
  switch (level) {
    case "critical":
      return <Badge variant="destructive">경고</Badge>
    case "warn":
      return <Badge variant="secondary" className="bg-amber-50 text-amber-700">주의</Badge>
    default:
      return <Badge variant="secondary" className="bg-green-50 text-green-700">정상</Badge>
  }
}

export function DiskHealthCard() {
  const [disk, setDisk] = useState<DiskHealth | null>(null)

  useEffect(() => {
    const fetchDisk = async () => {
      try {
        const response = await fetch("/api/admin/system/disk")
        if (response.ok) {
          setDisk(await response.json())
        }
      } catch (error) {
        console.error("Failed to fetch disk health:", error)
      }
    }
    fetchDisk()
  }, [])

  // 권한이 없거나 조회에 실패하면 카드를 표시하지 않는다
  if (!disk) return null

  if (!disk.available) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            디스크 상태
          </CardTitle>
          <CardDescription>
            아직 수집된 데이터가 없습니다. 서버에 scripts/disk-health.sh cron 이 등록되어 있는지 확인하세요.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const { wear, usage, trend } = disk

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            디스크 상태
          </CardTitle>
          {levelBadge(disk.level)}
        </div>
        <CardDescription>
          {disk.model ?? disk.device}
          {disk.capacityBytes ? ` · ${formatBytes(disk.capacityBytes)}` : ""}
          {" · "}
          {new Date(disk.collectedAt).toLocaleString("ko-KR", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}{" "}
          기준
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {disk.issues.length > 0 && (
          <div className="space-y-2">
            {disk.issues.map((issue) => (
              <div
                key={issue.message}
                className={`flex items-start gap-2 rounded-md px-3 py-2 text-sm ${
                  issue.level === "critical"
                    ? "bg-red-50 text-red-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{issue.message}</span>
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">용량 사용률</span>
              <span className="text-muted-foreground">
                {formatBytes(usage.usedBytes)} / {formatBytes(usage.totalBytes)}
              </span>
            </div>
            <div
              className="h-2 bg-muted rounded-full overflow-hidden"
              role="progressbar"
              aria-label="용량 사용률"
              aria-valuenow={Math.round(usage.usedPercent)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className={`h-full rounded-full transition-all ${barColor(usage.usedPercent, 85, 95)}`}
                style={{ width: `${Math.min(usage.usedPercent, 100)}%` }}
              />
            </div>
            <div className="text-2xl font-bold">{usage.usedPercent.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">
              남은 공간 {formatBytes(usage.availBytes)}
              {trend.daysUntilFull !== null &&
                ` · 현재 추세로 ${formatDays(trend.daysUntilFull)} 후 가득 참`}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">수명 소모율 (wear)</span>
              <span className="text-muted-foreground">
                총 기록량 {formatBytes(wear.writtenBytes)}
              </span>
            </div>
            <div
              className="h-2 bg-muted rounded-full overflow-hidden"
              role="progressbar"
              aria-label="수명 소모율"
              aria-valuenow={Math.min(wear.percentageUsed, 100)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className={`h-full rounded-full transition-all ${barColor(wear.percentageUsed, 80, 90)}`}
                style={{ width: `${Math.min(wear.percentageUsed, 100)}%` }}
              />
            </div>
            <div className="text-2xl font-bold">{wear.percentageUsed}%</div>
            <p className="text-xs text-muted-foreground">
              {wear.estimatedRemainingDays !== null
                ? `예상 잔여 수명 ${formatDays(wear.estimatedRemainingDays)} (추정)`
                : "잔여 수명을 추정하기에는 소모량이 아직 너무 적습니다"}
              {trend.dailyWrittenBytes !== null &&
                ` · 일평균 기록 ${formatBytes(trend.dailyWrittenBytes)}`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 text-sm">
          <div>
            <p className="text-muted-foreground">예비 블록</p>
            <p className="font-medium">
              {wear.availableSpare}% <span className="text-xs text-muted-foreground">(임계 {wear.availableSpareThreshold}%)</span>
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">온도</p>
            <p className="font-medium">{wear.temperature}℃</p>
          </div>
          <div>
            <p className="text-muted-foreground">미디어 오류</p>
            <p className="font-medium">{wear.mediaErrors}건</p>
          </div>
          <div>
            <p className="text-muted-foreground">사용 시간</p>
            <p className="font-medium">{wear.powerOnHours.toLocaleString("ko-KR")}시간</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
