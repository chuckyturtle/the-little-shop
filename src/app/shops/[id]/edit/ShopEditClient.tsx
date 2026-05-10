"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { CATEGORIES } from "@/lib/categories"
import {
  ArrowLeft,
  Camera,
  MapPin,
  Info,
  Plus,
  Trash2,
  Save,
  Pencil,
  Check,
  X,
} from "lucide-react"
import toast from "react-hot-toast"
import Link from "next/link"

const LocationPicker = dynamic(
  () => import("@/components/LocationPicker").then((m) => m.LocationPicker),
  { ssr: false }
)

interface Album {
  id: string
  label: string
  images: string[]
}

interface ShopData {
  id: string
  name: string
  description: string
  category: string
  address: string
  city: string
  country: string
  lat: number
  lng: number
  phone: string | null
  website: string | null
  instagram: string | null
  images: string[]
  photoAlbums: Album[]
}

const TABS = ["Información", "Fotos", "Ubicación"] as const
type Tab = (typeof TABS)[number]

export function ShopEditClient({ shop }: { shop: ShopData }) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("Información")
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Info fields
  const [name, setName] = useState(shop.name)
  const [description, setDescription] = useState(shop.description)
  const [category, setCategory] = useState(shop.category)
  const [phone, setPhone] = useState(shop.phone ?? "")
  const [website, setWebsite] = useState(shop.website ?? "")
  const [instagram, setInstagram] = useState(shop.instagram ?? "")

  // Location fields
  const [address, setAddress] = useState(shop.address)
  const [city, setCity] = useState(shop.city)
  const [country, setCountry] = useState(shop.country)
  const [lat, setLat] = useState<number | null>(shop.lat)
  const [lng, setLng] = useState<number | null>(shop.lng)

  // Photo albums
  const [albums, setAlbums] = useState<Album[]>(() => {
    if (shop.photoAlbums.length > 0) return shop.photoAlbums
    if (shop.images.length > 0) return [{ id: "default", label: "General", images: shop.images }]
    return []
  })
  const [editingAlbumId, setEditingAlbumId] = useState<string | null>(null)
  const [editingLabel, setEditingLabel] = useState("")

  const handleLocationChange = useCallback((newLat: number, newLng: number) => {
    setLat(newLat)
    setLng(newLng)
  }, [])

  async function patch(data: Record<string, unknown>) {
    const res = await fetch(`/api/shops/${shop.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const d = await res.json()
      throw new Error(d.error ?? "Error al guardar")
    }
    return res.json()
  }

  async function saveInfo() {
    if (!name.trim()) { toast.error("El nombre no puede estar vacío"); return }
    setSaving(true)
    try {
      await patch({
        name: name.trim(),
        description,
        category,
        phone: phone.trim() || null,
        website: website.trim() || null,
        instagram: instagram.trim() || null,
      })
      toast.success("Información actualizada")
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error")
    } finally {
      setSaving(false)
    }
  }

  async function saveLocation() {
    if (!lat || !lng) { toast.error("Selecciona una ubicación en el mapa"); return }
    setSaving(true)
    try {
      await patch({ address: address.trim(), city: city.trim(), country: country.trim(), lat, lng })
      toast.success("Ubicación actualizada")
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error")
    } finally {
      setSaving(false)
    }
  }

  async function persistAlbums(updated: Album[]) {
    const allImages = updated.flatMap((a) => a.images)
    await patch({ images: allImages, photoAlbums: updated })
    setAlbums(updated)
  }

  function addAlbum() {
    const newAlbum: Album = { id: `album-${Date.now()}`, label: "Nuevo álbum", images: [] }
    const updated = [...albums, newAlbum]
    setAlbums(updated)
    setEditingAlbumId(newAlbum.id)
    setEditingLabel(newAlbum.label)
  }

  async function deleteAlbum(albumId: string) {
    try {
      await persistAlbums(albums.filter((a) => a.id !== albumId))
      toast.success("Álbum eliminado")
    } catch {
      toast.error("Error al eliminar álbum")
    }
  }

  async function renameAlbum(albumId: string, label: string) {
    try {
      await persistAlbums(albums.map((a) => (a.id === albumId ? { ...a, label: label.trim() || a.label } : a)))
      setEditingAlbumId(null)
    } catch {
      toast.error("Error al renombrar")
    }
  }

  async function deletePhoto(albumId: string, imgUrl: string) {
    try {
      await persistAlbums(
        albums.map((a) =>
          a.id === albumId ? { ...a, images: a.images.filter((u) => u !== imgUrl) } : a
        )
      )
    } catch {
      toast.error("Error al eliminar foto")
    }
  }

  async function uploadToAlbum(albumId: string, files: FileList) {
    if (!files.length) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("shopId", shop.id)
      Array.from(files).forEach((f) => fd.append("images", f))
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      if (!res.ok) throw new Error("Error al subir")
      const { urls } = (await res.json()) as { urls: string[] }
      const updated = albums.map((a) =>
        a.id === albumId ? { ...a, images: [...a.images, ...urls] } : a
      )
      await persistAlbums(updated)
      toast.success(`${urls.length} foto${urls.length !== 1 ? "s" : ""} subida${urls.length !== 1 ? "s" : ""}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al subir fotos")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href={`/shops/${shop.id}`}
          className="flex items-center gap-1.5 text-gray-500 hover:text-forest-700 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Ver tienda
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-bold text-forest-900 truncate">Editar: {shop.name}</h1>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-gray-200 mb-8">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t
                ? "border-forest-600 text-forest-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "Información" && <Info className="w-4 h-4" />}
            {t === "Fotos" && <Camera className="w-4 h-4" />}
            {t === "Ubicación" && <MapPin className="w-4 h-4" />}
            {t}
          </button>
        ))}
      </div>

      {/* ── Información ── */}
      {tab === "Información" && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la tienda</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 bg-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 resize-none"
            />
          </div>

          <hr className="border-gray-100" />
          <p className="text-sm font-medium text-gray-600">Contacto y redes sociales</p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+52 55 1234 5678"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sitio web</label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://mitienda.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm">@</span>
              <input
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="mitienda"
                className="flex-1 border border-gray-200 rounded-r-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>
          </div>

          <button
            onClick={saveInfo}
            disabled={saving}
            className="flex items-center gap-2 bg-forest-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-forest-700 transition-colors disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving ? "Guardando…" : "Guardar información"}
          </button>
        </div>
      )}

      {/* ── Fotos ── */}
      {tab === "Fotos" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Organiza tus fotos en álbumes por categoría
            </p>
            <button
              onClick={addAlbum}
              className="flex items-center gap-1.5 bg-forest-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-forest-700 transition-colors whitespace-nowrap ml-4"
            >
              <Plus className="w-4 h-4" />
              Nuevo álbum
            </button>
          </div>

          {albums.length === 0 && (
            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl">
              <Camera className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Aún no tienes álbumes de fotos</p>
              <p className="text-gray-400 text-xs mt-1">Crea un álbum para empezar</p>
            </div>
          )}

          {albums.map((album) => (
            <div key={album.id} className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                {editingAlbumId === album.id ? (
                  <>
                    <input
                      autoFocus
                      value={editingLabel}
                      onChange={(e) => setEditingLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") renameAlbum(album.id, editingLabel)
                        if (e.key === "Escape") setEditingAlbumId(null)
                      }}
                      className="flex-1 border border-forest-300 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-forest-500"
                    />
                    <button onClick={() => renameAlbum(album.id, editingLabel)} className="p-1.5 text-forest-600 hover:bg-forest-50 rounded-lg transition-colors"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setEditingAlbumId(null)} className="p-1.5 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
                  </>
                ) : (
                  <>
                    <h3 className="flex-1 font-semibold text-forest-800">{album.label}</h3>
                    <span className="text-xs text-gray-400">{album.images.length} foto{album.images.length !== 1 ? "s" : ""}</span>
                    <button onClick={() => { setEditingAlbumId(album.id); setEditingLabel(album.label) }} className="p-1.5 text-gray-400 hover:text-forest-600 hover:bg-forest-50 rounded-lg transition-colors" title="Renombrar"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => deleteAlbum(album.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar álbum"><Trash2 className="w-4 h-4" /></button>
                  </>
                )}
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {album.images.map((img) => (
                  <div key={img} className="relative aspect-square rounded-xl overflow-hidden group bg-gray-100">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => deletePhoto(album.id, img)} className="absolute top-1.5 right-1.5 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity" title="Eliminar"><X className="w-3 h-3" /></button>
                  </div>
                ))}
                <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-forest-400 hover:bg-forest-50 flex flex-col items-center justify-center cursor-pointer transition-colors">
                  {uploading ? (
                    <span className="text-xs text-gray-400 text-center px-1 animate-pulse">Subiendo…</span>
                  ) : (
                    <><Plus className="w-5 h-5 text-gray-400" /><span className="text-xs text-gray-400 mt-1">Agregar</span></>
                  )}
                  <input type="file" accept="image/*" multiple className="hidden" disabled={uploading} onChange={(e) => { if (e.target.files) uploadToAlbum(album.id, e.target.files); e.target.value = "" }} />
                </label>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Ubicación ── */}
      {tab === "Ubicación" && (
        <div className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
              <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
              <input value={country} onChange={(e) => setCountry(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500" />
          </div>

          <LocationPicker lat={lat} lng={lng} onChange={handleLocationChange} />

          <button
            onClick={saveLocation}
            disabled={saving}
            className="flex items-center gap-2 bg-forest-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-forest-700 transition-colors disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving ? "Guardando…" : "Guardar ubicación"}
          </button>
        </div>
      )}
    </div>
  )
}
