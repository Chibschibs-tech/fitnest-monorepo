"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check } from "lucide-react"
import { useSession } from "next-auth/react"

export function OrderContent() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [mealType, setMealType] = useState<string>("weight_loss")
  const [mealsPerDay, setMealsPerDay] = useState<string[]>(["lunch", "dinner"])
  const [daysPerWeek, setDaysPerWeek] = useState<string[]>(["mon", "tue", "wed", "thu", "fri"])
  const [paymentCycle, setPaymentCycle] = useState<string>("weekly")
  const [totalPrice, setTotalPrice] = useState<number>(0)

  // Calculate price based on selections
  useEffect(() => {
    const basePrice =
      mealType === "weight_loss" ? 70 : mealType === "balanced" ? 80 : mealType === "muscle_gain" ? 90 : 85
    const mealMultiplier = mealsPerDay.length
    const dayMultiplier = daysPerWeek.length
    const cycleMultiplier = paymentCycle === "monthly" ? 3.6 : 1

    const calculatedPrice = Math.round(((basePrice * mealMultiplier * dayMultiplier) / 5) * cycleMultiplier)
    setTotalPrice(calculatedPrice)
  }, [mealType, mealsPerDay, daysPerWeek, paymentCycle])

  const handleMealTypeChange = (type: string) => {
    setMealType(type)
  }

  const toggleMealTime = (meal: string) => {
    if (mealsPerDay.includes(meal)) {
      // Don't allow removing if it would result in less than 2 meals
      if (mealsPerDay.length > 2) {
        setMealsPerDay(mealsPerDay.filter((m) => m !== meal))
      }
    } else {
      setMealsPerDay([...mealsPerDay, meal])
    }
  }

  const toggleDay = (day: string) => {
    if (daysPerWeek.includes(day)) {
      // Don't allow removing if it would result in less than 5 days
      if (daysPerWeek.length > 5) {
        setDaysPerWeek(daysPerWeek.filter((d) => d !== day))
      }
    } else {
      setDaysPerWeek([...daysPerWeek, day])
    }
  }

  const handleContinue = () => {
    // Save selections to localStorage
    const selections = {
      mealType,
      mealsPerDay,
      daysPerWeek,
      paymentCycle,
      totalPrice,
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("mealPlanSelections", JSON.stringify(selections))
    }

    // If user is not logged in, give them options to login or continue as guest
    if (status !== "authenticated") {
      router.push("/checkout/guest")
    } else {
      // User is logged in, proceed directly to checkout
      router.push("/checkout")
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 md:px-6 max-w-6xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-12">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Customize Your Perfect Meal Plan</h1>
            <p className="text-gray-600">Design your ideal meal plan in a few simple steps</p>
          </div>

          {/* Meal Type Selection */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">What kind of meals do you prefer?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card
                className={`cursor-pointer transition-all ${mealType === "weight_loss" ? "border-green-500 bg-green-50" : "hover:border-gray-300"}`}
                onClick={() => handleMealTypeChange("weight_loss")}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">Weight Loss</h3>
                      <p className="text-gray-600 text-sm mt-1">1200-1500 calories per day</p>
                      <ul className="mt-3 space-y-1">
                        <li className="text-sm flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          High protein, low carb
                        </li>
                        <li className="text-sm flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          Calorie-controlled portions
                        </li>
                      </ul>
                    </div>
                    {mealType === "weight_loss" && (
                      <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${mealType === "balanced" ? "border-green-500 bg-green-50" : "hover:border-gray-300"}`}
                onClick={() => handleMealTypeChange("balanced")}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">Balanced Nutrition</h3>
                      <p className="text-gray-600 text-sm mt-1">1800-2000 calories per day</p>
                      <ul className="mt-3 space-y-1">
                        <li className="text-sm flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          Balanced macronutrients
                        </li>
                        <li className="text-sm flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          Variety of ingredients
                        </li>
                      </ul>
                    </div>
                    {mealType === "balanced" && (
                      <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${mealType === "muscle_gain" ? "border-green-500 bg-green-50" : "hover:border-gray-300"}`}
                onClick={() => handleMealTypeChange("muscle_gain")}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">Muscle Gain</h3>
                      <p className="text-gray-600 text-sm mt-1">2500-2800 calories per day</p>
                      <ul className="mt-3 space-y-1">
                        <li className="text-sm flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          High protein content
                        </li>
                        <li className="text-sm flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          Complex carbohydrates
                        </li>
                      </ul>
                    </div>
                    {mealType === "muscle_gain" && (
                      <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${mealType === "keto" ? "border-green-500 bg-green-50" : "hover:border-gray-300"}`}
                onClick={() => handleMealTypeChange("keto")}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">Keto</h3>
                      <p className="text-gray-600 text-sm mt-1">1600-1800 calories per day</p>
                      <ul className="mt-3 space-y-1">
                        <li className="text-sm flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          Low carb, high fat
                        </li>
                        <li className="text-sm flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          Moderate protein
                        </li>
                      </ul>
                    </div>
                    {mealType === "keto" && (
                      <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Meals Per Day */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">How many meals per day?</h2>
            <p className="text-gray-600">Select a minimum of 2 meals, including lunch or dinner.</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card
                className={`cursor-pointer transition-all ${mealsPerDay.includes("breakfast") ? "border-green-500 bg-green-50" : "hover:border-gray-300"}`}
                onClick={() => toggleMealTime("breakfast")}
              >
                <CardContent className="p-6 flex justify-between items-center">
                  <span className="font-medium">Breakfast</span>
                  {mealsPerDay.includes("breakfast") && (
                    <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${mealsPerDay.includes("lunch") ? "border-green-500 bg-green-50" : "hover:border-gray-300"}`}
                onClick={() => toggleMealTime("lunch")}
              >
                <CardContent className="p-6 flex justify-between items-center">
                  <span className="font-medium">Lunch</span>
                  {mealsPerDay.includes("lunch") && (
                    <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${mealsPerDay.includes("dinner") ? "border-green-500 bg-green-50" : "hover:border-gray-300"}`}
                onClick={() => toggleMealTime("dinner")}
              >
                <CardContent className="p-6 flex justify-between items-center">
                  <span className="font-medium">Dinner</span>
                  {mealsPerDay.includes("dinner") && (
                    <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${mealsPerDay.includes("snack") ? "border-green-500 bg-green-50" : "hover:border-gray-300"}`}
                onClick={() => toggleMealTime("snack")}
              >
                <CardContent className="p-6 flex justify-between items-center">
                  <span className="font-medium">Snack</span>
                  {mealsPerDay.includes("snack") && (
                    <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Days Per Week */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">How many days a week are you eating Fitnest?</h2>
            <p className="text-gray-600">Select a minimum of 5 days</p>

            <div className="flex flex-wrap gap-3">
              {[
                { key: "sun", label: "S" },
                { key: "mon", label: "M" },
                { key: "tue", label: "T" },
                { key: "wed", label: "W" },
                { key: "thu", label: "T" },
                { key: "fri", label: "F" },
                { key: "sat", label: "S" },
              ].map((day) => (
                <button
                  key={day.key}
                  onClick={() => toggleDay(day.key)}
                  className={`h-12 w-12 rounded-full flex items-center justify-center font-medium transition-all
                    ${
                      daysPerWeek.includes(day.key)
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Cycle */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Payment Cycle</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card
                className={`cursor-pointer transition-all ${paymentCycle === "weekly" ? "border-green-500 bg-green-50" : "hover:border-gray-300"}`}
                onClick={() => setPaymentCycle("weekly")}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">Weekly</h3>
                      <p className="text-gray-600 text-sm mt-1">Pay week by week</p>
                    </div>
                    {paymentCycle === "weekly" && (
                      <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${paymentCycle === "monthly" ? "border-green-500 bg-green-50" : "hover:border-gray-300"}`}
                onClick={() => setPaymentCycle("monthly")}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">Monthly</h3>
                      <p className="text-gray-600 text-sm mt-1">Save 10% with monthly billing</p>
                    </div>
                    {paymentCycle === "monthly" && (
                      <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="md:col-span-1">
          <div className="sticky top-20 bg-white rounded-lg border p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Your package awaits</h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Starting from</span>
                <span className="font-semibold text-xl">{totalPrice} MAD</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Meal type:</span>
                  <span className="font-medium capitalize">{mealType.replace("_", " ")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Meals per day:</span>
                  <span className="font-medium">{mealsPerDay.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Days per week:</span>
                  <span className="font-medium">{daysPerWeek.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Payment cycle:</span>
                  <span className="font-medium capitalize">{paymentCycle}</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>
                    {totalPrice} MAD/{paymentCycle === "weekly" ? "week" : "month"}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleContinue}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-md font-medium"
              >
                {status === "authenticated" ? "Checkout" : "Continue to Checkout"}
              </Button>

              <p className="text-xs text-gray-500 text-center">No commitment. Cancel or pause anytime.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
