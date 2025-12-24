import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Lazy import to avoid database initialization during module load
async function getSessionUser(sessionId: string | null | undefined) {
  if (!sessionId) {
    return null
  }

  try {
    // Dynamic import to avoid issues during middleware initialization
    const { getSessionUser: getUser } = await import("@/lib/auth")
    return await getUser(sessionId)
  } catch (error) {
    console.error("[MIDDLEWARE] Error importing or calling getSessionUser:", error)
    return null
  }
}

// Public routes that don't require authentication
const publicRoutes = [
  // Root and home
  "/",
  "/home",
  
  // Auth pages
  "/login",
  "/register",
  "/forgot-password",
  
  // Public content pages
  "/about",
  "/blog",
  "/blog/[slug]",
  "/careers",
  "/contact",
  "/faq",
  "/privacy",
  "/terms",
  "/how-it-works",
  
  // Public product pages
  "/plans",
  "/meal-plans",
  "/meal-plans/[id]",
  "/meal-plans/preview",
  "/menu",
  "/meals",
  "/meals/[id]",
  "/catalogue",
  "/express-shop",
  "/express-shop/[id]",
  
  // Waitlist
  "/waitlist",
  "/waitlist/success",
  
  // Checkout (guest checkout)
  "/checkout",
  "/checkout/guest",
  "/checkout/guest-details",
  "/checkout/guest-confirmation",
  
  // Shopping
  "/cart",
  "/shopping-cart",
  "/order",
  
  // Subscribe
  "/subscribe",
  "/subscribe/thanks",
  
  // API routes (public)
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/session",
  "/api/auth/logout",
  "/api/auth-status",
  "/api/create-admin",
  "/api/auth/debug-login",
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
  "/api/waitlist",
  "/api/waitlist-email",
  "/api/waitlist-simple",
  "/api/waitlist/check",
  "/api/admin/waitlist",
  "/api/admin/waitlist/export",
  "/api/test-blob",
  "/api/test-email",
  "/api/email-diagnostic",
  "/api/deployment-check",
  "/api/health",
  "/api/health-check",
  "/api/db-diagnostic",
]

// Check if route is public
function isPublicRoute(pathname: string): boolean {
  // Check exact matches first
  if (publicRoutes.includes(pathname)) {
    return true
  }

  // Check dynamic routes
  for (const route of publicRoutes) {
    if (route.includes("[id]") || route.includes("[slug]")) {
      const routePrefix = route.substring(0, route.lastIndexOf("/"))
      if (pathname === routePrefix || pathname.startsWith(`${routePrefix}/`)) {
        return true
      }
    } else if (pathname.startsWith(`${route}/`)) {
      return true
    }
  }

  return false
}

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl

    // Skip middleware for static files and Next.js internals
    if (
      pathname.startsWith("/_next/") ||
      pathname.startsWith("/favicon.ico") ||
      pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot)$/)
    ) {
      return NextResponse.next()
    }

    // Check if route is public FIRST - before any database calls
    if (isPublicRoute(pathname)) {
      return NextResponse.next()
    }

    // Handle API routes
    if (pathname.startsWith("/api/")) {
      // For protected API routes, validate session
      const sessionId = request.cookies.get("session-id")?.value
      
      let user = null
      try {
        user = await getSessionUser(sessionId)
      } catch (error) {
        // Database error - treat as no session
        console.error("[MIDDLEWARE] Database error in session validation:", error)
        user = null
      }

      if (!user) {
        const response = NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        response.cookies.delete("session-id")
        return response
      }

      // Check admin API routes
      if (pathname.startsWith("/api/admin")) {
        if (user.role !== "admin") {
          return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
        }
      }

      return NextResponse.next()
    }

    // Handle page routes (protected)
    const sessionId = request.cookies.get("session-id")?.value

    if (!sessionId) {
      // No session cookie - redirect to login
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("callbackUrl", encodeURIComponent(request.url))
      return NextResponse.redirect(loginUrl)
    }

    // Validate session
    let user = null
    try {
      user = await getSessionUser(sessionId)
    } catch (error) {
      // Database error - treat as no session
      console.error("[MIDDLEWARE] Database error in session validation:", error)
      user = null
    }

    if (!user) {
      // Invalid or expired session - clear cookie and redirect
      const response = NextResponse.redirect(new URL("/login", request.url))
      response.cookies.delete("session-id")
      return response
    }

    // Check admin routes
    if (pathname.startsWith("/admin")) {
      if (user.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    }

    // Session is valid - allow request
    return NextResponse.next()
  } catch (error) {
    // Catch any unexpected errors in middleware
    console.error("[MIDDLEWARE] Unexpected error:", error)
    // For API routes, return error response
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      )
    }
    // For page routes, allow through (let Next.js handle it)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)",
  ],
}
