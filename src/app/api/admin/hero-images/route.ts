import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const heroImages = await db.heroImage.findMany({
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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { imageUrl, title, subtitle, linkUrl, linkText, isActive, order } = body

    if (!imageUrl || !title) {
      return NextResponse.json(
        { error: "Image URL and title are required" },
        { status: 400 }
      )
    }

    // Get the max order if not provided
    let finalOrder = order
    if (finalOrder === undefined || finalOrder === null) {
      const maxOrder = await db.heroImage.aggregate({
        _max: {
          order: true
        }
      })
      finalOrder = (maxOrder._max.order || 0) + 1
    }

    const heroImage = await db.heroImage.create({
      data: {
        imageUrl,
        title,
        subtitle,
        linkUrl,
        linkText,
        isActive: isActive ?? true,
        order: finalOrder
      }
    })

    return NextResponse.json(heroImage)
  } catch (error) {
    console.error("Failed to create hero image:", error)
    return NextResponse.json(
      { error: "Failed to create hero image" },
      { status: 500 }
    )
  }
}