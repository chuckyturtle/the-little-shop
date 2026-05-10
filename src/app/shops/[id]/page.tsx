import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import { auth } from "@/auth"
import Image from "next/image"
import Link from "next/link"
import { MapPin, Phone, Globe, ExternalLink, Star, Calendar, Pencil } from "lucide-react"
import { CategoryBadge } from "@/components/CategoryBadge"
import { StarRating } from "@/components/StarRating"
import { ReviewForm } from "@/components/ReviewForm"
import { MiniMapClient } from "@/components/MiniMapClient"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const shop = await prisma.shop.findUnique({ where: { id }, select: { name: true, description: true } })
  if (!shop) return {}
  return { title: `${shop.name} — The Little Shop`, description: shop.description }
}

export default async function ShopDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()

  const shop = await prisma.shop.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, image: true } },
      reviews: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!shop || !shop.isPaid) notFound()

  interface Album { id: string; label: string; images: string[] }
  const images: string[] = JSON.parse(shop.images)
  const photoAlbums: Album[] = JSON.parse(shop.photoAlbums)
  const isOwner = session?.user.id === shop.ownerId
  const userReview = session
    ? shop.reviews.find((r) => r.userId === session.user.id)
    : null

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Images gallery */}
      {images.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 rounded-2xl overflow-hidden mb-8 h-72">
          <div className="col-span-2 relative">
            <Image src={images[0]} alt={shop.name} fill className="object-cover" />
          </div>
          <div className="grid grid-rows-2 gap-2">
            {images.slice(1, 3).map((src, i) => (
              <div key={i} className="relative">
                <Image src={src} alt="" fill className="object-cover" />
              </div>
            ))}
            {images.length < 2 && (
              <div className="bg-forest-50 flex items-center justify-center text-3xl rounded-lg">
                🏪
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="h-52 bg-forest-50 rounded-2xl flex items-center justify-center text-6xl mb-8">
          🏪
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex flex-wrap items-start gap-3 mb-2">
              <h1 className="text-3xl font-bold text-forest-900">{shop.name}</h1>
              <CategoryBadge categoryId={shop.category} />
              {isOwner && (
                <Link
                  href={`/shops/${shop.id}/edit`}
                  className="ml-auto flex items-center gap-1.5 text-sm text-gray-500 hover:text-forest-700 border border-gray-200 hover:border-forest-400 rounded-xl px-3 py-1.5 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Editar tienda
                </Link>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {shop.city}, {shop.country}
              </span>
              {shop.reviewCount > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <strong className="text-gray-700">{shop.avgRating.toFixed(1)}</strong>
                  <span>({shop.reviewCount} reseñas)</span>
                </span>
              )}
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-forest-800 mb-2">Acerca de esta tienda</h2>
            <p className="text-gray-600 leading-relaxed">{shop.description}</p>
          </div>

          {/* Photo albums */}
          {photoAlbums.length > 0 && (
            <div className="space-y-5">
              <h2 className="font-semibold text-forest-800">Galería de fotos</h2>
              {photoAlbums.map((album) =>
                album.images.length === 0 ? null : (
                  <div key={album.id}>
                    <p className="text-sm font-medium text-gray-500 mb-2">{album.label}</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {album.images.map((src) => (
                        <div key={src} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                          <Image src={src} alt="" fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          <div>
            <h2 className="font-semibold text-forest-800 mb-2">Ubicación</h2>
            <p className="text-gray-500 text-sm mb-3">{shop.address}</p>
            <div className="h-48 rounded-xl overflow-hidden border border-gray-200">
              <MiniMapClient lat={shop.lat} lng={shop.lng} name={shop.name} />
            </div>
          </div>

          {/* Reviews */}
          <div>
            <h2 className="font-semibold text-forest-800 mb-4">
              Reseñas ({shop.reviewCount})
            </h2>

            {session && !userReview && (
              <ReviewForm shopId={shop.id} />
            )}

            {shop.reviews.length === 0 ? (
              <p className="text-gray-400 text-sm">Sé el primero en dejar una reseña.</p>
            ) : (
              <div className="space-y-4">
                {shop.reviews.map((r) => (
                  <div key={r.id} className="bg-white rounded-xl border border-cream-dark p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm text-forest-900">{r.user.name}</p>
                        <StarRating rating={r.rating} />
                      </div>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(r.createdAt).toLocaleDateString("es-MX", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}

            {!session && (
              <p className="text-sm text-gray-500 mt-4">
                <a href="/login" className="text-forest-600 underline">
                  Inicia sesión
                </a>{" "}
                para dejar una reseña.
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          {/* Contact card */}
          <div className="bg-white rounded-2xl border border-cream-dark p-5 space-y-3">
            <h3 className="font-semibold text-forest-800">Contacto</h3>
            {shop.phone && (
              <a
                href={`tel:${shop.phone}`}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-forest-700"
              >
                <Phone className="w-4 h-4 text-forest-500" />
                {shop.phone}
              </a>
            )}
            {shop.website && (
              <a
                href={shop.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-forest-700 break-all"
              >
                <Globe className="w-4 h-4 text-forest-500" />
                {shop.website.replace(/^https?:\/\//, "")}
              </a>
            )}
            {shop.instagram && (
              <a
                href={`https://instagram.com/${shop.instagram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-forest-700"
              >
                <ExternalLink className="w-4 h-4 text-forest-500" />@
                {shop.instagram.replace("@", "")}
              </a>
            )}
            {!shop.phone && !shop.website && !shop.instagram && (
              <p className="text-sm text-gray-400">Sin información de contacto</p>
            )}
          </div>

          {/* Owner */}
          <div className="bg-white rounded-2xl border border-cream-dark p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Dueño</p>
            <p className="font-medium text-forest-800">{shop.owner.name}</p>
          </div>

          {/* Overall rating */}
          {shop.reviewCount > 0 && (
            <div className="bg-forest-50 rounded-2xl border border-forest-100 p-5 text-center">
              <p className="text-4xl font-bold text-forest-700">{shop.avgRating.toFixed(1)}</p>
              <StarRating rating={shop.avgRating} size="md" />
              <p className="text-xs text-gray-500 mt-1">{shop.reviewCount} reseñas</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
