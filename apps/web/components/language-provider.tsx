"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { Locale, defaultLocale, locales } from "@/lib/i18n"

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  availableLocales: readonly Locale[]
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load saved locale from localStorage only on client side
    if (typeof window !== 'undefined') {
      try {
        const savedLocale = localStorage.getItem('locale') as Locale | null
        if (savedLocale && locales.includes(savedLocale)) {
          setLocaleState(savedLocale)
        }
      } catch (error) {
        console.error('Error loading locale from localStorage:', error)
      }
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('locale', newLocale)
      } catch (error) {
        console.error('Error saving locale to localStorage:', error)
      }
    }
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, availableLocales: locales }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

