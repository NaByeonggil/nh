import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

const REALTIME_WINDOW_MS = 5 * 60 * 1000

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function ymd(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()
    const realtimeSince = new Date(now.getTime() - REALTIME_WINDOW_MS)
    const todayStart = startOfDay(now)
    const weekStart = new Date(todayStart)
    weekStart.setDate(weekStart.getDate() - 6)
    const monthStart = new Date(todayStart)
    monthStart.setDate(monthStart.getDate() - 29)

    const [
      realtimeRows,
      todayPageviews,
      todayVisitorRows,
      weekPageviews,
      weekVisitorRows,
      monthPageviews,
      monthVisitorRows,
      weekRows,
      popularRaw,
    ] = await Promise.all([
      db.pageView.findMany({
        where: { createdAt: { gte: realtimeSince } },
        select: { sessionId: true },
      }),
      db.pageView.count({ where: { createdAt: { gte: todayStart } } }),
      db.pageView.findMany({
        where: { createdAt: { gte: todayStart } },
        select: { sessionId: true },
      }),
      db.pageView.count({ where: { createdAt: { gte: weekStart } } }),
      db.pageView.findMany({
        where: { createdAt: { gte: weekStart } },
        select: { sessionId: true },
      }),
      db.pageView.count({ where: { createdAt: { gte: monthStart } } }),
      db.pageView.findMany({
        where: { createdAt: { gte: monthStart } },
        select: { sessionId: true },
      }),
      db.pageView.findMany({
        where: { createdAt: { gte: weekStart } },
        select: { createdAt: true, sessionId: true },
      }),
      db.pageView.groupBy({
        by: ["path"],
        where: { createdAt: { gte: todayStart } },
        _count: { path: true },
        orderBy: { _count: { path: "desc" } },
        take: 10,
      }),
    ])

    const uniqueCount = (rows: { sessionId: string | null }[]) => {
      const set = new Set<string>()
      for (const r of rows) {
        if (r.sessionId) set.add(r.sessionId)
      }
      return set.size
    }

    const dayBuckets = new Map<string, { visitors: Set<string>; pageviews: number }>()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayStart)
      d.setDate(d.getDate() - i)
      dayBuckets.set(ymd(d), { visitors: new Set(), pageviews: 0 })
    }
    for (const row of weekRows) {
      const key = ymd(startOfDay(row.createdAt))
      const bucket = dayBuckets.get(key)
      if (!bucket) continue
      bucket.pageviews += 1
      if (row.sessionId) bucket.visitors.add(row.sessionId)
    }

    const dailyStats = Array.from(dayBuckets.entries()).map(([date, b]) => ({
      date,
      visitors: b.visitors.size,
      pageviews: b.pageviews,
    }))

    const popularPages = popularRaw.map((p) => ({
      path: p.path,
      count: p._count.path,
    }))

    return NextResponse.json({
      realtime: { visitors: uniqueCount(realtimeRows) },
      today: { visitors: uniqueCount(todayVisitorRows), pageviews: todayPageviews },
      week: { visitors: uniqueCount(weekVisitorRows), pageviews: weekPageviews },
      month: { visitors: uniqueCount(monthVisitorRows), pageviews: monthPageviews },
      dailyStats,
      popularPages,
    })
  } catch (error) {
    console.error("Failed to fetch analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
