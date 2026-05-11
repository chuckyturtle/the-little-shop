import type { Metadata } from "next"
import "./globals.css"
import { Navbar } from "@/components/Navbar"
import { Toaster } from "react-hot-toast"
import { SessionProvider } from "@/components/SessionProvider"
import { auth } from "@/auth"

export const metadata: Metadata = {
  title: "The Little Shop — Descubre tiendas locales cerca de ti",
  description:
    "Explora y descubre pequeños negocios y tiendas locales de todo el mundo en un solo mapa.",
  keywords: ["tiendas locales", "negocios pequeños", "comercio local", "mapa"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "The Little Shop",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#2D6A4F",
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <html lang="es" className="h-full">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="theme-color" content="#2D6A4F" />
      </head>
      <body className="min-h-full flex flex-col bg-cream text-foreground">
        <SessionProvider session={session}>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#2D6A4F",
                color: "#fff",
                borderRadius: "8px",
              },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  )
}
