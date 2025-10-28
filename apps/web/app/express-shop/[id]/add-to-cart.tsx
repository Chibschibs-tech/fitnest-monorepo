"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface AddToCartProps {
  productId: string | number
  stock: number
  name: string
}

export function AddToCart({ productId, stock, name }: AddToCartProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { status } = useSession()
  const router = useRouter()

  const handleAddToCart = async () => {
    if (status !== "authenticated") {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to add items to your cart",
      })
      router.push(`/login?callbackUrl=/express-shop/${productId}`)
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || `Failed to add item to cart (${response.status})`)
      }

      // Dispatch custom event to update cart count
      window.dispatchEvent(new CustomEvent("cart:updated"))

      toast({
        title: "Added to cart",
        description: `${name} has been added to your cart`,
      })
    } catch (error) {
      console.error("Error adding item to cart:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add item to cart. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      className="w-full bg-fitnest-green hover:bg-fitnest-green/90"
      onClick={handleAddToCart}
      disabled={loading || stock <= 0}
    >
      {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShoppingCart className="mr-2 h-5 w-5" />}
      {stock <= 0 ? "Out of Stock" : "Add to Cart"}
    </Button>
  )
}
