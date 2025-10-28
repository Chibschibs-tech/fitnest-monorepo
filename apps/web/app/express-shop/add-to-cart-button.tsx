"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface AddToCartButtonProps {
  productId: string
}

export function AddToCartButton({ productId }: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isAdded, setIsAdded] = useState(false)
  const router = useRouter()

  const handleAddToCart = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add to cart")
      }

      setIsAdded(true)
      setTimeout(() => setIsAdded(false), 2000)
      router.refresh()
    } catch (error) {
      console.error("Error adding to cart:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={isLoading || isAdded}
      className={`w-full rounded-md px-4 py-2 text-sm font-medium text-white transition-colors ${
        isAdded ? "bg-green-500 hover:bg-green-600" : "bg-green-600 hover:bg-green-700"
      } disabled:opacity-50`}
    >
      {isLoading ? "Adding..." : isAdded ? "Added to Cart ✓" : "Add to Cart"}
    </button>
  )
}
