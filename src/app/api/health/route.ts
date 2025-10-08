import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Basic health check
    return NextResponse.json(
      { 
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || "unknown"
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { 
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}