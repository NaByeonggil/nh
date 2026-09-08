import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { recommendedProductSchema } from "@/lib/validations"
import { serializeRecommendedProduct } from "@/lib/recommended-products"
import { revalidateTag } from "next/cache"
import { Prisma } from "@prisma/client"
import { z } from "zod"

interface RouteParams {
  params: Promise<{ id: string }>
}

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 })
  }
  return null
}

function notFound(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025"
  )
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const denied = await requireAdmin()
  if (denied) return denied

  const { id } = await params

  try {
    const data = recommendedProductSchema.parse(await request.json())

    const product = await db.recommendedProduct.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description || null,
        imageUrl: data.imageUrl || null,
        price: data.price,
        originalPrice: data.originalPrice ?? null,
        rating: data.rating,
        reviewCount: data.reviewCount,
        purchaseUrl: data.purchaseUrl || null,
        isActive: data.isActive,
        ...(data.order !== undefined && { order: data.order }),
      },
    })

    revalidateTag("recommended-products")
    return NextResponse.json(serializeRecommendedProduct(product))
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "입력값을 확인해주세요.", details: error.errors },
        { status: 400 }
      )
    }
    if (notFound(error)) {
      return NextResponse.json({ error: "추천 제품을 찾을 수 없습니다." }, { status: 404 })
    }

    console.error("추천 제품 수정 오류:", error)
    return NextResponse.json(
      { error: "추천 제품 수정 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

// 활성화 토글 / 순서 변경처럼 일부 필드만 바꾸는 경우
const patchSchema = z
  .object({
    isActive: z.boolean().optional(),
    order: z.number().int().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "변경할 값이 없습니다",
  })

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const denied = await requireAdmin()
  if (denied) return denied

  const { id } = await params

  try {
    const data = patchSchema.parse(await request.json())

    const product = await db.recommendedProduct.update({ where: { id }, data })

    revalidateTag("recommended-products")
    return NextResponse.json(serializeRecommendedProduct(product))
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "입력값을 확인해주세요.", details: error.errors },
        { status: 400 }
      )
    }
    if (notFound(error)) {
      return NextResponse.json({ error: "추천 제품을 찾을 수 없습니다." }, { status: 404 })
    }

    console.error("추천 제품 변경 오류:", error)
    return NextResponse.json(
      { error: "추천 제품 변경 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const denied = await requireAdmin()
  if (denied) return denied

  const { id } = await params

  try {
    await db.recommendedProduct.delete({ where: { id } })

    revalidateTag("recommended-products")
    return NextResponse.json({ success: true })
  } catch (error) {
    if (notFound(error)) {
      return NextResponse.json({ error: "추천 제품을 찾을 수 없습니다." }, { status: 404 })
    }

    console.error("추천 제품 삭제 오류:", error)
    return NextResponse.json(
      { error: "추천 제품 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
