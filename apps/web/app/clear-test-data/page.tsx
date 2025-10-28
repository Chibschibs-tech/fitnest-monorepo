"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ClearTestDataPage() {
  const [isClient, setIsClient] = useState(false)
  const [cleared, setCleared] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const clearTestData = () => {
    if (typeof window === "undefined") return

    // Clear all test meal plan data
    localStorage.removeItem("selectedMealPlan")
    localStorage.removeItem("mealPlanCustomizations")
    localStorage.removeItem("mealPlanDelivery")

    // Also clear any other potential meal plan keys
    localStorage.removeItem("mealPlan")
    localStorage.removeItem("orderData")
    localStorage.removeItem("checkoutData")

    setCleared(true)
    console.log("Cleared all test meal plan data")
  }

  if (!isClient) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Clear Test Data</h1>

      <Card>
        <CardHeader>
          <CardTitle>Clear Old Test Meal Plan Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!cleared ? (
            <>
              <p className="text-gray-600">
                This will clear any old test meal plan data from localStorage that might be interfering with the real
                meal plan flow.
              </p>
              <Button onClick={clearTestData} className="w-full">
                Clear Test Data
              </Button>
            </>
          ) : (
            <>
              <p className="text-green-600">✅ Test data cleared successfully!</p>
              <Button onClick={() => (window.location.href = "/meal-plans")} className="w-full">
                Go to Meal Plans
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
