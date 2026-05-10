"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Globe, MapPin } from "lucide-react"

interface LocationEntry {
  country: string
  city: string
}

interface BrowseFiltersProps {
  locations: LocationEntry[]
  currentCountry: string
  currentCity: string
  currentSearch: string
  currentCategory: string
}

export function BrowseFilters({
  locations,
  currentCountry,
  currentCity,
  currentSearch,
  currentCategory,
}: BrowseFiltersProps) {
  const router = useRouter()
  const [country, setCountry] = useState(currentCountry)
  const [city, setCity] = useState(currentCity)

  const countries = [...new Set(locations.map((l) => l.country))].sort((a, b) =>
    a.localeCompare(b)
  )

  const citiesForCountry = (country
    ? locations.filter((l) => l.country === country)
    : locations
  )
    .map((l) => l.city)
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .sort((a, b) => a.localeCompare(b))

  function navigate(newCountry: string, newCity: string) {
    const params = new URLSearchParams()
    if (currentCategory) params.set("category", currentCategory)
    if (currentSearch) params.set("search", currentSearch)
    if (newCountry) params.set("country", newCountry)
    if (newCity) params.set("city", newCity)
    const qs = params.toString()
    router.push(`/browse${qs ? `?${qs}` : ""}`)
  }

  function handleCountryChange(val: string) {
    setCountry(val)
    setCity("")
    navigate(val, "")
  }

  function handleCityChange(val: string) {
    setCity(val)
    navigate(country, val)
  }

  if (locations.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      <div className="relative">
        <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        <select
          value={country}
          onChange={(e) => handleCountryChange(e.target.value)}
          className="pl-8 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-500 appearance-none cursor-pointer text-gray-700"
        >
          <option value="">Todos los países</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="relative">
        <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        <select
          value={city}
          onChange={(e) => handleCityChange(e.target.value)}
          disabled={citiesForCountry.length === 0}
          className="pl-8 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-500 appearance-none cursor-pointer text-gray-700 disabled:opacity-50"
        >
          <option value="">Todas las ciudades</option>
          {citiesForCountry.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {(country || city) && (
        <button
          onClick={() => {
            setCountry("")
            setCity("")
            navigate("", "")
          }}
          className="px-3 py-2.5 text-sm text-gray-500 hover:text-forest-700 border border-gray-200 rounded-xl hover:border-forest-400 transition-colors"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  )
}
