import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const heroImages = await db.heroImage.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        order: "asc"
      }
    })

    return NextResponse.json(heroImages)
  } catch (error) {
    console.error("Failed to fetch hero images:", error)
    return NextResponse.json(
      { error: "Failed to fetch hero images" },
      { status: 500 }
    )
  }
}