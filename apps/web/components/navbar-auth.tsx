"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogOut, User, ShoppingBag } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

interface NavbarAuthProps {
  isMobile?: boolean
  onMenuClose?: () => void
}

function NavbarAuth({ isMobile = false, onMenuClose }: NavbarAuthProps) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session")
        const data = await res.json()
        setUser(data.user)
        setLoading(false)
      } catch (error) {
        console.error("Failed to fetch session:", error)
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  const handleLogout = async () => {
    if (onMenuClose) {
      onMenuClose()
    }

    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      })

      if (res.ok) {
        setUser(null)
        router.push("/")
      }
    } catch (error) {
      console.error("Logout error:", error)
      router.push("/logout")
    }
  }

  if (loading) {
    return null
  }

  if (user) {
    if (isMobile) {
      return (
        <div className="space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center text-gray-600 hover:text-fitnest-green px-2 py-1 rounded hover:bg-gray-100"
            onClick={onMenuClose}
          >
            <User className="h-4 w-4 mr-2" />
            Dashboard
          </Link>
          <Link
            href="/orders"
            className="flex items-center text-gray-600 hover:text-fitnest-green px-2 py-1 rounded hover:bg-gray-100"
            onClick={onMenuClose}
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Orders
          </Link>
          <Link
            href="/blog"
            className="flex items-center text-gray-600 hover:text-fitnest-green px-2 py-1 rounded hover:bg-gray-100"
            onClick={onMenuClose}
          >
            <User className="h-4 w-4 mr-2" />
            Blog
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center w-full text-left text-gray-600 hover:text-fitnest-green px-2 py-1 rounded hover:bg-gray-100"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>
      )
    }

    return (
      <div className="flex items-center space-x-4">
        <Link href="/dashboard">
          <Button variant="ghost" className="text-fitnest-green hover:bg-gray-100">
            Dashboard
          </Button>
        </Link>
        <Link href="/orders">
          <Button variant="ghost" className="text-fitnest-green hover:bg-gray-100">
            Orders
          </Button>
        </Link>
        <Button variant="ghost" onClick={handleLogout} className="text-fitnest-green hover:bg-gray-100">
          Logout
        </Button>
      </div>
    )
  }

  if (isMobile) {
    return (
      <div className="space-y-2">
        <Link
          href="/login"
          className="block text-gray-600 hover:text-fitnest-green px-2 py-1 rounded hover:bg-gray-100"
          onClick={onMenuClose}
        >
          Login
        </Link>
        <Link
          href="/register"
          className="block text-fitnest-green font-medium px-2 py-1 rounded hover:bg-gray-100"
          onClick={onMenuClose}
        >
          Sign Up
        </Link>
        <Link
          href="/blog"
          className="block text-gray-600 hover:text-fitnest-green px-2 py-1 rounded hover:bg-gray-100"
          onClick={onMenuClose}
        >
          Blog
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-4">
      <Link href="/login">
        <Button variant="ghost" className="text-fitnest-green hover:bg-gray-100">
          Login
        </Button>
      </Link>
      <Link href="/register">
        <Button className="bg-fitnest-green hover:bg-fitnest-green/90 text-white">Sign Up</Button>
      </Link>
    </div>
  )
}

// Export as both default and named export for compatibility
export default NavbarAuth
export { NavbarAuth }
