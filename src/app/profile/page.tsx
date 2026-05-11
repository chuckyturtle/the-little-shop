import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { ShopCard } from "@/components/ShopCard"
import { StarRating } from "@/components/StarRating"
import { User, Store, MessageSquare, Pencil } from "lucide-react"
import Link from "next/link"
import { DeleteShopButton } from "@/components/DeleteShopButton"

export const metadata = { title: "Mi perfil — The Little Shop" }

export default async function ProfilePage() {
  const session = await auth()
  if (!session) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      shops: {
        orderBy: { createdAt: "desc" },
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
          isPaid: true,
        },
      },
      reviews: {
        include: { shop: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!user) redirect("/login")

  const paidShops = user.shops.filter((s) => s.isPaid)
  const draftShops = user.shops.filter((s) => !s.isPaid)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-cream-dark p-6 mb-8 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-forest-100 flex items-center justify-center">
          <User className="w-7 h-7 text-forest-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-forest-900">{user.name}</h1>
          <p className="text-gray-500 text-sm">{user.email}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Miembro desde{" "}
            {new Date(user.createdAt).toLocaleDateString("es-MX", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-cream-dark p-4 text-center">
          <Store className="w-5 h-5 text-forest-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-forest-700">{paidShops.length}</p>
          <p className="text-xs text-gray-500">Tiendas publicadas</p>
        </div>
        <div className="bg-white rounded-2xl border border-cream-dark p-4 text-center">
          <MessageSquare className="w-5 h-5 text-terra-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-terra-500">{user.reviews.length}</p>
          <p className="text-xs text-gray-500">Reseñas escritas</p>
        </div>
        <div className="bg-white rounded-2xl border border-cream-dark p-4 text-center">
          <span className="text-xl">⭐</span>
          <p className="text-2xl font-bold text-forest-700">
            {user.reviews.length > 0
              ? (user.reviews.reduce((s, r) => s + r.rating, 0) / user.reviews.length).toFixed(1)
              : "—"}
          </p>
          <p className="text-xs text-gray-500">Rating promedio dado</p>
        </div>
      </div>

      {/* My shops */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-forest-800">Mis tiendas</h2>
          <Link
            href="/shops/new"
            className="text-sm text-terra-500 hover:text-terra-600 font-medium"
          >
            + Agregar tienda
          </Link>
        </div>

        {paidShops.length === 0 && draftShops.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-cream-dark">
            <Store className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-3">Aún no tienes tiendas publicadas</p>
            <Link
              href="/shops/new"
              className="bg-forest-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-forest-700 transition-colors"
            >
              Registrar mi tienda
            </Link>
          </div>
        ) : (
          <>
            {paidShops.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {paidShops.map((s) => (
                  <div key={s.id} className="relative group">
                    <ShopCard {...s} images={JSON.parse(s.images) as string[]} />
                    <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/shops/${s.id}/edit`}
                        className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-gray-700 hover:text-forest-700 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-medium shadow-sm"
                      >
                        <Pencil className="w-3 h-3" />
                        Editar
                      </Link>
                      <DeleteShopButton shopId={s.id} shopName={s.name} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {draftShops.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-500 mb-3">Borradores (pago pendiente)</p>
                <div className="space-y-2">
                  {draftShops.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between bg-white rounded-xl border border-dashed border-gray-300 px-4 py-3"
                    >
                      <span className="text-sm text-gray-600">{s.name}</span>
                      <Link
                        href={`/shops/new?shop_id=${s.id}&step=4`}
                        className="text-xs bg-terra-500 text-white px-3 py-1.5 rounded-lg hover:bg-terra-600 transition-colors"
                      >
                        Completar pago
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* My reviews */}
      <section>
        <h2 className="text-lg font-semibold text-forest-800 mb-4">Mis reseñas</h2>
        {user.reviews.length === 0 ? (
          <p className="text-gray-400 text-sm">Aún no has escrito reseñas.</p>
        ) : (
          <div className="space-y-3">
            {user.reviews.map((r) => (
              <div key={r.id} className="bg-white rounded-xl border border-cream-dark p-4">
                <div className="flex items-center justify-between mb-2">
                  <Link
                    href={`/shops/${r.shopId}`}
                    className="font-medium text-forest-700 hover:text-forest-900 text-sm"
                  >
                    {r.shop.name}
                  </Link>
                  <StarRating rating={r.rating} />
                </div>
                <p className="text-gray-500 text-sm">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
