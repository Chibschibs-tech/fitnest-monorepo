"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ShoppingCart, Plus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useSession } from "next-auth/react"

interface Product {
  id: number
  name: string
  description: string
  price: number
  salePrice?: number
  imageUrl?: string
  category: string
}

export function SimpleExpressShop() {
  const { data: session, status } = useSession()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addingToCart, setAddingToCart] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        // Use a simple fetch with error handling
        const response = await fetch("/api/products-simple")

        if (!response.ok) {
          throw new Error(`API returned status ${response.status}`)
        }

        const data = await response.json()

        if (!Array.isArray(data)) {
          throw new Error("API did not return an array of products")
        }

        setProducts(data)
        setError(null)
      } catch (err) {
        console.error("Error fetching products:", err)
        setError("Failed to load products. Please try again.")
        setProducts([]) // Set empty array to avoid undefined errors
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleAddToCart = async (productId: number) => {
    if (status !== "authenticated") {
      toast({
        title: "Authentication Required",
        description: "Please log in to add items to your cart",
        variant: "destructive",
      })
      return
    }

    setAddingToCart(productId)
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      })

      if (!response.ok) {
        throw new Error("Failed to add item to cart")
      }

      toast({
        title: "Success",
        description: "Item added to your cart",
      })

      // Update cart count
      window.dispatchEvent(new CustomEvent("cart:updated"))
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast({
        title: "Error",
        description: "Could not add item to cart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setAddingToCart(null)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-green-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <h2 className="mb-2 text-lg font-medium text-red-800">Error</h2>
          <p className="text-sm text-red-700">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold">Express Shop</h1>
        <p className="mx-auto max-w-2xl text-gray-600">
          Browse our selection of healthy snacks, protein bars, and more for quick delivery.
        </p>
      </div>

      {status !== "authenticated" && (
        <div className="mb-6 rounded-md border border-yellow-200 bg-yellow-50 p-4">
          <h2 className="mb-2 text-sm font-medium text-yellow-800">Authentication Required</h2>
          <p className="text-sm text-yellow-700">
            Please{" "}
            <Link href="/login?callbackUrl=/express-shop" className="font-medium underline">
              log in
            </Link>{" "}
            to add items to your cart.
          </p>
        </div>
      )}

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
          <ShoppingCart className="h-16 w-16 text-gray-400" />
          <h2 className="text-2xl font-semibold">No products available</h2>
          <p className="text-gray-500">Check back soon for our new product lineup!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <Link href={`/express-shop/${product.id}`}>
                <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ShoppingCart className="h-12 w-12 text-gray-300" />
                    </div>
                  )}
                </div>
              </Link>
              <CardHeader className="p-4 pb-0">
                <CardTitle className="line-clamp-1 text-lg">{product.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    {product.salePrice ? (
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-green-600">{product.salePrice} MAD</span>
                        <span className="text-sm text-gray-500 line-through">{product.price} MAD</span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold">{product.price} MAD</span>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button
                  className="w-full"
                  onClick={() => handleAddToCart(product.id)}
                  disabled={addingToCart === product.id || status !== "authenticated"}
                >
                  {addingToCart === product.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
