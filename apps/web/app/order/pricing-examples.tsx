"use client"

import { calculatePrice, type MealSelection } from "@/lib/pricing-model"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Example calculations to show how the pricing works
export function PricingExamples() {
  const examples: Array<{
    title: string
    selection: MealSelection
    seasonalCode?: string
  }> = [
    {
      title: "Budget Option - Stay Fit",
      selection: {
        planId: "stay-fit",
        mainMeals: 1,
        breakfast: true,
        snacks: 0,
        selectedDays: [
          new Date("2024-01-01"), // Monday
          new Date("2024-01-03"), // Wednesday
          new Date("2024-01-05"), // Friday
        ],
      },
    },
    {
      title: "Popular Option - Weight Loss",
      selection: {
        planId: "weight-loss",
        mainMeals: 2,
        breakfast: false,
        snacks: 1,
        selectedDays: [
          new Date("2024-01-01"), // Monday
          new Date("2024-01-02"), // Tuesday
          new Date("2024-01-03"), // Wednesday
          new Date("2024-01-04"), // Thursday
          new Date("2024-01-05"), // Friday
        ],
      },
    },
    {
      title: "Premium Option - Muscle Gain",
      selection: {
        planId: "muscle-gain",
        mainMeals: 2,
        breakfast: true,
        snacks: 2,
        selectedDays: Array.from({ length: 7 }, (_, i) => new Date(`2024-01-0${i + 1}`)),
      },
    },
    {
      title: "New Customer - Keto with Discount",
      selection: {
        planId: "keto",
        mainMeals: 2,
        breakfast: true,
        snacks: 1,
        selectedDays: Array.from({ length: 6 }, (_, i) => new Date(`2024-01-0${i + 1}`)),
      },
      seasonalCode: "new-customer",
    },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Pricing Examples</h2>

      <div className="grid gap-6 md:grid-cols-2">
        {examples.map((example, index) => {
          const pricing = calculatePrice(example.selection, example.seasonalCode)

          return (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{example.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm space-y-1">
                  <p>
                    <strong>Plan:</strong> {example.selection.planId}
                  </p>
                  <p>
                    <strong>Daily meals:</strong> {example.selection.mainMeals} main +{" "}
                    {example.selection.breakfast ? "1" : "0"} breakfast + {example.selection.snacks} snacks
                  </p>
                  <p>
                    <strong>Days per week:</strong> {example.selection.selectedDays.length}
                  </p>
                  <p>
                    <strong>Total items/week:</strong> {pricing.totalItems}
                  </p>
                </div>

                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Main meals:</span>
                    <span>{pricing.weeklyTotals.mainMealsTotal} MAD</span>
                  </div>
                  {pricing.weeklyTotals.breakfastTotal > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Breakfast:</span>
                      <span>{pricing.weeklyTotals.breakfastTotal} MAD</span>
                    </div>
                  )}
                  {pricing.weeklyTotals.snacksTotal > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Snacks:</span>
                      <span>{pricing.weeklyTotals.snacksTotal} MAD</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-medium border-t pt-2">
                    <span>Subtotal:</span>
                    <span>{pricing.weeklyTotals.subtotal} MAD</span>
                  </div>

                  {pricing.discounts.totalDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount:</span>
                      <span>-{pricing.discounts.totalDiscount.toFixed(2)} MAD</span>
                    </div>
                  )}

                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>{pricing.finalTotal} MAD</span>
                  </div>

                  <div className="text-sm text-gray-600">
                    <span>{pricing.pricePerDay} MAD per day</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
