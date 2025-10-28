"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShoppingCart, Plus, Minus } from "lucide-react"
import { useRouter } from "next/navigation"

interface AddToCartFormProps {
  productId: number
}

export function AddToCartForm({ productId }: AddToCartFormProps) {
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleIncrement = () => {
    setQuantity((prev) => Math.min(prev + 1, 99))
  }

  const handleDecrement = () => {
    setQuantity((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsLoading(true)

      const response = await fetch("/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add item to cart")
      }

      // Refresh the page to update cart count
      router.refresh()

      // Optionally redirect to cart
      // router.push("/cart")
    } catch (error) {
      console.error("Error adding to cart:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <label htmlFor="quantity" className="mb-2 block text-sm font-medium">
          Quantity
        </label>
        <div className="flex w-32 items-center">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-r-none"
            onClick={handleDecrement}
            disabled={quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Math.min(99, Number(e.target.value))))}
            min="1"
            max="99"
            className="h-10 rounded-none border-x-0 text-center"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-l-none"
            onClick={handleIncrement}
            disabled={quantity >= 99}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
        <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700" disabled={isLoading}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          {isLoading ? "Adding..." : "Add to Cart"}
        </Button>
        <Button type="button" variant="outline" className="flex-1" onClick={() => router.push("/cart")}>
          View Cart
        </Button>
      </div>
    </form>
  )
}
