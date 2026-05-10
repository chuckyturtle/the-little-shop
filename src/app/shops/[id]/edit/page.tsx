import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import { ShopEditClient } from "./ShopEditClient"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const shop = await prisma.shop.findUnique({ where: { id }, select: { name: true } })
  return { title: shop ? `Editar ${shop.name} — The Little Shop` : "Editar tienda" }
}

export default async function EditShopPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) redirect("/login")

  const shop = await prisma.shop.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      address: true,
      city: true,
      country: true,
      lat: true,
      lng: true,
      phone: true,
      website: true,
      instagram: true,
      images: true,
      photoAlbums: true,
      ownerId: true,
      isPaid: true,
    },
  })

  if (!shop || !shop.isPaid) notFound()
  if (shop.ownerId !== session.user.id) redirect(`/shops/${id}`)

  return (
    <ShopEditClient
      shop={{
        ...shop,
        images: JSON.parse(shop.images) as string[],
        photoAlbums: JSON.parse(shop.photoAlbums),
      }}
    />
  )
}
