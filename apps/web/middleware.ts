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
  "/api/test",
  "/api/test-simple",
  "/api/test-db",
  "/api/test-auth",
  "/api/auth-test",
  "/api/check-middleware",
  "/api/auth-health",
  "/api/deployment-diagnostic",
  "/api/db-check",
  "/api/direct-db-check",
  "/api/schema-check",
  "/api/db-schema",
  "/api/db-diagnostic",
  "/api/system-diagnostic",
  "/api/complete-db-diagnostic",
  "/api/debug-login",
  "/api/auth-debug",
  "/api/debug-orders",
  "/api/debug-orders-table",
  "/api/debug-cart",
  "/api/debug-cart-structure",
  "/api/debug-full-cart",
  "/api/cart-debug",
  "/api/cart-debug-actions",
  "/api/cart-diagnostic",
  "/api/check-cart-structure",
  "/api/check-cart-tables",
  "/api/products-debug",
  "/api/products-diagnostic",
  "/api/products-check",
  "/api/email-diagnostic",
  "/api/test-email",
  "/api/test-email-simple",
  "/api/check-plans",
  "/api/migration-plan",
  "/api/execute-migration",
  "/api/init-db",
  "/api/init-cart-table",
  "/api/init-products",
  "/api/create-cart-table",
  "/api/fix-cart-schema",
  "/api/fix-orders-table",
  "/api/setup-cart-tables",
  "/api/ensure-cart-table",
  "/api/ensure-products",
  "/api/fix-sessions-table",
  "/api/seed-db",
  "/api/seed-products",
  "/api/seed-products-simple",
  "/api/direct-seed-products",
  "/api/rebuild-database",
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
  "/api/cart-simple-test",
  "/api/cart-direct",
  "/api/cart-direct/count",
  "/api/cart-fix",
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
  "/api/debug-auth-status",
  "/api/debug-sessions",
  "/api/admin/waitlist",
  "/api/admin/waitlist/export",
  "/about",
  "/blog",
  "/blog/[slug]",
  "/careers",
  "/contact",
  "/debug",
  "/debug-login-test",
  "/debug-meal-plan",
  "/deployment-test",
  "/express-shop",
  "/express-shop/[id]",
  "/express-shop/diagnostic",
  "/express-shop/fixed",
  "/express-shop/minimal",
  "/express-shop/rebuild",
  "/express-shop/server",
  "/express-shop/simple",
  "/express-shop/static",
  "/faq",
  "/how-it-works",
  "/meal-plans",
  "/meal-plans/[id]",
  "/meal-plans/preview",
  "/meals",
  "/meals/[id]",
  "/privacy",
  "/terms",
  "/test",
  "/test-page",
  "/api-test",
  "/cart-test",
  "/cart-fix",
  "/clear-test-data",
  "/complete-diagnostic",
  "/fix-database",
  "/migration-control",
  "/email-test-simple",
  "/checkout/guest",
  "/checkout/guest-details",
  "/checkout/guest-confirmation",
  "/waitlist",
  "/admin/waitlist",
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
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", encodeURI(request.url))
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
