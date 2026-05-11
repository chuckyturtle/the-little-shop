"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { CATEGORIES } from "@/lib/categories"
import {
  Store,
  MapPin,
  Phone,
  Camera,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  Check,
} from "lucide-react"
import toast from "react-hot-toast"

const LocationPicker = dynamic(
  () => import("@/components/LocationPicker").then((m) => m.LocationPicker),
  { ssr: false }
)

const STEPS = [
  { label: "Básicos", icon: Store },
  { label: "Ubicación", icon: MapPin },
  { label: "Contacto", icon: Phone },
  { label: "Fotos", icon: Camera },
  { label: "Pago", icon: CreditCard },
]

interface ShopDraft {
  name: string
  description: string
  category: string
  address: string
  city: string
  country: string
  lat: number | null
  lng: number | null
  phone: string
  website: string
  instagram: string
}

export default function NewShopPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [shopId, setShopId] = useState<string | null>(null)
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [isFree, setIsFree] = useState<boolean | null>(null)

  const [draft, setDraft] = useState<ShopDraft>({
    name: "",
    description: "",
    category: "other",
    address: "",
    city: "",
    country: "",
    lat: null,
    lng: null,
    phone: "",
    website: "",
    instagram: "",
  })

  const set = (key: keyof ShopDraft, value: string | number | null) =>
    setDraft((d) => ({ ...d, [key]: value }))

  async function saveStep0to2(): Promise<string | null> {
    if (shopId) return shopId

    if (!draft.name || !draft.description || !draft.category) {
      toast.error("Completa los campos básicos")
      return null
    }
    if (draft.lat === null || draft.lng === null) {
      toast.error("Selecciona la ubicación en el mapa")
      return null
    }

    setLoading(true)
    const res = await fetch("/api/shops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    })
    setLoading(false)

    if (!res.ok) {
      const d = await res.json()
      toast.error(d.error ?? "Error al guardar")
      return null
    }

    const data = await res.json()
    setShopId(data.id)
    return data.id
  }

  async function handleNext() {
    if (step === 1 && (draft.lat === null || draft.lng === null)) {
      toast.error("Haz clic en el mapa para seleccionar la ubicación")
      return
    }
    if (step === 2) {
      const id = await saveStep0to2()
      if (!id) return
    }
    if (step === 3) {
      // Upload photos if any
      if (files.length > 0 && shopId) {
        setLoading(true)
        const fd = new FormData()
        fd.append("shopId", shopId)
        files.forEach((f) => fd.append("images", f))
        const res = await fetch("/api/upload", { method: "POST", body: fd })
        setLoading(false)
        if (res.ok) {
          const { urls } = await res.json()
          // Persist uploaded image URLs to the shop record
          await fetch(`/api/shops/${shopId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ images: urls }),
          })
        } else {
          toast.error("Error al subir imágenes, continuando…")
        }
      }
    }
    const nextStep = Math.min(step + 1, STEPS.length - 1)
    setStep(nextStep)
    if (nextStep === 4 && isFree === null) {
      fetch("/api/payment/check-free")
        .then((r) => r.json())
        .then((d) => setIsFree(d.eligible))
    }
  }

  async function handlePay() {
    let id = shopId
    if (!id) {
      id = await saveStep0to2()
      if (!id) return
    }

    setLoading(true)
    const res = await fetch("/api/payment/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shopId: id }),
    })
    setLoading(false)

    if (!res.ok) {
      const d = await res.json()
      toast.error(d.error ?? "Error al crear pago")
      return
    }

    const { url } = await res.json()
    if (url) window.location.href = url
  }

  const handleLocationChange = useCallback(
    (lat: number, lng: number) => {
      set("lat", lat)
      set("lng", lng)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-forest-900 mb-2">Registrar mi tienda</h1>
      <p className="text-gray-500 text-sm mb-8">
        Pago único de $5 USD · Tu tienda queda publicada para siempre en el mapa
      </p>

      {/* Step indicator */}
      <div className="flex items-center mb-10">
        {STEPS.map((s, i) => {
          const Icon = s.icon
          const done = i < step
          const active = i === step
          return (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div
                className={`flex flex-col items-center gap-1 cursor-default ${
                  done || active ? "text-forest-700" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors ${
                    done
                      ? "bg-forest-600 border-forest-600 text-white"
                      : active
                      ? "border-forest-600 bg-white text-forest-600"
                      : "border-gray-200 bg-white text-gray-400"
                  }`}
                >
                  {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className="text-xs font-medium hidden sm:block">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 transition-colors ${
                    i < step ? "bg-forest-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Step content */}
      <div className="bg-white rounded-2xl shadow-sm border border-cream-dark p-6 min-h-64">
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-forest-800 text-lg mb-1">Información básica</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la tienda *
              </label>
              <input
                value={draft.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Ej. Taquería El Güero"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
              <select
                value={draft.category}
                onChange={(e) => set("category", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.emoji} {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción *
              </label>
              <textarea
                value={draft.description}
                onChange={(e) => set("description", e.target.value)}
                rows={4}
                placeholder="Cuéntanos qué ofrece tu tienda, qué la hace especial…"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 resize-none"
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-forest-800 text-lg mb-1">Ubicación</h2>
            <p className="text-sm text-gray-500">
              Busca tu ciudad o haz clic en el mapa para marcar tu tienda
            </p>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad *</label>
                <input
                  value={draft.city}
                  onChange={(e) => set("city", e.target.value)}
                  placeholder="Ciudad de México"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">País *</label>
                <input
                  value={draft.country}
                  onChange={(e) => set("country", e.target.value)}
                  placeholder="México"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección (calle y número)
              </label>
              <input
                value={draft.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="Calle Madero 123, Centro"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>

            <LocationPicker
              lat={draft.lat}
              lng={draft.lng}
              onChange={handleLocationChange}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-forest-800 text-lg mb-1">
              Contacto y redes sociales
            </h2>
            <p className="text-sm text-gray-500">Todo es opcional pero ayuda a los clientes</p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                type="tel"
                value={draft.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+52 55 1234 5678"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sitio web
              </label>
              <input
                type="url"
                value={draft.website}
                onChange={(e) => set("website", e.target.value)}
                placeholder="https://mitienda.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm">
                  @
                </span>
                <input
                  value={draft.instagram}
                  onChange={(e) => set("instagram", e.target.value)}
                  placeholder="mitienda"
                  className="flex-1 border border-gray-200 rounded-r-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-forest-800 text-lg mb-1">
              Fotos de tu tienda
            </h2>
            <p className="text-sm text-gray-500">
              Sube hasta 5 fotos. Esto es opcional pero hace tu tienda más atractiva.
            </p>

            <label className="block w-full border-2 border-dashed border-forest-300 rounded-xl p-8 text-center cursor-pointer hover:border-forest-500 transition-colors bg-forest-50">
              <Camera className="w-8 h-8 text-forest-400 mx-auto mb-2" />
              <span className="text-forest-600 text-sm font-medium">
                Haz clic para seleccionar imágenes
              </span>
              <br />
              <span className="text-gray-400 text-xs">JPG, PNG, WebP · Máx 5MB c/u</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const selected = Array.from(e.target.files ?? []).slice(0, 5)
                  setFiles(selected)
                }}
              />
            </label>

            {files.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {files.map((f, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={URL.createObjectURL(f)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-terra-50 text-terra-500 text-3xl mx-auto">
              {isFree ? "🎁" : "💳"}
            </div>
            <div>
              <h2 className="text-xl font-bold text-forest-900">Publicar mi tienda</h2>
              {isFree ? (
                <p className="text-forest-600 text-sm mt-2 max-w-sm mx-auto font-medium">
                  Tu primera tienda es completamente gratis. ¡Publícala ahora sin costo!
                </p>
              ) : (
                <p className="text-gray-500 text-sm mt-2 max-w-sm mx-auto">
                  Tu tienda quedará publicada en el mapa global de forma permanente por un pago único.
                </p>
              )}
            </div>

            <div className="bg-forest-50 rounded-2xl p-5 text-left border border-forest-100">
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-700 font-medium">{draft.name || "Tu tienda"}</span>
                {isFree && (
                  <span className="bg-forest-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    GRATIS
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center border-t border-forest-100 pt-3">
                <span className="text-gray-600">Publicación única</span>
                {isFree ? (
                  <div className="text-right">
                    <span className="text-gray-400 line-through text-sm mr-2">$5 USD</span>
                    <span className="text-2xl font-bold text-forest-700">$0</span>
                  </div>
                ) : (
                  <span className="text-2xl font-bold text-forest-700">$5 USD</span>
                )}
              </div>
            </div>

            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full bg-terra-500 hover:bg-terra-600 text-white font-semibold py-3.5 px-6 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isFree ? (
                <>🎁 {loading ? "Publicando…" : "Publicar mi tienda gratis"}</>
              ) : (
                <><CreditCard className="w-5 h-5" /> {loading ? "Procesando…" : "Pagar $5 y publicar mi tienda"}</>
              )}
            </button>

            <p className="text-xs text-gray-400">
              {isFree
                ? "Primera tienda gratis · Segunda tienda en adelante $5 USD"
                : "Pago seguro a través de Stripe · Sin suscripciones ni cargos extra"}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        {step > 0 ? (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="flex items-center gap-1.5 text-gray-500 hover:text-forest-700 text-sm transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Atrás
          </button>
        ) : (
          <div />
        )}

        {step < STEPS.length - 1 && (
          <button
            onClick={handleNext}
            disabled={loading}
            className="flex items-center gap-1.5 bg-forest-600 hover:bg-forest-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
          >
            {loading ? "Guardando…" : "Siguiente"}
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
