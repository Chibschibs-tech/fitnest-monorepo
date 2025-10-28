"use client"

import type React from "react"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Providers } from "@/components/providers"
import { usePathname } from "next/navigation"

export function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isWaitlistPage = pathname === "/waitlist"

  return (
    <Providers>
      <div className="flex min-h-screen flex-col">
        {!isWaitlistPage && <Navbar />}
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </Providers>
  )
}
