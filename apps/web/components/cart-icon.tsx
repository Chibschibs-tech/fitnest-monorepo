"use client"

import { useState, useEffect, useCallback } from "react"
import { ShoppingCart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export function CartIcon() {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchCartCount = useCallback(async () => {
    try {
      const response = await fetch("/api/cart/count", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })
      const data = await response.json()
      setCount(data.count || 0)
    } catch (error) {
      console.error("Error fetching cart count:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Initial fetch
    fetchCartCount()

    // Event-based updates (immediate)
    const handleCartUpdate = () => {
      fetchCartCount()
    }

    window.addEventListener("cart:updated", handleCartUpdate)
    window.addEventListener("cartModified", handleCartUpdate)

    // Polling fallback (every 3 seconds)
    const pollInterval = setInterval(() => {
      fetchCartCount()
    }, 3000)

    return () => {
      window.removeEventListener("cart:updated", handleCartUpdate)
      window.removeEventListener("cartModified", handleCartUpdate)
      clearInterval(pollInterval)
    }
  }, [fetchCartCount])

  return (
    <Link href="/cart" className="relative">
      <ShoppingCart className="h-6 w-6" />
      {!loading && count > 0 && (
        <Badge
          variant="destructive"
          className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
        >
          {count}
        </Badge>
      )}
    </Link>
  )
}
