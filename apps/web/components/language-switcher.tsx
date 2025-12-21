"use client"

import { useLanguage } from "./language-provider"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function LanguageSwitcher() {
  const { locale, setLocale, availableLocales } = useLanguage()
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  const isHomePage = pathname === "/" || pathname === "/home"

  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle scroll for navbar background change on home page
  useEffect(() => {
    if (!isHomePage) {
      setScrolled(true)
      return
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setScrolled(scrollPosition > window.innerHeight * 0.8)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [isHomePage])

  const localeNames: Record<string, string> = {
    fr: 'FR',
    en: 'EN',
  }

  const isTransparentNavbar = isHomePage && !scrolled

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={`flex items-center gap-2 rounded-full ${
          isTransparentNavbar ? "text-fitnest-orange hover:text-fitnest-orange/80" : ""
        }`}
        disabled
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">FR</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`flex items-center gap-2 rounded-full ${
            isTransparentNavbar ? "text-fitnest-orange hover:text-fitnest-orange/80" : ""
          }`}
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{localeNames[locale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {availableLocales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => setLocale(loc)}
            className={locale === loc ? "bg-fitnest-green/10 text-fitnest-green" : ""}
          >
            {localeNames[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

