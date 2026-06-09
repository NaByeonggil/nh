import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { lectureRevisionSchema } from "@/lib/validations"
import { z } from "zod"

// POST /api/lectures/[id]/revisions - 추가본(addendum) 등록 (관리자)
// 추가본은 별도 URL이 아니라 강의 노트의 버전으로 관리한다.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 })
    }

    const lecture = await db.lecture.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    })
    if (!lecture) {
      return NextResponse.json({ error: "강의 노트를 찾을 수 없습니다." }, { status: 404 })
    }

    const body = await request.json()
    const data = lectureRevisionSchema.parse(body)

    const revision = await db.lectureRevision.create({
      data: { lectureId: lecture.id, note: data.note },
    })

    return NextResponse.json(revision, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error("Revision creation error:", error)
    return NextResponse.json(
      { error: "추가본 등록 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
