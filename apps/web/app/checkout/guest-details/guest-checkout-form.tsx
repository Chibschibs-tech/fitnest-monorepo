"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

interface MealPlanSelections {
  mealType: string
  mealsPerDay: string[]
  daysPerWeek: string[]
  paymentCycle: string
  totalPrice: number
}

export function GuestCheckoutForm() {
  const router = useRouter()
  const [selections, setSelections] = useState<MealPlanSelections | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  // Form state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    // Get selections from localStorage
    if (typeof window !== "undefined") {
      const storedSelections = localStorage.getItem("mealPlanSelections")
      if (!storedSelections) {
        // If no selections, redirect to order page
        router.push("/order")
        return
      }

      try {
        setSelections(JSON.parse(storedSelections))
      } catch (error) {
        console.error("Error parsing meal plan selections:", error)
        router.push("/order")
      }
    }

    setLoading(false)
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    // Save guest information to localStorage
    const guestInfo = {
      name,
      email,
      phone,
      address,
      notes,
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("guestInfo", JSON.stringify(guestInfo))
    }

    try {
      // Create a guest order
      const response = await fetch("/api/guest-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          guestInfo,
          mealPlan: selections,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to create order")
      }

      // Redirect to confirmation page
      router.push("/checkout/guest-confirmation")
    } catch (error) {
      console.error("Error creating guest order:", error)
      setError(error instanceof Error ? error.message : "An unexpected error occurred")
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    )
  }

  if (!selections) {
    return null // This should not happen due to the redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Guest Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Delivery Address</Label>
                    <Textarea
                      id="address"
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Delivery Notes (Optional)</Label>
                    <Textarea id="notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 border rounded-md bg-gray-50">
                    <input type="radio" id="cash" name="payment" defaultChecked />
                    <label htmlFor="cash" className="font-medium">
                      Cash on Delivery
                    </label>
                  </div>
                  <p className="text-sm text-gray-500">
                    More payment methods coming soon (Credit Card, Mobile Payment)
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="mt-8">
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 py-6 text-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Complete Order"
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Meal type:</span>
                    <span className="font-medium capitalize">{selections.mealType.replace("_", " ")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Meals per day:</span>
                    <span className="font-medium">{selections.mealsPerDay.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Days per week:</span>
                    <span className="font-medium">{selections.daysPerWeek.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Payment cycle:</span>
                    <span className="font-medium capitalize">{selections.paymentCycle}</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>
                      {selections.totalPrice} MAD/{selections.paymentCycle === "weekly" ? "week" : "month"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
