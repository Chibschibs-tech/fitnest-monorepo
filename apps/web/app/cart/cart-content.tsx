"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Trash2, Minus, Plus, Calendar, Utensils } from "lucide-react"

interface CartItemProduct {
  id: number
  item_type: 'product'
  product_id: number
  product_name: string
  product_image: string | null
  quantity: number
  unit_price: number
  total_price: number
}

interface CartItemSubscription {
  id: number
  item_type: 'subscription'
  plan_name: string
  meal_types: string[]
  days_per_week: number
  duration_weeks: number
  quantity: number
  unit_price: number
  total_price: number
}

type CartItem = CartItemProduct | CartItemSubscription

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
  const [isRemoving, setIsRemoving] = useState<Record<number, boolean>>({})
  const [isUpdating, setIsUpdating] = useState<Record<number, boolean>>({})
  const router = useRouter()

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-MA", {
      style: "currency",
      currency: "MAD",
      minimumFractionDigits: 2,
    }).format(price)
  }

  const handleRemoveItem = async (itemId: number) => {
    setIsRemoving({ ...isRemoving, [itemId]: true })

    try {
      const response = await fetch(`/api/cart?id=${itemId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Remove failed:", errorData)
        throw new Error("Failed to remove item")
      }

      router.refresh()
    } catch (error) {
      console.error("Error removing item:", error)
      alert("Failed to remove item. Please try again.")
    } finally {
      setIsRemoving({ ...isRemoving, [itemId]: false })
    }
  }

  const handleUpdateQuantity = async (itemId: number, quantity: number) => {
    if (quantity < 1) return

    setIsUpdating({ ...isUpdating, [itemId]: true })

    try {
      const response = await fetch("/api/cart", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ item_id: itemId, quantity }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Update failed:", errorData)
        throw new Error("Failed to update quantity")
      }

      router.refresh()
    } catch (error) {
      console.error("Error updating quantity:", error)
      alert("Failed to update quantity. Please try again.")
    } finally {
      setIsUpdating({ ...isUpdating, [itemId]: false })
    }
  }

  const renderProductItem = (item: CartItemProduct) => (
    <div key={item.id} className="flex p-4">
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
        {item.product_image ? (
          <Image
            src={item.product_image || "/placeholder.svg"}
            alt={item.product_name}
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
            <Link href={`/express-shop/${item.product_id}`} className="hover:text-fitnest-green">
              <h3 className="text-lg font-medium">{item.product_name}</h3>
            </Link>
            <button
              onClick={() => handleRemoveItem(item.id)}
              disabled={isRemoving[item.id]}
              className="text-gray-400 hover:text-red-500 disabled:opacity-50"
            >
              <Trash2 size={18} />
            </button>
          </div>
          <div className="mt-1">
            <span className="font-medium">{formatPrice(item.unit_price)}</span>
            <span className="ml-2 text-sm text-gray-500">each</span>
          </div>
        </div>

        <div className="mt-2 flex items-center">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
              disabled={isUpdating[item.id] || item.quantity <= 1}
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
                  handleUpdateQuantity(item.id, value)
                }
              }}
              className="w-12 border-y border-gray-300 bg-white py-1 text-center text-gray-900 focus:outline-none"
              min="1"
            />
            <button
              type="button"
              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
              disabled={isUpdating[item.id]}
              className="rounded-r-md border border-gray-300 bg-gray-50 px-2 py-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="ml-auto font-medium">
            {formatPrice(item.total_price)}
          </div>
        </div>
      </div>
    </div>
  )

  const renderSubscriptionItem = (item: CartItemSubscription) => (
    <div key={item.id} className="flex p-4 border-l-4 border-fitnest-green">
      <div className="flex-shrink-0 mr-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-md bg-fitnest-green/10">
          <Calendar className="h-8 w-8 text-fitnest-green" />
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <div>
          <div className="flex justify-between">
            <div>
              <h3 className="text-lg font-medium">{item.plan_name} Plan</h3>
              <div className="mt-1 flex flex-wrap gap-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Utensils size={14} />
                  {item.meal_types.join(", ")}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {item.days_per_week} days/week × {item.duration_weeks} weeks
                </span>
              </div>
            </div>
            <button
              onClick={() => handleRemoveItem(item.id)}
              disabled={isRemoving[item.id]}
              className="text-gray-400 hover:text-red-500 disabled:opacity-50"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm text-gray-500">Subscription</span>
          <div className="font-medium text-lg">
            {formatPrice(item.total_price)}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Your Cart</h1>

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center space-y-4 rounded-lg bg-gray-50 p-12 text-center">
          <h2 className="text-xl font-medium">Your cart is empty</h2>
          <p className="text-gray-600">Add some products or meal plans to your cart to see them here.</p>
          <div className="mt-4 flex gap-4">
            <Link
              href="/express-shop"
              className="rounded-md bg-fitnest-green px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
            >
              Browse Express Shop
            </Link>
            <Link
              href="/meal-plans"
              className="rounded-md border border-fitnest-green px-4 py-2 text-sm font-medium text-fitnest-green hover:bg-fitnest-green/10"
            >
              View Meal Plans
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-gray-200">
              <div className="divide-y divide-gray-200">
                {cartItems.map((item) => 
                  item.item_type === 'product' 
                    ? renderProductItem(item) 
                    : renderSubscriptionItem(item)
                )}
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

              <div className="mt-2 flex gap-2">
                <Link
                  href="/express-shop"
                  className="flex-1 text-center text-sm text-gray-600 hover:text-fitnest-green"
                >
                  Continue Shopping
                </Link>
                <span className="text-gray-300">|</span>
                <Link
                  href="/meal-plans"
                  className="flex-1 text-center text-sm text-gray-600 hover:text-fitnest-green"
                >
                  View Plans
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
