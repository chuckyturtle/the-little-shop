import Link from "next/link"
import Image from "next/image"
import { MapPin, Star } from "lucide-react"
import { CategoryBadge } from "./CategoryBadge"

export interface ShopCardProps {
  id: string
  name: string
  description: string
  category: string
  city: string
  country: string
  images: string[]
  avgRating: number
  reviewCount: number
}

export function ShopCard({
  id,
  name,
  description,
  category,
  city,
  country,
  images,
  avgRating,
  reviewCount,
}: ShopCardProps) {
  const cover = images[0] ?? null

  return (
    <Link
      href={`/shops/${id}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-cream-dark transition-all duration-200 hover:-translate-y-0.5"
    >
      {/* Image */}
      <div className="relative h-44 bg-forest-50">
        {cover ? (
          <Image
            src={cover}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-5xl">🏪</div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-base text-forest-900 line-clamp-1 group-hover:text-forest-600 transition-colors">
            {name}
          </h3>
        </div>

        <CategoryBadge categoryId={category} />

        <p className="text-gray-500 text-sm mt-2 line-clamp-2">{description}</p>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <MapPin className="w-3.5 h-3.5" />
            <span>
              {city}, {country}
            </span>
          </div>

          {reviewCount > 0 ? (
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium text-gray-700">
                {avgRating.toFixed(1)}
              </span>
              <span className="text-xs text-gray-400">({reviewCount})</span>
            </div>
          ) : (
            <span className="text-xs text-gray-400">Sin reseñas aún</span>
          )}
        </div>
      </div>
    </Link>
  )
}
