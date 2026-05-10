"use client"

import dynamic from "next/dynamic"

const MiniMap = dynamic(() => import("./MiniMap").then((m) => m.MiniMap), {
  ssr: false,
  loading: () => <div className="h-full bg-forest-50 animate-pulse rounded-xl" />,
})

export function MiniMapClient(props: { lat: number; lng: number; name: string }) {
  return <MiniMap {...props} />
}
