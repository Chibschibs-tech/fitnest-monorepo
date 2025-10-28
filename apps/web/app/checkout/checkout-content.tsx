"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useRouter } from "next/navigation"

interface CartItem {
  id: string
  productId: number
  quantity: number
  name: string
  price: number
  salePrice?: number
  imageUrl?: string
}

interface CartData {
  items: CartItem[]
  subtotal: number
  cartId: string
}

interface MealPlanData {
  planId: string
  planName: string
  planPrice: number
  duration: string
  mealsPerWeek: number
  customizations?: {
    dietaryRestrictions?: string[]
    allergies?: string[]
    preferences?: string[]
  }
  deliverySchedule?: {
    frequency: string
    preferredDay: string
    startDate: string
  }
}

export function CheckoutContent() {
  const [cart, setCart] = useState<CartData | null>(null)
  const [mealPlan, setMealPlan] = useState<MealPlanData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [differentBillingAddress, setDifferentBillingAddress] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    notes: "",
    deliveryOption: "standard",
    // Billing address fields
    billingFirstName: "",
    billingLastName: "",
    billingAddress: "",
    billingCity: "",
    billingPostalCode: "",
  })

  useEffect(() => {
    fetchCart()
    loadMealPlanData()
  }, [])

  const loadMealPlanData = () => {
    try {
      // Check multiple possible keys for meal plan data
      const possibleKeys = [
        "selectedMealPlan",
        "mealPlanCustomizations",
        "mealPlanDelivery",
        "mealPlan",
        "orderData",
        "checkoutData",
      ]

      console.log("=== CHECKING LOCALSTORAGE FOR MEAL PLAN DATA ===")

      for (const key of possibleKeys) {
        const data = localStorage.getItem(key)
        if (data) {
          console.log(`Found data in localStorage[${key}]:`, data)
        }
      }

      // Load meal plan data from localStorage
      const savedMealPlan = localStorage.getItem("selectedMealPlan")
      const savedCustomizations = localStorage.getItem("mealPlanCustomizations")
      const savedDeliverySchedule = localStorage.getItem("mealPlanDelivery")

      if (savedMealPlan) {
        const planData = JSON.parse(savedMealPlan)
        const customizations = savedCustomizations ? JSON.parse(savedCustomizations) : undefined
        const deliverySchedule = savedDeliverySchedule ? JSON.parse(savedDeliverySchedule) : undefined

        const mealPlanData: MealPlanData = {
          planId: planData.id || planData.planId,
          planName: planData.name || planData.planName,
          planPrice: planData.price || planData.planPrice || 0,
          duration: planData.duration || "4 weeks",
          mealsPerWeek: planData.mealsPerWeek || 7,
          customizations,
          deliverySchedule,
        }

        setMealPlan(mealPlanData)
        console.log("Loaded meal plan data:", mealPlanData)
      } else {
        console.log("No meal plan data found in localStorage")
      }
    } catch (error) {
      console.error("Error loading meal plan data:", error)
      // Don't set error state, just continue without meal plan
    }
  }

  const fetchCart = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/cart")

      if (!response.ok) {
        throw new Error(`Failed to load cart: ${response.status}`)
      }

      const data = await response.json()
      console.log("Cart data:", data)
      setCart(data)
    } catch (error) {
      console.error("Error fetching cart:", error)
      setError("Failed to load cart data")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleBillingToggle = (checked: boolean) => {
    setDifferentBillingAddress(checked)
    if (!checked) {
      // Copy delivery address to billing address
      setFormData((prev) => ({
        ...prev,
        billingFirstName: prev.firstName,
        billingLastName: prev.lastName,
        billingAddress: prev.address,
        billingCity: prev.city,
        billingPostalCode: prev.postalCode,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!cart || (cart.items.length === 0 && !mealPlan)) {
      setError("Your cart is empty and no meal plan selected")
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      // Prepare billing address - use delivery address if not different
      const billingAddress = differentBillingAddress
        ? {
            firstName: formData.billingFirstName,
            lastName: formData.billingLastName,
            address: formData.billingAddress,
            city: formData.billingCity,
            postalCode: formData.billingPostalCode,
          }
        : {
            firstName: formData.firstName,
            lastName: formData.lastName,
            address: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
          }

      const orderData = {
        customer: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
        },
        shipping: {
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          notes: formData.notes,
          deliveryOption: formData.deliveryOption,
        },
        billing: billingAddress,
        order: {
          cartItems:
            cart?.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.salePrice || item.price,
            })) || [],
          cartSubtotal: cart?.subtotal || 0,
          shipping: formData.deliveryOption === "express" ? 30 : 0,
          mealPlan: mealPlan, // Include meal plan data if exists
        },
      }

      console.log("=== SENDING ORDER DATA ===")
      console.log("Order data:", JSON.stringify(orderData, null, 2))

      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Order creation failed - Response text:", errorText)

        try {
          const errorData = JSON.parse(errorText)
          throw new Error(errorData.error || "Failed to create order")
        } catch (parseError) {
          throw new Error(`Server error: ${response.status} - ${errorText}`)
        }
      }

      const result = await response.json()
      console.log("Order created successfully:", result)

      // Clear the cart after successful order
      try {
        await fetch("/api/cart/clear", { method: "POST" })
        console.log("Cart cleared successfully")

        // Clear meal plan data from localStorage
        if (mealPlan) {
          localStorage.removeItem("selectedMealPlan")
          localStorage.removeItem("mealPlanCustomizations")
          localStorage.removeItem("mealPlanDelivery")
          console.log("Meal plan data cleared from localStorage")
        }

        // Dispatch cart update event to update the header icon
        window.dispatchEvent(new CustomEvent("cartUpdated"))
      } catch (clearError) {
        console.error("Error clearing cart:", clearError)
        // Don't fail the order if cart clearing fails
      }

      // Redirect to confirmation
      router.push(`/checkout/confirmation?orderId=${result.orderId}`)
    } catch (error) {
      console.error("Error submitting order:", error)
      setError(error instanceof Error ? error.message : "Failed to create order")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="mb-8 text-3xl font-bold">Checkout</h1>
        <div className="flex h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (error && !cart && !mealPlan) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="mb-8 text-3xl font-bold">Checkout</h1>
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchCart} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!cart && !mealPlan) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="mb-8 text-3xl font-bold">Checkout</h1>
        <Card>
          <CardContent className="p-6">
            <p>Your cart is empty and no meal plan selected.</p>
            <div className="mt-4 space-x-4">
              <Button onClick={() => router.push("/express-shop")}>Shop Products</Button>
              <Button onClick={() => router.push("/meal-plans")} variant="outline">
                Browse Meal Plans
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const cartSubtotal = cart?.subtotal || 0
  const mealPlanPrice = mealPlan?.planPrice || 0
  const shippingCost = formData.deliveryOption === "express" ? 30 : 0
  const total = cartSubtotal + mealPlanPrice + shippingCost

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium mb-1">
                      First Name *
                    </label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium mb-1">
                      Last Name *
                    </label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email *
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-1">
                    Phone *
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g., 0612345678"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium mb-1">
                    Address *
                  </label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your full delivery address"
                    required
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium mb-1">
                      City *
                    </label>
                    <Input id="city" name="city" value={formData.city} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium mb-1">
                      Postal Code *
                    </label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium mb-1">
                    Delivery Notes (Optional)
                  </label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Any special delivery instructions"
                    rows={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Billing Address */}
          <Card>
            <CardHeader>
              <CardTitle>Billing Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="differentBilling"
                    checked={differentBillingAddress}
                    onChange={(e) => handleBillingToggle(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="differentBilling" className="text-sm font-medium">
                    Use different billing address
                  </label>
                </div>

                {differentBillingAddress && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="billingFirstName" className="block text-sm font-medium mb-1">
                          First Name *
                        </label>
                        <Input
                          id="billingFirstName"
                          name="billingFirstName"
                          value={formData.billingFirstName}
                          onChange={handleInputChange}
                          required={differentBillingAddress}
                        />
                      </div>
                      <div>
                        <label htmlFor="billingLastName" className="block text-sm font-medium mb-1">
                          Last Name *
                        </label>
                        <Input
                          id="billingLastName"
                          name="billingLastName"
                          value={formData.billingLastName}
                          onChange={handleInputChange}
                          required={differentBillingAddress}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="billingAddress" className="block text-sm font-medium mb-1">
                        Billing Address *
                      </label>
                      <Textarea
                        id="billingAddress"
                        name="billingAddress"
                        value={formData.billingAddress}
                        onChange={handleInputChange}
                        placeholder="Enter your billing address"
                        required={differentBillingAddress}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="billingCity" className="block text-sm font-medium mb-1">
                          City *
                        </label>
                        <Input
                          id="billingCity"
                          name="billingCity"
                          value={formData.billingCity}
                          onChange={handleInputChange}
                          required={differentBillingAddress}
                        />
                      </div>
                      <div>
                        <label htmlFor="billingPostalCode" className="block text-sm font-medium mb-1">
                          Postal Code *
                        </label>
                        <Input
                          id="billingPostalCode"
                          name="billingPostalCode"
                          value={formData.billingPostalCode}
                          onChange={handleInputChange}
                          required={differentBillingAddress}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {!differentBillingAddress && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    Billing address will be the same as delivery address
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Options */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="deliveryOption"
                    value="standard"
                    checked={formData.deliveryOption === "standard"}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  Standard Delivery (Free) - 2-3 business days
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="deliveryOption"
                    value="express"
                    checked={formData.deliveryOption === "express"}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  Express Delivery (+30 MAD) - Same day
                </label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Meal Plan Section */}
                {mealPlan && (
                  <>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-green-800 mb-2">Meal Plan Subscription</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">{mealPlan.planName}</p>
                            <p className="text-sm text-gray-600">
                              {mealPlan.duration} • {mealPlan.mealsPerWeek} meals/week
                            </p>
                            {mealPlan.customizations && (
                              <div className="text-xs text-gray-500 mt-1">
                                {mealPlan.customizations.dietaryRestrictions &&
                                  `Diet: ${mealPlan.customizations.dietaryRestrictions.join(", ")}`}
                              </div>
                            )}
                          </div>
                          <p className="font-medium text-green-700">{mealPlan.planPrice.toFixed(2)} MAD</p>
                        </div>
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Cart Items Section */}
                {cart && cart.items.length > 0 && (
                  <>
                    <div>
                      <h3 className="font-semibold mb-2">Express Shop Items</h3>
                      {cart.items.map((item) => (
                        <div key={`${item.productId}-${item.id}`} className="flex justify-between mb-2">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-medium">
                            {((item.salePrice || item.price) * item.quantity).toFixed(2)} MAD
                          </p>
                        </div>
                      ))}
                    </div>
                    <Separator />
                  </>
                )}

                {/* Debug Info */}
                <div className="bg-gray-50 p-2 rounded text-xs">
                  <p>
                    Debug: Cart items: {cart?.items.length || 0}, Meal plan: {mealPlan ? "Yes" : "No"}
                  </p>
                </div>

                {/* Totals Section */}
                {cart && cart.items.length > 0 && (
                  <div className="flex justify-between">
                    <p>Express Shop Subtotal</p>
                    <p>{cartSubtotal.toFixed(2)} MAD</p>
                  </div>
                )}

                {mealPlan && (
                  <div className="flex justify-between">
                    <p>Meal Plan Subscription</p>
                    <p>{mealPlanPrice.toFixed(2)} MAD</p>
                  </div>
                )}

                <div className="flex justify-between">
                  <p>Shipping</p>
                  <p>{shippingCost === 0 ? "Free" : `${shippingCost.toFixed(2)} MAD`}</p>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <p>Total</p>
                  <p>{total.toFixed(2)} MAD</p>
                </div>

                <Button type="submit" className="w-full mt-6" disabled={submitting}>
                  {submitting ? "Processing..." : `Place Order (${total.toFixed(2)} MAD)`}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
