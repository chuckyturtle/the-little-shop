"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import Link from "next/link"
import { StarRating } from "./StarRating"
import { getCategoryLabel } from "@/lib/categories"
import "leaflet/dist/leaflet.css"

// Fix Leaflet default icon path issue with bundlers
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

const PIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 42" fill="none">
  <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 28 14 28s14-17.5 14-28C28 6.268 21.732 0 14 0z" fill="#2D6A4F"/>
  <circle cx="14" cy="14" r="6" fill="white"/>
  <circle cx="14" cy="14" r="3" fill="#2D6A4F"/>
</svg>`

const forestIcon = new L.Icon({
  iconUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(PIN_SVG)}`,
  iconSize: [28, 42],
  iconAnchor: [14, 42],
  popupAnchor: [0, -42],
})

export interface MapShop {
  id: string
  name: string
  lat: number
  lng: number
  category: string
  city: string
  avgRating: number
  reviewCount: number
}

function MapUpdater({ center }: { center: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.flyTo(center, 14, { duration: 1.2 })
  }, [center, map])
  return null
}

export function ShopsMap({
  shops,
  flyTo,
}: {
  shops: MapShop[]
  flyTo?: [number, number] | null
}) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-full bg-forest-50">
        <p className="text-forest-600 animate-pulse">Cargando mapa…</p>
      </div>
    )
  }

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      className="h-full w-full"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {flyTo && <MapUpdater center={flyTo} />}

      {shops.map((shop) => {
        const cat = getCategoryLabel(shop.category)
        return (
          <Marker key={shop.id} position={[shop.lat, shop.lng]} icon={forestIcon}>
            <Popup>
              <div className="min-w-[180px]">
                <p className="font-semibold text-forest-800 text-base mb-0.5">{shop.name}</p>
                <p className="text-xs text-gray-500 mb-1">
                  {cat.emoji} {cat.label} · {shop.city}
                </p>
                {shop.reviewCount > 0 && (
                  <div className="mb-2">
                    <StarRating rating={shop.avgRating} />
                    <span className="text-xs text-gray-400">({shop.reviewCount} reseñas)</span>
                  </div>
                )}
                <Link
                  href={`/shops/${shop.id}`}
                  className="block text-center bg-forest-600 text-white text-xs py-1.5 px-3 rounded-lg hover:bg-forest-700 transition-colors"
                >
                  Ver tienda →
                </Link>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
