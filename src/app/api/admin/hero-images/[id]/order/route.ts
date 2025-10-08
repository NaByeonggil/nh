import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

interface RouteParams {
  params: Promise<{ id: string }>
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
    const { order } = body

    if (order === undefined || order === null) {
      return NextResponse.json(
        { error: "Order is required" },
        { status: 400 }
      )
    }

    const heroImage = await db.heroImage.update({
      where: { id: id },
      data: { order }
    })

    return NextResponse.json(heroImage)
  } catch (error) {
    console.error("Failed to update hero image order:", error)
    return NextResponse.json(
      { error: "Failed to update hero image order" },
      { status: 500 }
    )
  }
}