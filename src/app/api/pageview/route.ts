import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { path, sessionId } = body ?? {}

    if (!path || typeof path !== "string") {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 })
    }

    const forwarded = request.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0].trim() : request.headers.get("x-real-ip") ?? null
    const userAgent = request.headers.get("user-agent")
    const referer = request.headers.get("referer")

    await db.pageView.create({
      data: {
        path,
        sessionId: typeof sessionId === "string" ? sessionId : null,
        ip,
        userAgent,
        referer,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Failed to record page view:", error)
    return NextResponse.json({ error: "Failed to record page view" }, { status: 500 })
  }
}
