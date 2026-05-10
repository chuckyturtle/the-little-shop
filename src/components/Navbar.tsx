"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useState } from "react"
import { ShoppingBag, Map, Grid3X3, PlusCircle, User, LogOut, Menu, X } from "lucide-react"

export function Navbar() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-forest-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl hover:text-forest-100 transition-colors"
          >
            <ShoppingBag className="w-6 h-6 text-terra-400" />
            <span className="hidden sm:block">The Little Shop</span>
            <span className="sm:hidden">TLS</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink href="/" icon={<Map className="w-4 h-4" />} label="Mapa" />
            <NavLink href="/browse" icon={<Grid3X3 className="w-4 h-4" />} label="Explorar" />

            {session ? (
              <>
                <NavLink
                  href="/shops/new"
                  icon={<PlusCircle className="w-4 h-4" />}
                  label="Agregar tienda"
                  highlight
                />
                <NavLink
                  href="/profile"
                  icon={<User className="w-4 h-4" />}
                  label={session.user.name?.split(" ")[0] ?? "Mi perfil"}
                />
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-1.5 text-forest-200 hover:text-white transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-forest-100 hover:text-white transition-colors text-sm"
                >
                  Entrar
                </Link>
                <Link
                  href="/register"
                  className="bg-terra-500 hover:bg-terra-600 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-forest-700 border-t border-forest-500 px-4 py-3 space-y-2">
          <MobileNavLink href="/" label="🗺️ Mapa" onClick={() => setMenuOpen(false)} />
          <MobileNavLink href="/browse" label="🔍 Explorar" onClick={() => setMenuOpen(false)} />
          {session ? (
            <>
              <MobileNavLink
                href="/shops/new"
                label="➕ Agregar tienda"
                onClick={() => setMenuOpen(false)}
              />
              <MobileNavLink
                href="/profile"
                label={`👤 ${session.user.name?.split(" ")[0] ?? "Mi perfil"}`}
                onClick={() => setMenuOpen(false)}
              />
              <button
                onClick={() => {
                  setMenuOpen(false)
                  signOut({ callbackUrl: "/" })
                }}
                className="block w-full text-left py-2 text-forest-200 hover:text-white text-sm"
              >
                🚪 Salir
              </button>
            </>
          ) : (
            <>
              <MobileNavLink href="/login" label="Entrar" onClick={() => setMenuOpen(false)} />
              <MobileNavLink
                href="/register"
                label="Registrarse"
                onClick={() => setMenuOpen(false)}
              />
            </>
          )}
        </div>
      )}
    </nav>
  )
}

function NavLink({
  href,
  icon,
  label,
  highlight,
}: {
  href: string
  icon: React.ReactNode
  label: string
  highlight?: boolean
}) {
  return (
    <Link
      href={href}
      className={
        highlight
          ? "flex items-center gap-1.5 bg-terra-500 hover:bg-terra-600 text-white px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
          : "flex items-center gap-1.5 text-forest-100 hover:text-white transition-colors text-sm"
      }
    >
      {icon}
      {label}
    </Link>
  )
}

function MobileNavLink({
  href,
  label,
  onClick,
}: {
  href: string
  label: string
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block py-2 text-forest-100 hover:text-white transition-colors text-sm"
    >
      {label}
    </Link>
  )
}
