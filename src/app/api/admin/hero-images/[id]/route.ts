import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { imageUrl, title, subtitle, linkUrl, linkText, isActive } = body

    const heroImage = await db.heroImage.update({
      where: { id: id },
      data: {
        imageUrl,
        title,
        subtitle,
        linkUrl,
        linkText,
        isActive
      }
    })

    return NextResponse.json(heroImage)
  } catch (error) {
    console.error("Failed to update hero image:", error)
    return NextResponse.json(
      { error: "Failed to update hero image" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()

    const heroImage = await db.heroImage.update({
      where: { id: id },
      data: body
    })

    return NextResponse.json(heroImage)
  } catch (error) {
    console.error("Failed to patch hero image:", error)
    return NextResponse.json(
      { error: "Failed to patch hero image" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    await db.heroImage.delete({
      where: { id: id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete hero image:", error)
    return NextResponse.json(
      { error: "Failed to delete hero image" },
      { status: 500 }
    )
  }
}