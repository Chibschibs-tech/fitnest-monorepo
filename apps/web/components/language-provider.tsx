"use client"

import { createContext, useContext, ReactNode, useMemo } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Locale, defaultLocale, locales } from "@/lib/i18n"

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  availableLocales: readonly Locale[]
  /** Same page in the other language, for hreflang and the switcher. */
  pathFor: (locale: Locale) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

/** French lives at the root; English is served from an /en prefix. */
export function localeFromPathname(pathname: string): Locale {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "fr"
}

export function stripLocale(pathname: string): string {
  return pathname === "/en" || pathname.startsWith("/en/")
    ? pathname.replace(/^\/en/, "") || "/"
    : pathname
}

export function localePath(pathname: string, locale: Locale): string {
  const base = stripLocale(pathname)
  if (locale === "en") return base === "/" ? "/en" : `/en${base}`
  return base
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/"
  const router = useRouter()

  // The URL is the single source of truth, so the language a visitor sees is
  // the language Google indexes for that URL.
  const locale = localeFromPathname(pathname)

  const value = useMemo<LanguageContextType>(
    () => ({
      locale,
      availableLocales: locales,
      pathFor: (l: Locale) => localePath(pathname, l),
      setLocale: (newLocale: Locale) => {
        if (newLocale === locale) return
        router.push(localePath(pathname, newLocale))
      },
    }),
    [locale, pathname, router],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

export { defaultLocale }