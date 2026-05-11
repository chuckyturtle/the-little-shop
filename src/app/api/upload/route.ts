import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { put } from "@vercel/blob"
import { prisma } from "@/lib/db"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_SIZE = 5 * 1024 * 1024

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const formData = await req.formData()
  const shopId = formData.get("shopId") as string
  const files = formData.getAll("images") as File[]

  if (!shopId || files.length === 0) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 })
  }

  const shop = await prisma.shop.findUnique({ where: { id: shopId } })
  if (!shop || shop.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Prohibido" }, { status: 403 })
  }

  const newUrls: string[] = []
  try {
    for (const file of files.slice(0, 10)) {
      if (!ALLOWED_TYPES.includes(file.type)) continue
      const buffer = Buffer.from(await file.arrayBuffer())
      if (buffer.length > MAX_SIZE) continue
      const ext = file.type.split("/")[1]
      const filename = `shops/${shopId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const blob = await put(filename, buffer, { access: "public" })
      newUrls.push(blob.url)
    }
  } catch (err) {
    console.error("Blob upload error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al subir" },
      { status: 500 }
    )
  }

  return NextResponse.json({ urls: newUrls })
}
