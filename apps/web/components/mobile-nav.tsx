"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { user, isLoading } = useAuth()

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  // Update the navItems array to include Express Shop
  const navItems = [
    { href: "/", label: "Home" },
    { href: "/meal-plans", label: "Meal Plans" },
    { href: "/meals", label: "Meals" },
    { href: "/express-shop", label: "Express Shop" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/blog", label: "Blog" },
  ]

  // Add Order link if user is logged in
  if (user) {
    navItems.push({ href: "/order", label: "Orders" })
  }

  return (
    <div className="md:hidden">
      <Button variant="ghost" className="p-2 text-fitnest-green" onClick={toggleMenu} aria-label="Toggle menu">
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <Link href="/" className="text-xl font-bold text-fitnest-green" onClick={closeMenu}>
              Fitnest.ma
            </Link>
            <Button variant="ghost" className="p-2 text-fitnest-green" onClick={toggleMenu} aria-label="Close menu">
              <X size={24} />
            </Button>
          </div>
          <nav className="p-4 overflow-y-auto max-h-[calc(100vh-64px)]">
            <ul className="space-y-4">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block py-2 text-lg ${
                      pathname === item.href
                        ? "font-medium text-fitnest-green"
                        : "text-gray-600 hover:text-fitnest-green"
                    }`}
                    onClick={closeMenu}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 space-y-3">
              {!user && !isLoading ? (
                <>
                  <Link href="/login" onClick={closeMenu}>
                    <Button variant="outline" className="w-full border-fitnest-green text-fitnest-green">
                      Log In
                    </Button>
                  </Link>
                  <Link href="/register" onClick={closeMenu}>
                    <Button className="w-full bg-fitnest-green hover:bg-fitnest-green/90 text-white">Sign Up</Button>
                  </Link>
                </>
              ) : user ? (
                <>
                  <Link href="/dashboard" onClick={closeMenu}>
                    <Button variant="outline" className="w-full border-fitnest-green text-fitnest-green">
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/logout" onClick={closeMenu}>
                    <Button variant="ghost" className="w-full text-gray-600">
                      Log Out
                    </Button>
                  </Link>
                </>
              ) : null}
            </div>
          </nav>
        </div>
      )}
    </div>
  )
}
