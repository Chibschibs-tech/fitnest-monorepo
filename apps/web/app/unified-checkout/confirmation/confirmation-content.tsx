"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ShoppingBag, Calendar, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface DeliveryInfo {
  address: string
  phone: string
  notes?: string
  deliveryOption: string
}

interface OrderSummary {
  hasMealPlan: boolean
  hasExpressItems: boolean
  mealPlanTotal: number
  expressTotal: number
  totalPrice: number
}

export function ConfirmationContent() {
  const router = useRouter()
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo | null>(null)
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get delivery info and order summary from localStorage
    if (typeof window !== "undefined") {
      const storedDeliveryInfo = localStorage.getItem("deliveryInfo")
      const storedOrderSummary = localStorage.getItem("orderSummary")

      if (!storedDeliveryInfo || !storedOrderSummary) {
        // If no delivery info or order summary, redirect to home
        router.push("/")
        return
      }

      try {
        setDeliveryInfo(JSON.parse(storedDeliveryInfo))
        setOrderSummary(JSON.parse(storedOrderSummary))
      } catch (error) {
        console.error("Error parsing stored data:", error)
        router.push("/")
      }
    }

    setLoading(false)
  }, [router])

  if (loading || !deliveryInfo || !orderSummary) {
    return null
  }

  const { hasMealPlan, hasExpressItems, mealPlanTotal, expressTotal, totalPrice } = orderSummary
  const deliveryFee = deliveryInfo.deliveryOption === "express" ? 20 : 0
  const orderTotal = totalPrice + deliveryFee

  // Generate a random order number
  const orderNumber = Math.floor(10000000 + Math.random() * 90000000)

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-gray-600">
          Thank you for your order. We've received your request and are processing it now.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Order Number</h3>
                <p className="font-medium">{orderNumber}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Order Date</h3>
                <p className="font-medium">{new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Delivery Address</h3>
              <p className="font-medium">{deliveryInfo.address}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                <p className="font-medium">{deliveryInfo.phone}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Delivery Option</h3>
                <p className="font-medium capitalize">
                  {deliveryInfo.deliveryOption === "express" ? "Express Delivery" : "Standard Delivery"}
                </p>
              </div>
            </div>

            {deliveryInfo.notes && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Delivery Notes</h3>
                <p className="text-gray-700">{deliveryInfo.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {hasExpressItems && (
              <div>
                <h3 className="font-medium mb-2">Express Shop Items</h3>
                <p className="text-gray-700 mb-1">Your express items will be delivered soon.</p>
                <div className="flex justify-between text-sm font-medium">
                  <span>Express Subtotal:</span>
                  <span>{expressTotal} MAD</span>
                </div>
              </div>
            )}

            {hasMealPlan && (
              <div className={hasExpressItems ? "pt-3 border-t" : ""}>
                <h3 className="font-medium mb-2">Meal Plan Subscription</h3>
                <p className="text-gray-700 mb-1">
                  Your meal plan subscription has been activated. First delivery will be scheduled soon.
                </p>
                <div className="flex justify-between text-sm font-medium">
                  <span>Meal Plan Subtotal:</span>
                  <span>{mealPlanTotal} MAD</span>
                </div>
              </div>
            )}

            <div className="pt-3 border-t">
              <div className="flex justify-between text-sm mb-1">
                <span>Subtotal:</span>
                <span>{totalPrice} MAD</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span>Delivery fee:</span>
                <span>{deliveryFee === 0 ? "Free" : `${deliveryFee} MAD`}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total:</span>
                <span>{orderTotal} MAD</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {hasExpressItems && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <ShoppingBag className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Express Delivery</h3>
                  <p className="text-sm text-gray-600">
                    {deliveryInfo.deliveryOption === "express"
                      ? "Your items will be delivered today or tomorrow."
                      : "Your items will be delivered within 2-3 business days."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {hasMealPlan && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Meal Plan Schedule</h3>
                  <p className="text-sm text-gray-600">
                    Your meal plan deliveries will begin next week. Check your dashboard for the schedule.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="text-center space-y-4">
        <p className="text-gray-600">A confirmation email has been sent to your email address with all the details.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/dashboard">
            <Button variant="default" className="w-full sm:w-auto">
              Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto">
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
