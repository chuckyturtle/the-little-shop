import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/auth"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const shop = await prisma.shop.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, image: true } },
      reviews: {
        include: { user: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!shop) return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 })

  return NextResponse.json({
    ...shop,
    images: JSON.parse(shop.images) as string[],
    photoAlbums: JSON.parse(shop.photoAlbums),
  })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const shop = await prisma.shop.findUnique({ where: { id } })
  if (!shop) return NextResponse.json({ error: "No encontrada" }, { status: 404 })
  if (shop.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Prohibido" }, { status: 403 })
  }

  const body = await req.json()
  const { images, photoAlbums, ...rest } = body

  const updated = await prisma.shop.update({
    where: { id },
    data: {
      ...rest,
      ...(images !== undefined && { images: JSON.stringify(images) }),
      ...(photoAlbums !== undefined && { photoAlbums: JSON.stringify(photoAlbums) }),
    },
  })
  return NextResponse.json(updated)
}
