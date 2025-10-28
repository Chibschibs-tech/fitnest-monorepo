"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"

interface MealPlanSelections {
  mealType: string
  mealsPerDay: string[]
  daysPerWeek: string[]
  paymentCycle: string
  totalPrice: number
}

interface CartItem {
  id: number
  product: {
    id: number
    name: string
    price: number
    salePrice?: number
  }
  quantity: number
}

export function UnifiedCheckoutContent() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartSubtotal, setCartSubtotal] = useState(0)
  const [cartLoading, setCartLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [mealPlanSelections, setMealPlanSelections] = useState<MealPlanSelections | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [notes, setNotes] = useState("")
  const [deliveryOption, setDeliveryOption] = useState("standard")
  const [acceptTerms, setAcceptTerms] = useState(false)

  // Form validation
  const [formErrors, setFormErrors] = useState({
    address: "",
    phone: "",
    terms: "",
  })

  useEffect(() => {
    // Fetch user data
    async function fetchUserData() {
      try {
        const res = await fetch("/api/auth/session")
        const data = await res.json()

        if (data.user) {
          setUser(data.user)
        }
      } catch (err) {
        console.error("Error fetching user data:", err)
      }
    }

    // Fetch cart data
    async function fetchCartData() {
      try {
        setCartLoading(true)
        const response = await fetch("/api/cart")
        if (response.ok) {
          const data = await response.json()
          setCartItems(data.items || [])
          setCartSubtotal(data.subtotal || 0)
        }
      } catch (err) {
        console.error("Error fetching cart data:", err)
      } finally {
        setCartLoading(false)
      }
    }

    fetchUserData()
    fetchCartData()

    // Get meal plan selections from localStorage if they exist
    if (typeof window !== "undefined") {
      const storedSelections = localStorage.getItem("mealPlanSelections")
      if (storedSelections) {
        try {
          setMealPlanSelections(JSON.parse(storedSelections))
        } catch (error) {
          console.error("Error parsing meal plan selections:", error)
        }
      }
    }

    setLoading(false)
  }, [])

  // Determine if we have a mixed cart (both meal plans and express items)
  const hasMealPlan = !!mealPlanSelections
  const hasExpressItems = cartItems.length > 0
  const hasMixedCart = hasMealPlan && hasExpressItems

  // Calculate total price
  const mealPlanTotal = mealPlanSelections?.totalPrice || 0
  const expressTotal = cartSubtotal
  const totalPrice = mealPlanTotal + expressTotal

  const validateForm = () => {
    const errors = {
      address: "",
      phone: "",
      terms: "",
    }

    let isValid = true

    if (!address.trim()) {
      errors.address = "Delivery address is required"
      isValid = false
    }

    if (!phone.trim()) {
      errors.phone = "Phone number is required"
      isValid = false
    } else if (!/^(\+212|0)[5-7]\d{8}$/.test(phone.trim())) {
      errors.phone = "Please enter a valid Moroccan phone number"
      isValid = false
    }

    if (!acceptTerms) {
      errors.terms = "You must accept the terms and conditions"
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      // In a real application, you would submit the order to your backend
      // For now, we'll simulate a successful order submission
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Store delivery information in localStorage for the confirmation page
      localStorage.setItem(
        "deliveryInfo",
        JSON.stringify({
          address,
          phone,
          notes,
          deliveryOption,
        }),
      )

      // Store order summary for confirmation page
      localStorage.setItem(
        "orderSummary",
        JSON.stringify({
          hasMealPlan,
          hasExpressItems,
          mealPlanTotal,
          expressTotal,
          totalPrice,
        }),
      )

      // Navigate to confirmation page
      router.push("/unified-checkout/confirmation")
    } catch (err) {
      console.error("Error submitting order:", err)
      setError("There was a problem processing your order. Please try again.")
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem processing your order. Please try again.",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || cartLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    )
  }

  // If no items in cart and no meal plan, redirect to home
  if (!hasExpressItems && !hasMealPlan) {
    router.push("/")
    return null
  }

  // Format meal type for display
  const formatMealType = (type: string) => {
    return type?.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Checkout</h1>
      <p className="text-gray-600 mb-8">Complete your order to start enjoying healthy, delicious meals</p>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="block text-sm font-medium mb-1">Name</Label>
                    <p className="p-2 bg-gray-50 rounded border">{user?.name || "Not available"}</p>
                  </div>
                  <div>
                    <Label className="block text-sm font-medium mb-1">Email</Label>
                    <p className="p-2 bg-gray-50 rounded border">{user?.email || "Not available"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address" className="block text-sm font-medium mb-1">
                    Delivery Address <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={`w-full p-2 border rounded-md ${formErrors.address ? "border-red-500" : ""}`}
                    rows={3}
                    placeholder="Enter your full delivery address"
                  />
                  {formErrors.address && <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>}
                </div>
                <div>
                  <Label htmlFor="phone" className="block text-sm font-medium mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full p-2 border rounded-md ${formErrors.phone ? "border-red-500" : ""}`}
                    placeholder="Enter your phone number (e.g., 0612345678)"
                  />
                  {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
                </div>
                <div>
                  <Label htmlFor="notes" className="block text-sm font-medium mb-1">
                    Delivery Notes (Optional)
                  </Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    rows={2}
                    placeholder="Any special instructions for delivery (e.g., building access, landmarks)"
                  />
                </div>

                {/* Delivery Options */}
                <div className="mt-4">
                  <Label className="block text-sm font-medium mb-3">Delivery Options</Label>
                  <RadioGroup value={deliveryOption} onValueChange={setDeliveryOption}>
                    <div className="flex items-start space-x-2 mb-3">
                      <RadioGroupItem value="standard" id="standard" />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="standard" className="font-medium">
                          Standard Delivery (Free)
                        </Label>
                        <p className="text-sm text-gray-500">
                          {hasMealPlan
                            ? "Meal plans delivered according to your subscription schedule"
                            : "Delivered within 2-3 business days"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="express" id="express" />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="express" className="font-medium">
                          Express Delivery (+20 MAD)
                        </Label>
                        <p className="text-sm text-gray-500">
                          {hasMixedCart
                            ? "Express items delivered same day, meal plans follow subscription schedule"
                            : "Same day delivery for orders placed before 2PM"}
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 border rounded-md bg-green-50 border-green-200">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <Label htmlFor="cash" className="font-medium">
                      Cash on Delivery
                    </Label>
                    <p className="text-sm text-gray-600">Pay in cash when your meals are delivered</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">More payment methods coming soon (Credit Card, Mobile Payment)</p>
              </div>
            </CardContent>
          </Card>

          {/* Terms and Conditions */}
          <div className="flex items-start space-x-2 py-4">
            <Checkbox
              id="terms"
              checked={acceptTerms}
              onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
              className={formErrors.terms ? "border-red-500" : ""}
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="terms"
                className={`text-sm font-medium leading-none ${formErrors.terms ? "text-red-500" : ""}`}
              >
                I accept the terms and conditions
              </Label>
              <p className="text-sm text-gray-500">
                By placing this order, you agree to our{" "}
                <a href="/terms" className="text-green-600 hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className="text-green-600 hover:underline">
                  Privacy Policy
                </a>
                .
              </p>
              {formErrors.terms && <p className="text-red-500 text-sm">{formErrors.terms}</p>}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="md:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Express Shop Items */}
                {hasExpressItems && (
                  <div>
                    <h3 className="font-medium mb-2">Express Shop Items</h3>
                    <ul className="space-y-2 mb-3">
                      {cartItems.map((item) => (
                        <li key={item.id} className="flex justify-between text-sm">
                          <span>
                            {item.product.name} x{item.quantity}
                          </span>
                          <span>{(item.product.salePrice || item.product.price) * item.quantity} MAD</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex justify-between text-sm font-medium">
                      <span>Express Subtotal:</span>
                      <span>{expressTotal} MAD</span>
                    </div>
                  </div>
                )}

                {/* Meal Plan */}
                {hasMealPlan && (
                  <div className={hasExpressItems ? "pt-3 border-t" : ""}>
                    <h3 className="font-medium mb-2">Meal Plan Subscription</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Meal type:</span>
                        <span className="capitalize">{formatMealType(mealPlanSelections.mealType)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Meals per day:</span>
                        <span>{mealPlanSelections.mealsPerDay.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Days per week:</span>
                        <span>{mealPlanSelections.daysPerWeek.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payment cycle:</span>
                        <span className="capitalize">{mealPlanSelections.paymentCycle}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Meal Plan Subtotal:</span>
                        <span>{mealPlanTotal} MAD</span>
                      </div>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Totals */}
                <div className="pt-2">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Subtotal:</span>
                    <span>{totalPrice} MAD</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Delivery fee:</span>
                    <span className="text-green-600">{deliveryOption === "express" ? "20 MAD" : "Free"}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total:</span>
                    <span>
                      {totalPrice + (deliveryOption === "express" ? 20 : 0)} MAD
                      {hasMealPlan && (
                        <span className="text-sm font-normal text-gray-500 block">
                          /{mealPlanSelections.paymentCycle === "weekly" ? "week" : "month"}
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-md font-medium mt-4"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </Button>

                <div className="text-center text-sm text-gray-500 mt-2">
                  {hasMealPlan && "You can modify or cancel your subscription anytime"}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
