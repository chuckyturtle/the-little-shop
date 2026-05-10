"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { InteractiveStars } from "./StarRating"
import toast from "react-hot-toast"

export function ReviewForm({ shopId }: { shopId: string }) {
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) {
      toast.error("Selecciona una calificación")
      return
    }
    setLoading(true)

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shopId, rating, comment }),
    })

    setLoading(false)

    if (res.ok) {
      setSubmitted(true)
      toast.success("¡Reseña enviada!")
      router.refresh()
    } else {
      const data = await res.json()
      toast.error(data.error ?? "Error al enviar")
    }
  }

  if (submitted) {
    return (
      <div className="bg-forest-50 border border-forest-100 rounded-xl p-4 mb-4 text-sm text-forest-700">
        ¡Gracias por tu reseña!
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-cream-dark rounded-xl p-4 mb-4 space-y-3"
    >
      <h3 className="font-medium text-forest-800">Deja tu reseña</h3>
      <InteractiveStars value={rating} onChange={setRating} />
      <textarea
        required
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="Cuéntanos tu experiencia…"
        className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 resize-none"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-forest-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-forest-700 transition-colors disabled:opacity-60"
      >
        {loading ? "Enviando…" : "Publicar reseña"}
      </button>
    </form>
  )
}
