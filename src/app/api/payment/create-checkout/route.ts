import { NextResponse } from "next/server"
import { stripe, SHOP_PRICE_CENTS } from "@/lib/stripe"
import { prisma } from "@/lib/db"
import { auth } from "@/auth"

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { shopId } = await req.json()
  if (!shopId) return NextResponse.json({ error: "shopId requerido" }, { status: 400 })

  const shop = await prisma.shop.findUnique({ where: { id: shopId } })
  if (!shop) return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 })
  if (shop.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Prohibido" }, { status: 403 })
  }
  if (shop.isPaid) {
    return NextResponse.json({ error: "Ya pagado" }, { status: 400 })
  }

  const origin = process.env.NEXTAUTH_URL ?? "http://localhost:3000"

  // Check if this is the user's first shop (free)
  const paidShopsCount = await prisma.shop.count({
    where: { ownerId: session.user.id, isPaid: true },
  })

  if (paidShopsCount === 0) {
    await prisma.shop.update({
      where: { id: shopId },
      data: { isPaid: true },
    })
    return NextResponse.json({
      url: `${origin}/payment/success?shop_id=${shopId}&free=1`,
      free: true,
    })
  }

  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: SHOP_PRICE_CENTS,
          product_data: {
            name: `Publicación de tienda: ${shop.name}`,
            description: "Pago único para publicar tu tienda en The Little Shop",
          },
        },
        quantity: 1,
      },
    ],
    metadata: { shopId, userId: session.user.id },
    success_url: `${origin}/payment/success?shop_id=${shopId}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/shops/new?step=4&shop_id=${shopId}&cancelled=1`,
  })

  await prisma.shop.update({
    where: { id: shopId },
    data: { stripeSessionId: checkout.id },
  })

  return NextResponse.json({ url: checkout.url })
}
