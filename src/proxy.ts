import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"

const PROTECTED_PATHS = ["/profile", "/shops/new"]

export async function proxy(request: NextRequest) {
  const session = await auth()
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p))
  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/profile/:path*", "/shops/new/:path*"],
}
