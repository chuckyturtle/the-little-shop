import { prisma } from "@/lib/db"
import { CATEGORIES } from "@/lib/categories"
import { ShopCard } from "@/components/ShopCard"
import { BrowseFilters } from "@/components/BrowseFilters"
import Link from "next/link"
import { Search, Star, Store } from "lucide-react"
import type { Prisma } from "@/generated/prisma/client"

export const metadata = {
  title: "Explorar tiendas — The Little Shop",
}

type ShopRow = {
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

async function getShops(
  category: string,
  search: string,
  country: string,
  city: string,
  page: number
): Promise<{ shops: ShopRow[]; total: number; totalPages: number }> {
  const limit = 12
  const skip = (page - 1) * limit

  const where: Prisma.ShopWhereInput = { isPaid: true }
  if (category && category !== "all") where.category = category
  if (country) where.country = country
  if (city) where.city = city
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { city: { contains: search } },
      { description: { contains: search } },
    ]
  }

  const [rows, total] = await Promise.all([
    prisma.shop.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
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
      },
    }),
    prisma.shop.count({ where }),
  ])

  return {
    shops: rows.map((s) => ({ ...s, images: JSON.parse(s.images) as string[] })),
    total,
    totalPages: Math.ceil(total / limit),
  }
}

async function getTopRated(country: string, city: string): Promise<ShopRow[]> {
  const where: Prisma.ShopWhereInput = { isPaid: true, reviewCount: { gt: 0 } }
  if (country) where.country = country
  if (city) where.city = city

  const rows = await prisma.shop.findMany({
    where,
    orderBy: [{ avgRating: "desc" }, { reviewCount: "desc" }],
    take: 4,
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
    },
  })

  return rows.map((s) => ({ ...s, images: JSON.parse(s.images) as string[] }))
}

async function getLocations() {
  const rows = await prisma.shop.findMany({
    where: { isPaid: true },
    select: { country: true, city: true },
    orderBy: [{ country: "asc" }, { city: "asc" }],
  })
  const seen = new Set<string>()
  return rows.filter((r) => {
    const key = `${r.country}|${r.city}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string
    search?: string
    country?: string
    city?: string
    page?: string
  }>
}) {
  const { category = "", search = "", country = "", city = "", page = "1" } =
    await searchParams
  const currentPage = parseInt(page) || 1

  const [{ shops, total, totalPages }, topRated, locations] = await Promise.all([
    getShops(category, search, country, city, currentPage),
    getTopRated(country, city),
    getLocations(),
  ])

  const showTopRated = topRated.length > 0 && !search && !category
  const locationLabel = city || country || "el mundo"

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-forest-800 mb-1">Explorar tiendas</h1>
        <p className="text-gray-500">
          {total === 0
            ? "No hay tiendas que coincidan con tu búsqueda"
            : `${total} tienda${total !== 1 ? "s" : ""} publicada${total !== 1 ? "s" : ""} alrededor del mundo`}
        </p>
      </div>

      {/* Search bar */}
      <form className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            name="search"
            defaultValue={search}
            placeholder="Busca por nombre, ciudad, descripción…"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 bg-white"
          />
          {category && <input type="hidden" name="category" value={category} />}
          {country && <input type="hidden" name="country" value={country} />}
          {city && <input type="hidden" name="city" value={city} />}
        </div>
        <button
          type="submit"
          className="bg-forest-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-forest-700 transition-colors"
        >
          Buscar
        </button>
      </form>

      {/* Country / city dropdowns */}
      <BrowseFilters
        locations={locations}
        currentCountry={country}
        currentCity={city}
        currentSearch={search}
        currentCategory={category}
      />

      <div className="flex gap-8 mt-8">
        {/* Sidebar categories */}
        <aside className="hidden lg:block w-56 shrink-0">
          <h2 className="font-semibold text-forest-800 mb-3 text-sm uppercase tracking-wide">
            Categorías
          </h2>
          <ul className="space-y-1">
            <li>
              <Link
                href={buildUrl("", search, country, city)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  !category ? "bg-forest-600 text-white" : "text-gray-600 hover:bg-forest-50"
                }`}
              >
                🗺️ Todas las tiendas
              </Link>
            </li>
            {CATEGORIES.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={buildUrl(cat.id, search, country, city)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    category === cat.id
                      ? "bg-forest-600 text-white"
                      : "text-gray-600 hover:bg-forest-50"
                  }`}
                >
                  {cat.emoji} {cat.label}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Mobile category pills */}
          <div className="flex gap-2 overflow-x-auto pb-3 lg:hidden mb-4 scrollbar-hide">
            <Link
              href="/browse"
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !category
                  ? "bg-forest-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600"
              }`}
            >
              Todas
            </Link>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={buildUrl(cat.id, search, country, city)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  category === cat.id
                    ? "bg-forest-600 text-white"
                    : "bg-white border border-gray-200 text-gray-600"
                }`}
              >
                {cat.emoji} {cat.label}
              </Link>
            ))}
          </div>

          {/* ⭐ Top rated section */}
          {showTopRated && (
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <h2 className="font-semibold text-forest-800">
                  Mejor valoradas en {locationLabel}
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {topRated.map((shop) => (
                  <ShopCard key={shop.id} {...shop} />
                ))}
              </div>
              <hr className="border-gray-100 mt-8" />
            </section>
          )}

          {/* All shops grid */}
          {shops.length === 0 ? (
            <div className="text-center py-20">
              <Store className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-400 mb-1">No hay tiendas aquí todavía</p>
              <p className="text-sm text-gray-400 mb-6">
                {search || country || city || category
                  ? "Intenta con otra búsqueda o quita algunos filtros"
                  : "Sé el primero en registrar tu tienda local"}
              </p>
              {!search && !country && !city && !category && (
                <Link
                  href="/shops/new"
                  className="inline-flex items-center gap-2 bg-forest-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-forest-700 transition-colors"
                >
                  Registrar mi tienda →
                </Link>
              )}
            </div>
          ) : (
            <>
              {(search || category) && (
                <p className="text-sm text-gray-500 mb-4">
                  {total} resultado{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {shops.map((shop) => (
                  <ShopCard key={shop.id} {...shop} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Link
                      key={p}
                      href={buildUrl(category, search, country, city, p)}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        p === currentPage
                          ? "bg-forest-600 text-white"
                          : "bg-white border border-gray-200 text-gray-600 hover:bg-forest-50"
                      }`}
                    >
                      {p}
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function buildUrl(
  category: string,
  search: string,
  country: string,
  city: string,
  page?: number
): string {
  const params = new URLSearchParams()
  if (category) params.set("category", category)
  if (search) params.set("search", search)
  if (country) params.set("country", country)
  if (city) params.set("city", city)
  if (page && page > 1) params.set("page", String(page))
  const qs = params.toString()
  return `/browse${qs ? `?${qs}` : ""}`
}
