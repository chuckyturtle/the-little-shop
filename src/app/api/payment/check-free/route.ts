import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ eligible: false })

  const count = await prisma.shop.count({
    where: { ownerId: session.user.id, isPaid: true },
  })

  return NextResponse.json({ eligible: count === 0 })
}
