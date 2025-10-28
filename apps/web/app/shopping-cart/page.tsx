"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ShoppingCart, Trash2, AlertCircle, Plus, Minus, Bug } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface CartItem {
  id: number
  productId: number
  quantity: number
  product: {
    name: string
    description: string
    price: number
    salePrice?: number
    imageUrl?: string
    category: string
  }
}

export default function ShoppingCartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [subtotal, setSubtotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [updatingItem, setUpdatingItem] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      setLoading(true)

      // First, check direct authentication
      const authResponse = await fetch("/api/auth-direct")
      const authData = await authResponse.json()
      setDebugInfo(authData)

      console.log("Auth direct:", authData)

      // Use the direct cart API
      const response = await fetch("/api/cart-direct")
      const data = await response.json()

      console.log("Cart data:", data)

      if (data.error) {
        throw new Error(data.error)
      }

      setCartItems(data.items || [])
      setSubtotal(data.subtotal || 0)
    } catch (error) {
      console.error("Error loading cart:", error)
      setError(error instanceof Error ? error.message : "Failed to load cart. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (quantity < 1) return

    setUpdatingItem(itemId)
    try {
      const response = await fetch("/api/cart-direct", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId, quantity }),
      })

      if (!response.ok) {
        throw new Error("Failed to update cart")
      }

      await fetchCart()

      // Dispatch custom event to update cart count
      window.dispatchEvent(new CustomEvent("cart:updated"))
    } catch (error) {
      console.error("Error updating cart:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update cart. Please try again.",
      })
    } finally {
      setUpdatingItem(null)
    }
  }

  const removeItem = async (itemId: number) => {
    setUpdatingItem(itemId)
    try {
      const response = await fetch(`/api/cart-direct?id=${itemId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to remove item from cart")
      }

      await fetchCart()

      toast({
        title: "Item removed",
        description: "Item has been removed from your cart",
      })

      // Dispatch custom event to update cart count
      window.dispatchEvent(new CustomEvent("cart:updated"))
    } catch (error) {
      console.error("Error removing item from cart:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove item from cart. Please try again.",
      })
    } finally {
      setUpdatingItem(null)
    }
  }

  const clearCart = async () => {
    try {
      const response = await fetch(`/api/cart-direct?clearAll=true`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to clear cart")
      }

      await fetchCart()

      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart",
      })

      // Dispatch custom event to update cart count
      window.dispatchEvent(new CustomEvent("cart:updated"))
    } catch (error) {
      console.error("Error clearing cart:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to clear cart. Please try again.",
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-12">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-green-600" />
          <p className="mt-4 text-lg">Loading your cart...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        {debugInfo && (
          <div className="mb-6 rounded-md bg-gray-100 p-4">
            <h3 className="mb-2 flex items-center text-sm font-medium">
              <Bug className="mr-2 h-4 w-4" /> Debug Information
            </h3>
            <pre className="max-h-60 overflow-auto text-xs">{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}

        <div className="flex justify-center space-x-4">
          <Button onClick={fetchCart}>Try Again</Button>
          <Link href="/api/init-cart-table">
            <Button variant="outline">Initialize Cart Table</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold">Your Cart</h1>
          <p className="mx-auto max-w-2xl text-gray-600">Review the items in your cart before checkout.</p>
        </div>

        <div className="flex flex-col items-center justify-center space-y-6 rounded-lg border border-dashed p-12 text-center">
          <ShoppingCart className="h-16 w-16 text-gray-300" />
          <div>
            <h2 className="text-xl font-medium">Your cart is empty</h2>
            <p className="mt-2 text-gray-500">Looks like you haven't added any items to your cart yet.</p>
          </div>
          <Link href="/express-shop">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold">Your Cart</h1>
        <p className="mx-auto max-w-2xl text-gray-600">Review the items in your cart before checkout.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between p-6">
              <h2 className="text-xl font-semibold">Cart Items ({cartItems.length})</h2>
              <Button variant="outline" size="sm" onClick={clearCart}>
                <Trash2 className="mr-2 h-4 w-4" /> Clear Cart
              </Button>
            </div>

            <div className="divide-y">
              {cartItems.map((item) => (
                <div key={item.id} className="p-6">
                  <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0">
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border bg-gray-100 sm:h-32 sm:w-32">
                      {item.product.imageUrl ? (
                        <Image
                          src={item.product.imageUrl || "/placeholder.svg"}
                          alt={item.product.name}
                          width={128}
                          height={128}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ShoppingCart className="h-12 w-12 text-gray-300" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-lg font-medium">{item.product.name}</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Category: {item.product.category?.replace("_", " ") || "Unknown"}
                          </p>
                        </div>
                        <div className="text-right">
                          {item.product.salePrice ? (
                            <>
                              <p className="text-lg font-medium text-green-600">{item.product.salePrice} MAD</p>
                              <p className="text-sm text-gray-500 line-through">{item.product.price} MAD</p>
                            </>
                          ) : (
                            <p className="text-lg font-medium">{item.product.price} MAD</p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex flex-1 items-end justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center rounded-md border">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none border-r"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={updatingItem === item.id || item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-10 text-center text-sm">
                              {updatingItem === item.id ? (
                                <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                              ) : (
                                item.quantity
                              )}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none border-l"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={updatingItem === item.id}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:bg-red-50 hover:text-red-600"
                          onClick={() => removeItem(item.id)}
                          disabled={updatingItem === item.id}
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <Card className="sticky top-20">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{subtotal} MAD</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>

                <Separator />

                <div className="pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{subtotal} MAD</span>
                  </div>
                </div>

                <Link href="/unified-checkout" className="block">
                  <Button className="w-full">Proceed to Checkout</Button>
                </Link>

                <Link href="/express-shop" className="block">
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
