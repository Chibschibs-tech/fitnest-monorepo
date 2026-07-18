"use client"

import type React from "react"
import { LanguageProvider } from "./language-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      {children}
    </LanguageProvider>
  )
}
