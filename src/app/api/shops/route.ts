import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/auth"
import type { Prisma } from "@/generated/prisma/client"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category")
  const city = searchParams.get("city")
  const search = searchParams.get("search")
  const mapOnly = searchParams.get("map") === "1"

  const where: Prisma.ShopWhereInput = { isPaid: true }
  if (category && category !== "all") where.category = category
  if (city) where.city = { contains: city }
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { city: { contains: search } },
      { description: { contains: search } },
    ]
  }

  if (mapOnly) {
    const shops = await prisma.shop.findMany({
      where,
      select: { id: true, name: true, lat: true, lng: true, category: true, city: true, avgRating: true, reviewCount: true },
    })
    return NextResponse.json(shops)
  }

  const page = parseInt(searchParams.get("page") ?? "1")
  const limit = 12
  const skip = (page - 1) * limit

  const [rows, total] = await Promise.all([
    prisma.shop.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        city: true,
        country: true,
        images: true,
        avgRating: true,
        reviewCount: true,
      },
    }),
    prisma.shop.count({ where }),
  ])

  const shops = rows.map((s) => ({
    ...s,
    images: JSON.parse(s.images) as string[],
  }))

  return NextResponse.json({ shops, total, page, totalPages: Math.ceil(total / limit) })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const { name, description, category, address, city, country, lat, lng, phone, website, instagram } = body

  if (!name || !description || !category || !address || !city || !country || lat == null || lng == null) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
  }

  const shop = await prisma.shop.create({
    data: {
      name,
      description,
      category,
      address,
      city,
      country,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      phone: phone || null,
      website: website || null,
      instagram: instagram || null,
      images: "[]",
      ownerId: session.user.id,
      isPaid: false,
    },
  })

  return NextResponse.json(shop, { status: 201 })
}
