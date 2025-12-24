import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/session",
  "/api/auth-status",
  "/api/health",
  "/api/create-admin",
  "/api/products",
  "/api/products-simple",
  "/api/products-basic",
  "/api/products/[id]",
  "/api/cart",
  "/api/cart/count",
  "/api/cart/add",
  "/api/cart/remove",
  "/api/cart/update",
  "/api/cart/clear",
  "/api/cart-simple",
  "/api/cart-direct",
  "/api/cart-direct/count",
  "/api/guest-orders",
  "/api/meal-plans",
  "/api/meals",
  "/api/upload",
  "/api/auth/[...nextauth]",
  "/api/auth/error",
  "/api/auth/signout",
  "/api/waitlist",
  "/api/waitlist-email",
  "/api/waitlist-simple",
  "/api/admin/waitlist",
  "/api/admin/waitlist/export",
  "/api/test-blob",
  "/about",
  "/blog",
  "/blog/[slug]",
  "/careers",
  "/contact",
  "/express-shop",
  "/express-shop/[id]",
  "/faq",
  "/how-it-works",
  "/meal-plans",
  "/meal-plans/[id]",
  "/meal-plans/preview",
  "/meals",
  "/meals/[id]",
  "/privacy",
  "/terms",
  "/checkout/guest",
  "/checkout/guest-details",
  "/checkout/guest-confirmation",
  "/waitlist",
  "/home",
  "/order",
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path is a public route or starts with a public route prefix
  const isPublicRoute = publicRoutes.some((route) => {
    if (route.endsWith("/[id]") || route.endsWith("/[slug]")) {
      // For dynamic routes, check if the pathname starts with the route prefix
      const routePrefix = route.substring(0, route.lastIndexOf("/"))
      return pathname === routePrefix || pathname.startsWith(`${routePrefix}/`)
    }
    return pathname === route || pathname.startsWith(`${route}/`)
  })

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // For protected routes, check authentication
  const sessionId = request.cookies.get("session-id")?.value

  if (!sessionId) {
    // For API routes, return JSON 401 instead of redirecting
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    // For page routes, redirect to login
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", encodeURI(request.url))
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
