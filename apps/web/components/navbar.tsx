"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import { useLanguage } from "./language-provider"
import { getTranslations } from "@/lib/i18n"
import { LanguageSwitcher } from "./language-switcher"

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const { locale } = useLanguage()
  const t = getTranslations(locale)
  const isActive = (p: string) => pathname === p

  const isHomePage = pathname === "/" || pathname === "/home"

  useEffect(() => {
    setMounted(true)
  }, [])

  const routes = [
    { href: "/home", label: t.nav.home },
    { href: "/plans", label: t.nav.mealPlans },
    { href: "/menu", label: t.nav.meals },
    { href: "/catalogue", label: t.nav.howItWorks },
    { href: "/contact", label: t.nav.contact },
  ]

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session")
        const data = await res.json()
        setUser(data.user)
      } catch (error) {
        console.error("Failed to fetch session:", error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full transition-all">
      <div className="w-full flex h-20 items-center relative px-4 py-2">
        {/* Mobile menu button - absolute left */}
        <button
          className={`md:hidden absolute left-4 rounded-full border p-2 z-10 transition-all ${
            isHomePage
              ? "border-white/30 text-white bg-black/20 backdrop-blur-sm"
              : "border-gray-300 bg-white shadow-sm"
          }`}
          onClick={() => setOpen(true)}
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Centered content - desktop - all items as one centered group with pill-shaped background */}
        <div className="hidden md:flex items-center justify-center w-full">
          <div
            className="flex items-center px-6 py-2 rounded-full transition-all shadow-sm"
            style={
              isHomePage
                ? {
                    backgroundColor: "rgba(0, 0, 0, 0.2)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                  }
                : {
                    backgroundColor: "rgba(255, 255, 255, 0.98)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                  }
            }
          >
            <div className="flex items-center" style={{ gap: "3rem" }}>
              <Link href="/" className="flex items-center space-x-2">
                <Image
                  src="https://obtmksfewry4ishp.public.blob.vercel-storage.com/Logo/Logo-Fitnest-Vert-v412yUnhxctld0VkvDHD8wXh8H2GMQ.png"
                  alt="Fitnest.ma Logo"
                  width={150}
                  height={50}
                  className="h-12 w-auto"
                  priority
                />
              </Link>
              <nav className="flex items-center space-x-6">
                {routes.map((r) => (
                  <Link
                    key={r.href}
                    href={r.href}
                    className={`text-sm font-medium transition-colors ${
                      isHomePage
                        ? `hover:text-white ${isActive(r.href) ? "text-white" : "text-white/90"}`
                        : `hover:text-fitnest-green ${isActive(r.href) ? "text-fitnest-green" : "text-gray-600"}`
                    }`}
                  >
                    {r.label}
                  </Link>
                ))}
              </nav>
              <LanguageSwitcher />
              {!loading && (
                <Link
                  href={user ? "/dashboard" : "/login"}
                  className={`text-sm font-medium transition-colors ${
                    isHomePage
                      ? `hover:text-white ${isActive(user ? "/dashboard" : "/login") ? "text-white" : "text-white/90"}`
                      : `hover:text-fitnest-green ${isActive(user ? "/dashboard" : "/login") ? "text-fitnest-green" : "text-gray-600"}`
                  }`}
                >
                  {user ? t.nav.myAccount : t.nav.login}
                </Link>
              )}
              <Link
                href="/subscribe"
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isHomePage
                    ? "bg-white text-fitnest-green hover:bg-white/90"
                    : "bg-fitnest-green text-white hover:bg-fitnest-green/90"
                }`}
              >
                {t.nav.subscribe}
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile logo - centered with pill background */}
        <Link href="/" className="md:hidden flex items-center space-x-2 px-3 py-1.5 rounded-full transition-all" style={
          isHomePage
            ? {
                backgroundColor: "rgba(0, 0, 0, 0.2)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }
            : {
                backgroundColor: "rgba(255, 255, 255, 0.98)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(0, 0, 0, 0.08)",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
              }
        }>
          <Image
            src="https://obtmksfewry4ishp.public.blob.vercel-storage.com/Logo/Logo-Fitnest-Vert-v412yUnhxctld0VkvDHD8wXh8H2GMQ.png"
            alt="Fitnest.ma Logo"
            width={150}
            height={50}
            className="h-10 w-auto"
            priority
          />
        </Link>

        {open && (
          <div className="fixed inset-0 z-50 bg-black/20" onClick={() => setOpen(false)}>
            <div
              className="absolute right-0 top-0 h-full w-[80%] max-w-xs bg-white shadow-lg p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-lg font-bold">Menu</span>
                <button
                  className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-col space-y-4">
                {routes.map((r) => (
                  <Link
                    key={r.href}
                    href={r.href}
                    className={`py-2 text-sm font-medium hover:text-fitnest-green ${
                      isActive(r.href) ? "text-fitnest-green" : "text-gray-600"
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    {r.label}
                  </Link>
                ))}
                {!loading && (
                  <Link
                    href={user ? "/dashboard" : "/login"}
                    className={`py-2 text-sm font-medium hover:text-fitnest-green ${
                      isActive(user ? "/dashboard" : "/login") ? "text-fitnest-green" : "text-gray-600"
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    {user ? t.nav.myAccount : t.nav.login}
                  </Link>
                )}
                <div className="py-2">
                  <LanguageSwitcher />
                </div>
                <Link
                  href="/subscribe"
                  className="rounded-full bg-fitnest-green px-4 py-2 text-center text-sm font-medium text-white hover:bg-fitnest-green/90"
                  onClick={() => setOpen(false)}
                >
                  {t.nav.subscribe}
                </Link>
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
