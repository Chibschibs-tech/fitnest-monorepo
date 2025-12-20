"use client"

import { useLanguage } from "./language-provider"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"
import { useState, useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function LanguageSwitcher() {
  const { locale, setLocale, availableLocales } = useLanguage()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const localeNames: Record<string, string> = {
    fr: 'FR',
    en: 'EN',
  }

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2 rounded-full"
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
          className="flex items-center gap-2 rounded-full"
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

