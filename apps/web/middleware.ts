import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const publicRoutes = [
  "/", "/home",
  "/login", "/register", "/forgot-password",
  "/about", "/blog", "/careers", "/contact", "/faq", "/privacy", "/terms", "/how-it-works", "/legal",
  "/plans", "/meal-plans", "/menu", "/meals", "/catalogue", "/express-shop",
  "/waitlist", "/waitlist/success",
  "/checkout", "/checkout/guest", "/checkout/guest-details", "/checkout/guest-confirmation",
  "/cart", "/shopping-cart", "/order",
  "/subscribe", "/subscribe/thanks",
]

const publicApiPrefixes = [
  "/api/auth/", "/api/products", "/api/cart", "/api/meal-plans",
  "/api/meals", "/api/waitlist", "/api/health", "/api/guest-orders",
]

function isPublicRoute(pathname: string): boolean {
  if (publicRoutes.includes(pathname)) return true
  for (const route of publicRoutes) {
    if (pathname.startsWith(`${route}/`)) return true
  }
  for (const prefix of publicApiPrefixes) {
    if (pathname.startsWith(prefix)) return true
  }
  return false
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next()
  }

  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  const sessionId = request.cookies.get("session-id")?.value

  if (!sessionId) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Session cookie exists — let route handlers validate it against the DB.
  // Admin role checks also happen server-side in the admin layout/routes.
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)",
  ],
}
