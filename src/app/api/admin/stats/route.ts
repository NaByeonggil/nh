import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    const [
      totalUsers,
      todayUsersCount,
      totalInquiries,
      pendingInquiries,
      totalContent,
      totalProducts,
      inStockProducts,
      recentInquiries,
      recentUsers,
      recentContents,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { createdAt: { gte: startOfToday } } }),
      db.inquiry.count(),
      db.inquiry.count({ where: { comments: { none: {} } } }),
      db.content.count({ where: { published: true } }),
      db.product.count(),
      db.product.count({ where: { inStock: true } }),
      db.inquiry.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          createdAt: true,
          author: { select: { name: true, email: true } },
          authorName: true,
        },
      }),
      db.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, email: true, createdAt: true },
      }),
      db.content.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, title: true, createdAt: true },
      }),
    ])

    const recentActivity = [
      ...recentInquiries.map((i) => ({
        id: `inquiry-${i.id}`,
        type: "inquiry" as const,
        title: i.title,
        timestamp: i.createdAt.toISOString(),
        user: i.author?.name ?? i.author?.email ?? i.authorName ?? undefined,
      })),
      ...recentUsers.map((u) => ({
        id: `user-${u.id}`,
        type: "user" as const,
        title: `${u.name ?? u.email} 가입`,
        timestamp: u.createdAt.toISOString(),
        user: u.name ?? u.email,
      })),
      ...recentContents.map((c) => ({
        id: `content-${c.id}`,
        type: "content" as const,
        title: c.title,
        timestamp: c.createdAt.toISOString(),
      })),
    ]
      .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
      .slice(0, 10)

    return NextResponse.json({
      totalUsers,
      totalInquiries,
      pendingInquiries,
      totalContent,
      totalProducts,
      inStockProducts,
      todayUsersCount,
      recentActivity,
    })
  } catch (error) {
    console.error("Failed to fetch admin stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
