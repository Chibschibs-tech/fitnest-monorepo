"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Trash2, Minus, Plus } from "lucide-react"

interface CartItem {
  id: number
  productId: string
  quantity: number
  name: string
  price: number
  salePrice: number | null
  imageUrl: string | null
}

interface CartSummary {
  subtotal: number
  discount: number
  total: number
}

interface CartContentProps {
  cartItems: CartItem[]
  summary: CartSummary
}

export function CartContent({ cartItems, summary }: CartContentProps) {
  const [isRemoving, setIsRemoving] = useState<Record<string, boolean>>({})
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({})
  const router = useRouter()

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-MA", {
      style: "currency",
      currency: "MAD",
      minimumFractionDigits: 2,
    }).format(price)
  }

  const handleRemoveItem = async (productId: string) => {
    setIsRemoving({ ...isRemoving, [productId]: true })
    console.log("Removing product:", productId)

    try {
      const response = await fetch(`/api/cart?id=${productId}`, {
        method: "DELETE",
      })

      console.log("Remove response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Remove failed:", errorData)
        throw new Error("Failed to remove item")
      }

      router.refresh()
    } catch (error) {
      console.error("Error removing item:", error)
    } finally {
      setIsRemoving({ ...isRemoving, [productId]: false })
    }
  }

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) return

    setIsUpdating({ ...isUpdating, [productId]: true })
    console.log("Updating quantity to:", quantity, "for product:", productId)

    try {
      const response = await fetch("/api/cart", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, quantity }),
      })

      console.log("Update response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Update failed:", errorData)
        throw new Error("Failed to update quantity")
      }

      router.refresh()
    } catch (error) {
      console.error("Error updating quantity:", error)
    } finally {
      setIsUpdating({ ...isUpdating, [productId]: false })
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Your Cart</h1>

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center space-y-4 rounded-lg bg-gray-50 p-12 text-center">
          <h2 className="text-xl font-medium">Your cart is empty</h2>
          <p className="text-gray-600">Add some products to your cart to see them here.</p>
          <Link
            href="/express-shop"
            className="mt-4 rounded-md bg-fitnest-green px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-gray-200">
              <div className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex p-4">
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <span className="text-xs text-gray-400">No image</span>
                        </div>
                      )}
                    </div>

                    <div className="ml-4 flex flex-1 flex-col">
                      <div>
                        <div className="flex justify-between">
                          <Link href={`/express-shop/${item.productId}`} className="hover:text-fitnest-green">
                            <h3 className="text-lg font-medium">{item.name}</h3>
                          </Link>
                          <button
                            onClick={() => handleRemoveItem(item.productId)}
                            disabled={isRemoving[item.productId]}
                            className="text-gray-400 hover:text-red-500 disabled:opacity-50"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        <div className="mt-1">
                          {item.salePrice ? (
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-fitnest-green">{formatPrice(item.salePrice)}</span>
                              <span className="text-sm text-gray-500 line-through">{formatPrice(item.price)}</span>
                            </div>
                          ) : (
                            <span className="font-medium">{formatPrice(item.price)}</span>
                          )}
                        </div>
                      </div>

                      <div className="mt-2 flex items-center">
                        <div className="flex items-center">
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                            disabled={isUpdating[item.productId] || item.quantity <= 1}
                            className="rounded-l-md border border-gray-300 bg-gray-50 px-2 py-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                          >
                            <Minus size={16} />
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const value = Number.parseInt(e.target.value)
                              if (!isNaN(value) && value >= 1) {
                                handleUpdateQuantity(item.productId, value)
                              }
                            }}
                            className="w-12 border-y border-gray-300 bg-white py-1 text-center text-gray-900 focus:outline-none"
                            min="1"
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                            disabled={isUpdating[item.productId]}
                            className="rounded-r-md border border-gray-300 bg-gray-50 px-2 py-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <div className="ml-auto font-medium">
                          {formatPrice((item.salePrice || item.price) * item.quantity)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="rounded-lg border border-gray-200 p-6">
              <h2 className="mb-4 text-lg font-medium">Order Summary</h2>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatPrice(summary.subtotal)}</span>
                </div>

                {summary.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount</span>
                    <span className="text-fitnest-green">-{formatPrice(summary.discount)}</span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>{formatPrice(summary.total)}</span>
                  </div>
                </div>
              </div>

              <Link
                href="/checkout"
                className="mt-6 block w-full rounded-md bg-fitnest-green px-4 py-2 text-center text-sm font-medium text-white hover:bg-opacity-90"
              >
                Proceed to Checkout
              </Link>

              <Link
                href="/express-shop"
                className="mt-2 block w-full text-center text-sm text-gray-600 hover:text-fitnest-green"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
