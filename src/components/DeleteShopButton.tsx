"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import toast from "react-hot-toast"

export function DeleteShopButton({ shopId, shopName }: { shopId: string; shopName: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm(`¿Eliminar "${shopName}"? Esta acción no se puede deshacer.`)) return

    setLoading(true)
    const res = await fetch(`/api/shops/${shopId}`, { method: "DELETE" })
    setLoading(false)

    if (res.ok) {
      toast.success("Tienda eliminada")
      router.refresh()
    } else {
      toast.error("Error al eliminar")
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-red-500 hover:text-red-700 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-medium shadow-sm opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
    >
      <Trash2 className="w-3 h-3" />
      {loading ? "…" : "Eliminar"}
    </button>
  )
}
