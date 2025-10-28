"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, X } from "lucide-react"
import { CartIcon } from "@/components/cart-icon"
import { NavbarAuth } from "@/components/navbar-auth"
import Image from "next/image"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const routes = [
    { href: "/", label: "Home" },
    { href: "/meal-plans", label: "Meal Plans" },
    { href: "/meals", label: "Meals" },
    { href: "/express-shop", label: "Express Shop" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ]

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Image
              src="https://obtmksfewry4ishp.public.blob.vercel-storage.com/Logo/Logo-Fitnest-Vert-v412yUnhxctld0VkvDHD8wXh8H2GMQ.png"
              alt="Fitnest.ma Logo"
              width={150}
              height={50}
              className="h-12 w-auto"
              priority
            />
          </Link>

          <nav className="hidden md:flex md:items-center md:space-x-6">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={`text-sm font-medium transition-colors hover:text-fitnest-green ${
                  isActive(route.href) ? "text-fitnest-green" : "text-gray-600"
                }`}
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            href="/order"
            className="hidden rounded-md bg-fitnest-green px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 md:block"
          >
            Order
          </Link>
          <div className="hidden md:block">
            <NavbarAuth />
          </div>
          <CartIcon />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon" aria-label="Menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80%] sm:w-[350px]">
              <div className="flex flex-col space-y-6 pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">Menu</span>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <nav className="flex flex-col space-y-4">
                  {routes.map((route) => (
                    <Link
                      key={route.href}
                      href={route.href}
                      className={`py-2 text-sm font-medium transition-colors hover:text-fitnest-green ${
                        isActive(route.href) ? "text-fitnest-green" : "text-gray-600"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {route.label}
                    </Link>
                  ))}
                  <Link
                    href="/order"
                    className="rounded-md bg-fitnest-green px-4 py-2 text-center text-sm font-medium text-white hover:bg-opacity-90"
                    onClick={() => setIsOpen(false)}
                  >
                    Order
                  </Link>
                </nav>
                <div className="border-t pt-4">
                  <NavbarAuth />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

// Also export as named export for compatibility
export { Navbar }
