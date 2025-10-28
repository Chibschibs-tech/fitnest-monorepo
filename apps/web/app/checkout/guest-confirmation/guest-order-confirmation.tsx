"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowRight } from "lucide-react"

interface GuestInfo {
  name: string
  email: string
  phone: string
  address: string
  notes: string
}

interface MealPlanSelections {
  mealType: string
  mealsPerDay: string[]
  daysPerWeek: string[]
  paymentCycle: string
  totalPrice: number
}

export function GuestOrderConfirmation() {
  const [guestInfo, setGuestInfo] = useState<GuestInfo | null>(null)
  const [selections, setSelections] = useState<MealPlanSelections | null>(null)
  const [orderNumber, setOrderNumber] = useState<string>("GS" + Math.floor(100000 + Math.random() * 900000))

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedGuestInfo = localStorage.getItem("guestInfo")
      const storedSelections = localStorage.getItem("mealPlanSelections")

      if (storedGuestInfo) {
        setGuestInfo(JSON.parse(storedGuestInfo))
      }

      if (storedSelections) {
        setSelections(JSON.parse(storedSelections))
      }

      // Clear the cart after successful order
      // localStorage.removeItem("mealPlanSelections")
      // localStorage.removeItem("guestInfo")
    }
  }, [])

  if (!guestInfo || !selections) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Order Information Not Found</h1>
        <p className="mb-8">We couldn't find your order information. Please try placing your order again.</p>
        <Link href="/order">
          <Button className="bg-green-600 hover:bg-green-700">Return to Order Page</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold">Thank You for Your Order!</h1>
        <p className="text-gray-600 mt-2">Your order has been received and is being processed.</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Order Number:</span>
              <span>{orderNumber}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Order Date:</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Payment Method:</span>
              <span>Cash on Delivery</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Order Total:</span>
              <span className="font-bold">
                {selections.totalPrice} MAD/{selections.paymentCycle === "weekly" ? "week" : "month"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Delivery Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Name:</span> {guestInfo.name}
              </p>
              <p>
                <span className="font-medium">Email:</span> {guestInfo.email}
              </p>
              <p>
                <span className="font-medium">Phone:</span> {guestInfo.phone}
              </p>
              <p>
                <span className="font-medium">Address:</span> {guestInfo.address}
              </p>
              {guestInfo.notes && (
                <p>
                  <span className="font-medium">Notes:</span> {guestInfo.notes}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meal Plan Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Meal Type:</span>{" "}
                <span className="capitalize">{selections.mealType.replace("_", " ")}</span>
              </p>
              <p>
                <span className="font-medium">Meals Per Day:</span> {selections.mealsPerDay.length} (
                {selections.mealsPerDay.map((m) => m.charAt(0).toUpperCase() + m.slice(1)).join(", ")})
              </p>
              <p>
                <span className="font-medium">Days Per Week:</span> {selections.daysPerWeek.length}
              </p>
              <p>
                <span className="font-medium">Payment Cycle:</span>{" "}
                <span className="capitalize">{selections.paymentCycle}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center space-y-6">
        <p className="text-gray-600">
          We've sent a confirmation email to <span className="font-medium">{guestInfo.email}</span> with your order
          details.
        </p>

        <div className="inline-block border rounded-lg p-6 bg-gray-50">
          <h3 className="font-semibold text-lg mb-3">Create an Account</h3>
          <p className="text-gray-600 mb-4">Create an account to track your orders and manage your meal preferences.</p>
          <Link href={`/register?email=${encodeURIComponent(guestInfo.email)}`}>
            <Button className="bg-green-600 hover:bg-green-700">
              Create Account <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="pt-6">
          <Link href="/">
            <Button variant="outline">Return to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
