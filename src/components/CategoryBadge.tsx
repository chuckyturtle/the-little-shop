import { getCategoryLabel } from "@/lib/categories"

export function CategoryBadge({ categoryId }: { categoryId: string }) {
  const cat = getCategoryLabel(categoryId)
  return (
    <span className="inline-flex items-center gap-1 bg-forest-100 text-forest-800 text-xs font-medium px-2.5 py-1 rounded-full">
      <span>{cat.emoji}</span>
      <span>{cat.label}</span>
    </span>
  )
}
