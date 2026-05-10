import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/auth"

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 })

  const { shopId, rating, comment } = await req.json()

  if (!shopId || !rating || !comment) {
    return NextResponse.json({ error: "Faltan campos" }, { status: 400 })
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating inválido" }, { status: 400 })
  }

  const shop = await prisma.shop.findUnique({ where: { id: shopId } })
  if (!shop || !shop.isPaid) {
    return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 })
  }

  const existing = await prisma.review.findUnique({
    where: { userId_shopId: { userId: session.user.id, shopId } },
  })
  if (existing) {
    return NextResponse.json({ error: "Ya dejaste una reseña para esta tienda" }, { status: 409 })
  }

  const review = await prisma.review.create({
    data: {
      shopId,
      userId: session.user.id,
      rating,
      comment,
    },
    include: { user: { select: { id: true, name: true, image: true } } },
  })

  // Recalculate average
  const agg = await prisma.review.aggregate({
    where: { shopId },
    _avg: { rating: true },
    _count: true,
  })

  await prisma.shop.update({
    where: { id: shopId },
    data: {
      avgRating: agg._avg.rating ?? 0,
      reviewCount: agg._count,
    },
  })

  return NextResponse.json(review, { status: 201 })
}
