"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { LoadingSpinner } from "@/components/loading-spinner"
import { CheckCircle, ShoppingBag, Calendar, Home } from "lucide-react"

interface OrderConfirmation {
  orderId: string
  orderData: {
    customer: {
      firstName: string
      lastName: string
      email: string
      phone: string
    }
    shipping: {
      address: string
      city: string
      postalCode: string
      notes: string
      deliveryOption: string
    }
    order: {
      cartItems: Array<{
        productId: number
        quantity: number
        price: number
      }>
      mealPlan: any
      cartSubtotal: number
      mealPlanTotal: number
      shipping: number
    }
  }
  timestamp: string
}

export function ConfirmationContent() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [confirmation, setConfirmation] = useState<OrderConfirmation | null>(null)

  useEffect(() => {
    // Get order confirmation from localStorage
    const storedConfirmation = localStorage.getItem("orderConfirmation")

    if (!storedConfirmation) {
      // If no confirmation data, redirect to home
      router.push("/")
      return
    }

    try {
      const parsedConfirmation = JSON.parse(storedConfirmation)
      setConfirmation(parsedConfirmation)
    } catch (error) {
      console.error("Error parsing order confirmation:", error)
      router.push("/")
    } finally {
      setIsLoading(false)
    }
  }, [router])

  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-MA", {
      style: "currency",
      currency: "MAD",
      minimumFractionDigits: 2,
    }).format(price)
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (!confirmation) {
    return null // This should not happen due to the redirect in useEffect
  }

  const { orderId, orderData, timestamp } = confirmation
  const { customer, shipping, order } = orderData

  const subtotal = order.cartSubtotal + order.mealPlanTotal
  const total = subtotal + order.shipping

  // Determine order type
  const hasMealPlan = !!order.mealPlan
  const hasExpressItems = order.cartItems && order.cartItems.length > 0
  const orderType =
    hasMealPlan && hasExpressItems ? "Mixed Order" : hasMealPlan ? "Meal Plan Subscription" : "Express Shop Order"

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h1 className="mb-2 text-3xl font-bold">Order Confirmed!</h1>
          <p className="text-gray-600">
            Thank you for your order. We've received your order and will begin processing it right away.
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Order #{orderId}</h2>
                <p className="text-sm text-gray-600">Placed on {formatDate(timestamp)}</p>
              </div>
              <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                Order Received
              </span>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <div className="mb-2 flex items-center">
                  <ShoppingBag className="mr-2 h-5 w-5 text-gray-600" />
                  <h3 className="font-medium">Order Details</h3>
                </div>
                <div className="rounded-md bg-gray-50 p-3">
                  <p className="mb-1 text-sm">
                    <span className="font-medium">Order Type:</span> {orderType}
                  </p>
                  <p className="mb-1 text-sm">
                    <span className="font-medium">Order Total:</span> {formatPrice(total)}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Payment Method:</span> Cash on Delivery
                  </p>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center">
                  <Home className="mr-2 h-5 w-5 text-gray-600" />
                  <h3 className="font-medium">Shipping Information</h3>
                </div>
                <div className="rounded-md bg-gray-50 p-3">
                  <p className="mb-1 text-sm">
                    <span className="font-medium">Name:</span> {customer.firstName} {customer.lastName}
                  </p>
                  <p className="mb-1 text-sm">
                    <span className="font-medium">Address:</span> {shipping.address}
                  </p>
                  <p className="mb-1 text-sm">
                    <span className="font-medium">City:</span> {shipping.city}, {shipping.postalCode}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Delivery:</span>{" "}
                    {shipping.deliveryOption === "express" ? "Express Delivery" : "Standard Delivery"}
                  </p>
                </div>
              </div>
            </div>

            {hasExpressItems && (
              <>
                <Separator className="my-4" />
                <div>
                  <h3 className="mb-3 font-medium">Express Shop Items</h3>
                  <div className="rounded-md bg-gray-50 p-3">
                    <div className="space-y-2">
                      {order.cartItems.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>
                            Product #{item.productId} x{item.quantity}
                          </span>
                          <span>{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {hasMealPlan && (
              <>
                <Separator className="my-4" />
                <div>
                  <div className="mb-2 flex items-center">
                    <Calendar className="mr-2 h-5 w-5 text-gray-600" />
                    <h3 className="font-medium">Meal Plan Subscription</h3>
                  </div>
                  <div className="rounded-md bg-gray-50 p-3">
                    <p className="mb-1 text-sm">
                      <span className="font-medium">Plan Type:</span>{" "}
                      {order.mealPlan.mealType.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </p>
                    <p className="mb-1 text-sm">
                      <span className="font-medium">Meals Per Day:</span> {order.mealPlan.mealsPerDay.length}
                    </p>
                    <p className="mb-1 text-sm">
                      <span className="font-medium">Days Per Week:</span> {order.mealPlan.daysPerWeek.length}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Payment Cycle:</span>{" "}
                      {order.mealPlan.paymentCycle.charAt(0).toUpperCase() + order.mealPlan.paymentCycle.slice(1)}
                    </p>
                  </div>
                </div>
              </>
            )}

            <Separator className="my-4" />

            <div>
              <h3 className="mb-3 font-medium">Order Summary</h3>
              <div className="space-y-2">
                {hasExpressItems && (
                  <div className="flex justify-between text-sm">
                    <span>Express Shop Subtotal:</span>
                    <span>{formatPrice(order.cartSubtotal)}</span>
                  </div>
                )}
                {hasMealPlan && (
                  <div className="flex justify-between text-sm">
                    <span>Meal Plan Subtotal:</span>
                    <span>{formatPrice(order.mealPlanTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Shipping:</span>
                  <span>{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-bold">
                  <span>Total:</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 flex flex-col items-center justify-center space-y-4 text-center">
          <p className="text-gray-600">
            A confirmation email has been sent to <span className="font-medium">{customer.email}</span>
          </p>
          <div className="space-x-4">
            <Link href="/dashboard">
              <Button variant="outline">View Your Orders</Button>
            </Link>
            <Link href="/">
              <Button className="bg-green-600 text-white hover:bg-green-700">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
