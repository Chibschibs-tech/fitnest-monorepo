import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const publicRoutes = [
  "/", "/home",
  "/login", "/register", "/forgot-password",
  "/about", "/blog", "/careers", "/contact", "/faq", "/privacy", "/terms", "/how-it-works", "/legal",
  "/plans", "/meal-plans", "/menu", "/meals", "/catalogue", "/express-shop", "/entreprises",
  "/waitlist", "/waitlist/success",
  "/checkout", "/checkout/guest", "/checkout/guest-details", "/checkout/guest-confirmation",
  "/cart", "/shopping-cart", "/order", "/compose-ton-plan",
  "/subscribe", "/subscribe/thanks",
]

const publicApiPrefixes = [
  "/api/auth/", "/api/products", "/api/cart", "/api/meal-plans",
  "/api/meals", "/api/waitlist", "/api/health", "/api/guest-orders",
  // Pricing must be readable by guests: the builders and plan cards call it
  // before anyone logs in.
  "/api/calculate-price",
  // Public B2B lead capture from /entreprises.
  "/api/company-leads",
  // Public: the Compose ton plan builder must work before login.
  "/api/compose",
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

  // Crawler + static assets must never hit auth, or Google cannot index the site.
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.startsWith("/sitemap") ||
    pathname === "/manifest.json" ||
    pathname === "/manifest.webmanifest" ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot|xml|txt|webmanifest)$/)
  ) {
    return NextResponse.next()
  }

  // ---- Locale routing -------------------------------------------------
  // French is the default and lives at the root (/plans). English is served
  // from an /en prefix (/en/plans) so both languages have their own crawlable
  // URL. The /en prefix is rewritten away, so no route files need to move.
  const isEnglish = pathname === "/en" || pathname.startsWith("/en/")
  const routePath = isEnglish ? pathname.replace(/^\/en/, "") || "/" : pathname
  const locale = isEnglish ? "en" : "fr"

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-locale", locale)
  requestHeaders.set("x-pathname", routePath)

  const withLocale = (res: NextResponse) => res

  // API routes are never locale-prefixed.
  if (isPublicRoute(routePath)) {
    if (isEnglish) {
      const url = request.nextUrl.clone()
      url.pathname = routePath
      return withLocale(NextResponse.rewrite(url, { request: { headers: requestHeaders } }))
    }
    return withLocale(NextResponse.next({ request: { headers: requestHeaders } }))
  }

  const sessionId = request.cookies.get("session-id")?.value

  if (!sessionId) {
    if (routePath.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const loginUrl = new URL(isEnglish ? "/en/login" : "/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Session cookie exists - route handlers validate it against the DB.
  if (isEnglish) {
    const url = request.nextUrl.clone()
    url.pathname = routePath
    return withLocale(NextResponse.rewrite(url, { request: { headers: requestHeaders } }))
  }
  return withLocale(NextResponse.next({ request: { headers: requestHeaders } }))
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)",
  ],
}