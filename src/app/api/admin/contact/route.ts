import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

const DEFAULT_CONTACT = {
  email: "contact@neighbor-pharmacist.com",
  phone: "02-1234-5678",
  consultingHours: "평일 09:00 - 18:00",
}

export async function GET() {
  try {
    const contact = await db.contactInfo.findFirst({
      orderBy: { updatedAt: "desc" },
    })
    return NextResponse.json(contact ?? DEFAULT_CONTACT)
  } catch (error) {
    console.error("Failed to fetch contact info:", error)
    return NextResponse.json(DEFAULT_CONTACT)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const email = typeof body?.email === "string" ? body.email : ""
    const phone = typeof body?.phone === "string" ? body.phone : ""
    const consultingHours = typeof body?.consultingHours === "string" ? body.consultingHours : ""

    if (!email || !phone || !consultingHours) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const existing = await db.contactInfo.findFirst({ orderBy: { updatedAt: "desc" } })
    const saved = existing
      ? await db.contactInfo.update({
          where: { id: existing.id },
          data: { email, phone, consultingHours },
        })
      : await db.contactInfo.create({
          data: { email, phone, consultingHours },
        })

    return NextResponse.json(saved)
  } catch (error) {
    console.error("Failed to update contact info:", error)
    return NextResponse.json({ error: "Failed to update contact info" }, { status: 500 })
  }
}
