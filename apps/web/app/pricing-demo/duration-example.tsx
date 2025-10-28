"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { calculatePrice, type MealSelection, getSubscriptionDurationOptions } from "@/lib/pricing-model"

export default function DurationPricingDemo() {
  const [selectedWeeks, setSelectedWeeks] = useState(1)

  // Fixed customer selection: Muscle Gain, 2 main + breakfast + 1 snack, 3 days
  const baseSelection: Omit<MealSelection, "subscriptionWeeks"> = {
    planId: "muscle-gain",
    mainMeals: 2,
    breakfast: true,
    snacks: 1,
    selectedDays: Array.from({ length: 3 }, (_, i) => new Date(`2024-01-0${i + 1}`)), // 3 days
  }

  const createSelection = (weeks: number): MealSelection => ({
    ...baseSelection,
    subscriptionWeeks: weeks,
  })

  const durationOptions = getSubscriptionDurationOptions()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Subscription Duration Pricing</h1>
          <p className="text-gray-600">Muscle Gain Plan: 2 Main Meals + Breakfast + 1 Snack × 3 days per week</p>
        </div>

        {/* Duration Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Subscription Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {durationOptions.map((option) => (
                <div key={option.weeks} className="relative">
                  <Button
                    variant={selectedWeeks === option.weeks ? "default" : "outline"}
                    onClick={() => setSelectedWeeks(option.weeks)}
                    className="w-full h-auto p-4 flex flex-col items-center space-y-2"
                  >
                    <span className="font-semibold">{option.label}</span>
                    <span className="text-xs text-gray-500">{option.description}</span>
                    {option.discount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {option.discount * 100}% OFF
                      </Badge>
                    )}
                  </Button>
                  {option.weeks === 4 && <Badge className="absolute -top-2 -right-2 bg-fitnest-orange">Popular</Badge>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pricing Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>
              Pricing Breakdown for {selectedWeeks} Week{selectedWeeks > 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const selection = createSelection(selectedWeeks)
              const pricing = calculatePrice(selection)

              return (
                <div className="space-y-6">
                  {/* Weekly Cost */}
                  <div>
                    <h3 className="font-semibold mb-3">Weekly Cost Breakdown</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Daily cost:</span>
                        <span>{pricing.dailyBreakdown.dailyTotal.toFixed(2)} MAD</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Days per week:</span>
                        <span>3 days</span>
                      </div>
                      <div className="flex justify-between font-medium border-t pt-2">
                        <span>Weekly subtotal:</span>
                        <span>{pricing.weeklyTotals.subtotal.toFixed(2)} MAD</span>
                      </div>
                    </div>
                  </div>

                  {/* Subscription Calculation */}
                  <div>
                    <h3 className="font-semibold mb-3">Subscription Calculation</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Weekly cost:</span>
                        <span>{pricing.weeklyTotals.subtotal.toFixed(2)} MAD</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Number of weeks:</span>
                        <span>
                          {selectedWeeks} week{selectedWeeks > 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Subscription subtotal:</span>
                        <span>{pricing.subscriptionTotals.subscriptionSubtotal.toFixed(2)} MAD</span>
                      </div>
                    </div>
                  </div>

                  {/* Discount Breakdown */}
                  <div>
                    <h3 className="font-semibold mb-3">Discount Breakdown</h3>
                    <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Weekly discount (3 days, 12 items):</span>
                        <span className="text-gray-500">0% (no weekly discount)</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>
                          Duration discount ({selectedWeeks} week{selectedWeeks > 1 ? "s" : ""}):
                        </span>
                        <span
                          className={
                            pricing.discounts.durationDiscount > 0 ? "text-green-600 font-medium" : "text-gray-500"
                          }
                        >
                          {durationOptions.find((d) => d.weeks === selectedWeeks)?.discount * 100 || 0}%
                          {pricing.discounts.durationDiscount > 0 &&
                            ` (-${pricing.discounts.durationDiscount.toFixed(2)} MAD)`}
                        </span>
                      </div>
                      <div className="flex justify-between font-medium border-t pt-2">
                        <span>Total discount:</span>
                        <span className="text-green-600">-{pricing.discounts.totalDiscount.toFixed(2)} MAD</span>
                      </div>
                    </div>
                  </div>

                  {/* Final Pricing */}
                  <div className="bg-fitnest-green/10 p-4 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Total Price:</span>
                        <span className="text-2xl font-bold text-fitnest-green">{pricing.finalTotal} MAD</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Price per week:</span>
                        <span>{pricing.pricePerWeek} MAD</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Price per day:</span>
                        <span>{pricing.pricePerDay} MAD</span>
                      </div>
                    </div>
                  </div>

                  {/* Savings Comparison */}
                  {selectedWeeks > 1 && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-medium text-yellow-800 mb-2">💰 Savings vs 1 Week</h4>
                      {(() => {
                        const oneWeekSelection = createSelection(1)
                        const oneWeekPricing = calculatePrice(oneWeekSelection)
                        const oneWeekPerWeek = oneWeekPricing.pricePerWeek
                        const currentPerWeek = pricing.pricePerWeek
                        const savingsPerWeek = oneWeekPerWeek - currentPerWeek
                        const totalSavings = savingsPerWeek * selectedWeeks

                        return (
                          <div className="text-sm space-y-1">
                            <div>1 week subscription: {oneWeekPerWeek} MAD per week</div>
                            <div>
                              {selectedWeeks} week subscription: {currentPerWeek} MAD per week
                            </div>
                            <div className="font-medium text-green-600">
                              You save {savingsPerWeek.toFixed(2)} MAD per week = {totalSavings.toFixed(2)} MAD total!
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  )}

                  {/* Commitment Benefits */}
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-medium text-purple-800 mb-2">🎯 Commitment Benefits</h4>
                    <div className="text-sm text-purple-700 space-y-1">
                      {selectedWeeks >= 2 && <div>✓ Build healthy eating habits</div>}
                      {selectedWeeks >= 4 && <div>✓ See real results in your fitness journey</div>}
                      {selectedWeeks >= 8 && <div>✓ Establish long-term lifestyle changes</div>}
                      {selectedWeeks >= 12 && <div>✓ Maximum savings and convenience</div>}
                      <div>✓ Can pause or modify subscription anytime</div>
                    </div>
                  </div>
                </div>
              )
            })()}
          </CardContent>
        </Card>

        {/* All Duration Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Duration Comparison Table</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Duration</th>
                    <th className="text-right p-2">Total Price</th>
                    <th className="text-right p-2">Per Week</th>
                    <th className="text-right p-2">Per Day</th>
                    <th className="text-right p-2">Discount</th>
                    <th className="text-right p-2">Total Savings</th>
                  </tr>
                </thead>
                <tbody>
                  {durationOptions.map((option) => {
                    const selection = createSelection(option.weeks)
                    const pricing = calculatePrice(selection)
                    const oneWeekPricing = calculatePrice(createSelection(1))
                    const totalSavings = oneWeekPricing.pricePerWeek * option.weeks - pricing.finalTotal

                    return (
                      <tr
                        key={option.weeks}
                        className={`border-b ${selectedWeeks === option.weeks ? "bg-fitnest-green/10" : ""}`}
                      >
                        <td className="p-2 font-medium">{option.label}</td>
                        <td className="p-2 text-right">{pricing.finalTotal} MAD</td>
                        <td className="p-2 text-right">{pricing.pricePerWeek} MAD</td>
                        <td className="p-2 text-right">{pricing.pricePerDay} MAD</td>
                        <td className="p-2 text-right text-green-600">{option.discount * 100}%</td>
                        <td className="p-2 text-right font-medium text-green-600">
                          {totalSavings > 0 ? `${totalSavings.toFixed(2)} MAD` : "-"}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
