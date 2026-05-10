export const CATEGORIES = [
  { id: "grocery", label: "Abarrotes y Alimentos", emoji: "🛒" },
  { id: "clothing", label: "Ropa y Moda", emoji: "👗" },
  { id: "electronics", label: "Electrónica", emoji: "📱" },
  { id: "crafts", label: "Artesanías", emoji: "🎨" },
  { id: "books", label: "Libros y Papelería", emoji: "📚" },
  { id: "beauty", label: "Salud y Belleza", emoji: "💄" },
  { id: "home", label: "Hogar y Jardín", emoji: "🏠" },
  { id: "toys", label: "Juguetes", emoji: "🧸" },
  { id: "sports", label: "Deportes", emoji: "⚽" },
  { id: "pets", label: "Mascotas", emoji: "🐾" },
  { id: "food", label: "Restaurantes y Cafeterías", emoji: "🍕" },
  { id: "services", label: "Servicios", emoji: "🛠️" },
  { id: "other", label: "Otros", emoji: "✨" },
] as const

export type CategoryId = (typeof CATEGORIES)[number]["id"]

export function getCategoryLabel(id: string) {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1]
}
