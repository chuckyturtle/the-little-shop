import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import crypto from "crypto"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get("x-signature")
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET

  if (!signature || !secret) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  const digest = crypto.createHmac("sha256", secret).update(body).digest("hex")
  if (digest !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const payload = JSON.parse(body)
  const eventName: string = payload.meta?.event_name

  if (eventName === "order_created") {
    const status: string = payload.data?.attributes?.status
    const shopId: string | undefined = payload.meta?.custom_data?.shopId

    if (status === "paid" && shopId) {
      await prisma.shop.update({
        where: { id: shopId },
        data: { isPaid: true },
      })
    }
  }

  return NextResponse.json({ received: true })
}
