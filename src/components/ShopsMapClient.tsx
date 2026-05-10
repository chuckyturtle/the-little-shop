"use client"

import dynamic from "next/dynamic"
import type { MapShop } from "./ShopsMap"

const ShopsMap = dynamic(() => import("./ShopsMap").then((m) => m.ShopsMap), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-forest-50">
      <p className="text-forest-600 animate-pulse">Cargando mapa…</p>
    </div>
  ),
})

export function ShopsMapClient({
  shops,
  flyTo,
}: {
  shops: MapShop[]
  flyTo?: [number, number] | null
}) {
  return <ShopsMap shops={shops} flyTo={flyTo} />
}
