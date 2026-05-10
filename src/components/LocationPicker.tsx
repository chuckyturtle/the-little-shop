"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function MapFlyTo({ target }: { target: { lat: number; lng: number } | null }) {
  const map = useMap()
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], 14, { duration: 1 })
  }, [target, map])
  return null
}

export function LocationPicker({
  lat,
  lng,
  onChange,
}: {
  lat: number | null
  lng: number | null
  onChange: (lat: number, lng: number) => void
}) {
  const [ready, setReady] = useState(false)
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([])
  const [loading, setLoading] = useState(false)
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number } | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setReady(true)
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.trim().length < 3) {
      setSuggestions([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
          { headers: { "Accept-Language": "es,en" } }
        )
        const data: NominatimResult[] = await res.json()
        setSuggestions(data)
      } catch {
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  const handleSelect = useCallback(
    (result: NominatimResult) => {
      const newLat = parseFloat(result.lat)
      const newLng = parseFloat(result.lon)
      onChange(newLat, newLng)
      setFlyTarget({ lat: newLat, lng: newLng })
      setQuery(result.display_name.split(",")[0])
      setSuggestions([])
    },
    [onChange]
  )

  if (!ready) {
    return (
      <div className="h-64 bg-forest-50 rounded-xl flex items-center justify-center">
        <p className="text-forest-600 animate-pulse">Cargando mapa…</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Busca tu ciudad o dirección…"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 pr-24"
          autoComplete="off"
        />
        {loading && (
          <span className="absolute right-3 top-2.5 text-xs text-gray-400 pointer-events-none">
            Buscando…
          </span>
        )}
        {suggestions.length > 0 && (
          <ul className="absolute z-[9999] left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
            {suggestions.map((s) => (
              <li
                key={s.place_id}
                onMouseDown={() => handleSelect(s)}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-forest-50 hover:text-forest-800 border-b border-gray-100 last:border-0"
              >
                {s.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="h-64 rounded-xl overflow-hidden border border-gray-200 cursor-crosshair">
        <MapContainer
          center={lat && lng ? [lat, lng] : [20, 0]}
          zoom={lat && lng ? 14 : 2}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPick={onChange} />
          <MapFlyTo target={flyTarget} />
          {lat !== null && lng !== null && (
            <Marker position={[lat, lng]} />
          )}
        </MapContainer>
      </div>

      {lat && lng ? (
        <p className="text-xs text-gray-500 text-center">
          Ubicación seleccionada · {lat.toFixed(5)}, {lng.toFixed(5)}
        </p>
      ) : (
        <p className="text-xs text-gray-400 text-center">
          Busca una dirección arriba o haz clic en el mapa para marcar la ubicación
        </p>
      )}
    </div>
  )
}
