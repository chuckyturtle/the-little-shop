import { prisma } from "@/lib/db"
import { CATEGORIES } from "@/lib/categories"
import Link from "next/link"
import { ShopsMapClient } from "@/components/ShopsMapClient"

async function getMapShops(category?: string) {
  return prisma.shop.findMany({
    where: {
      isPaid: true,
      ...(category && category !== "all" ? { category } : {}),
    },
    select: {
      id: true,
      name: true,
      lat: true,
      lng: true,
      category: true,
      city: true,
      avgRating: true,
      reviewCount: true,
    },
  })
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const shops = await getMapShops(category)

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 64px)" }}>
      {/* Category filter bar */}
      <div className="bg-white border-b border-cream-dark shadow-sm overflow-x-auto">
        <div className="flex items-center gap-2 px-4 py-3 min-w-max">
          <Link
            href="/"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              !category
                ? "bg-forest-600 text-white"
                : "bg-cream text-gray-600 hover:bg-forest-50"
            }`}
          >
            🗺️ Todas
          </Link>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/?category=${cat.id}`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                category === cat.id
                  ? "bg-forest-600 text-white"
                  : "bg-cream text-gray-600 hover:bg-forest-50"
              }`}
            >
              {cat.emoji} {cat.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Map takes remaining height */}
      <div className="flex-1 relative">
        <ShopsMapClient shops={shops} />

        {/* Floating badge */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-white/95 backdrop-blur rounded-2xl shadow-lg px-5 py-3 flex items-center gap-4 text-sm">
          <span className="text-forest-600 font-semibold">{shops.length} tiendas en el mapa</span>
          <span className="text-gray-300">|</span>
          <Link
            href="/shops/new"
            className="text-terra-500 hover:text-terra-600 font-medium transition-colors"
          >
            ¿Tienes una tienda? Regístrala →
          </Link>
        </div>
      </div>
    </div>
  )
}
