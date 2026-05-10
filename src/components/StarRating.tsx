"use client"

import { Star } from "lucide-react"

export function StarRating({
  rating,
  max = 5,
  size = "sm",
}: {
  rating: number
  max?: number
  size?: "sm" | "md"
}) {
  const px = size === "md" ? "w-5 h-5" : "w-4 h-4"
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={`${px} ${
            i < Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-none text-gray-300"
          }`}
        />
      ))}
    </div>
  )
}

export function InteractiveStars({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" onClick={() => onChange(star)}>
          <Star
            className={`w-7 h-7 transition-colors ${
              star <= value
                ? "fill-amber-400 text-amber-400"
                : "fill-none text-gray-300 hover:text-amber-300"
            }`}
          />
        </button>
      ))}
    </div>
  )
}
