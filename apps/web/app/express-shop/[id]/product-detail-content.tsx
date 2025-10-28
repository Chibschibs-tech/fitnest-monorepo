"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, ShoppingCart, Plus, Minus, ArrowLeft } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Product {
  id: number
  name: string
  description: string
  price: number
  salePrice?: number
  imageUrl?: string
  category: string
  tags?: string
  nutritionalInfo?: any
  stock: number
}

interface ProductDetailContentProps {
  product: Product
}

export function ProductDetailContent({ product }: ProductDetailContentProps) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const { toast } = useToast()

  const handleQuantityChange = (change: number) => {
    setQuantity(Math.max(1, quantity + change))
  }

  const handleAddToCart = async () => {
    if (status !== "authenticated") {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to add items to your cart",
      })
      router.push(`/login?callbackUrl=/express-shop/${product.id}`)
      return
    }

    setIsAddingToCart(true)
    try {
      // Use the main cart API
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId: product.id, quantity }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || `Failed to add item to cart (${response.status})`)
      }

      const data = await response.json()
      console.log("Added to cart:", data)

      // Dispatch custom event to update cart count
      window.dispatchEvent(new CustomEvent("cart:updated"))

      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart`,
      })
    } catch (error) {
      console.error("Error adding item to cart:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add item to cart. Please try again.",
      })
    } finally {
      setIsAddingToCart(false)
    }
  }

  // Parse nutritional info if available
  const nutritionalInfo = product.nutritionalInfo ? product.nutritionalInfo : null

  return (
    <div className="container mx-auto px-4 py-12">
      <Button variant="ghost" className="mb-6 flex items-center text-gray-600" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Shop
      </Button>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ShoppingCart className="h-24 w-24 text-gray-300" />
            </div>
          )}
          {product.salePrice && (
            <Badge className="absolute right-4 top-4 bg-fitnest-green px-3 py-1 text-base">Sale</Badge>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <Badge variant="outline" className="mt-2">
              {product.category.replace("_", " ")}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              {product.salePrice ? (
                <>
                  <span className="text-2xl font-bold text-fitnest-green">{product.salePrice} MAD</span>
                  <span className="text-lg text-gray-500 line-through">{product.price} MAD</span>
                </>
              ) : (
                <span className="text-2xl font-bold">{product.price} MAD</span>
              )}
            </div>
            <p className="text-sm text-gray-500">{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</p>
          </div>

          <div>
            <h3 className="mb-2 text-lg font-medium">Description</h3>
            <p className="text-gray-700">{product.description}</p>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Quantity</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center rounded-md border">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-none"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center text-lg">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-none"
                  onClick={() => handleQuantityChange(1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            className="w-full bg-fitnest-green hover:bg-fitnest-green/90 py-6 text-lg"
            onClick={handleAddToCart}
            disabled={isAddingToCart || product.stock <= 0 || status !== "authenticated"}
          >
            {isAddingToCart ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <ShoppingCart className="mr-2 h-5 w-5" />
            )}
            {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
          </Button>

          {status !== "authenticated" && (
            <Alert>
              <AlertTitle>Authentication Required</AlertTitle>
              <AlertDescription>
                Please{" "}
                <Link href={`/login?callbackUrl=/express-shop/${product.id}`} className="font-medium underline">
                  log in
                </Link>{" "}
                to add items to your cart.
              </AlertDescription>
            </Alert>
          )}

          {/* Nutritional Information */}
          {nutritionalInfo && (
            <div className="mt-8 rounded-lg border p-4">
              <h3 className="mb-4 text-lg font-medium">Nutritional Information</h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-md bg-gray-50 p-3 text-center">
                  <p className="text-sm text-gray-500">Calories</p>
                  <p className="text-lg font-bold">{nutritionalInfo.calories || "N/A"}</p>
                </div>
                <div className="rounded-md bg-gray-50 p-3 text-center">
                  <p className="text-sm text-gray-500">Protein</p>
                  <p className="text-lg font-bold">{nutritionalInfo.protein || "N/A"}g</p>
                </div>
                <div className="rounded-md bg-gray-50 p-3 text-center">
                  <p className="text-sm text-gray-500">Carbs</p>
                  <p className="text-lg font-bold">{nutritionalInfo.carbs || "N/A"}g</p>
                </div>
                <div className="rounded-md bg-gray-50 p-3 text-center">
                  <p className="text-sm text-gray-500">Fat</p>
                  <p className="text-lg font-bold">{nutritionalInfo.fat || "N/A"}g</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
