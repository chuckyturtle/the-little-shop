import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/db"
import Link from "next/link"
import { CheckCircle, ArrowRight, Map } from "lucide-react"

export const metadata = { title: "¡Tienda publicada! — The Little Shop" }

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ shop_id?: string; session_id?: string }>
}) {
  const { shop_id, session_id } = await searchParams

  let shopName = "tu tienda"
  let verified = false

  if (shop_id && session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id)
      if (session.payment_status === "paid" && session.metadata?.shopId === shop_id) {
        await prisma.shop.update({
          where: { id: shop_id },
          data: { isPaid: true },
        })
        const shop = await prisma.shop.findUnique({
          where: { id: shop_id },
          select: { name: true },
        })
        if (shop) shopName = shop.name
        verified = true
      }
    } catch {
      // Webhook already handled it
      const shop = await prisma.shop.findUnique({
        where: { id: shop_id },
        select: { name: true, isPaid: true },
      })
      if (shop?.isPaid) {
        shopName = shop.name
        verified = true
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-white rounded-3xl shadow-sm border border-cream-dark p-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-forest-50 mb-6">
            <CheckCircle className="w-10 h-10 text-forest-600" />
          </div>

          <h1 className="text-2xl font-bold text-forest-900 mb-2">
            {verified ? "¡Tienda publicada!" : "¡Pago recibido!"}
          </h1>
          <p className="text-gray-500 mb-8">
            {verified
              ? `"${shopName}" ya está visible en el mapa global para todo el mundo.`
              : "Tu pago fue procesado. Tu tienda estará visible en el mapa en unos instantes."}
          </p>

          <div className="space-y-3">
            {shop_id && verified && (
              <Link
                href={`/shops/${shop_id}`}
                className="flex items-center justify-center gap-2 w-full bg-forest-600 hover:bg-forest-700 text-white font-medium py-3 rounded-xl transition-colors"
              >
                Ver mi tienda
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full border border-forest-200 text-forest-600 hover:bg-forest-50 font-medium py-3 rounded-xl transition-colors"
            >
              <Map className="w-4 h-4" />
              Ver en el mapa
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
