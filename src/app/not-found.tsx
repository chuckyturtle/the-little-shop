import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="text-center">
        <p className="text-6xl mb-4">🏪</p>
        <h1 className="text-2xl font-bold text-forest-900 mb-2">Página no encontrada</h1>
        <p className="text-gray-500 mb-6">Esta tienda o página no existe.</p>
        <Link
          href="/"
          className="bg-forest-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-forest-700 transition-colors"
        >
          Volver al mapa
        </Link>
      </div>
    </div>
  )
}
