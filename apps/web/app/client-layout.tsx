"use client"

import type React from "react"
import "./globals.css"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Providers } from "@/components/providers"
import { usePathname } from "next/navigation"
import { stripLocale } from "@/components/language-provider"

export function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const p = stripLocale(pathname || "/")
  const isHomePage = p === "/" || p === "/home"
  
  return (
    <Providers>
      <div className="flex min-h-screen flex-col relative">
        <Navbar />
        <main className={isHomePage ? "flex-1 p-0" : "flex-1 pt-20"}>{children}</main>
        <Footer />
      </div>
    </Providers>
  )
}
