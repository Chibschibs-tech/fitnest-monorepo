"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { calculatePrice, type MealSelection, type PriceBreakdown } from "@/lib/pricing-model"

export default function PricingDemo() {
  const [selection, setSelection] = useState<MealSelection>({
    planId: "muscle-gain",
    mainMeals: 2,
    breakfast: true,
    snacks: 1,
    selectedDays: Array(3).fill(new Date()),
    subscriptionWeeks: 1,
  })

  const [seasonalCode, setSeasonalCode] = useState<string>("")
  const [breakdown, setBreakdown] = useState<PriceBreakdown | null>(null)
  const [error, setError] = useState<string>("")

  const calculatePricing = () => {
    try {
      const result = calculatePrice(selection, seasonalCode || undefined)
      setBreakdown(result)
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Calculation error")
      setBreakdown(null)
    }
  }

  const updateSelection = (field: keyof MealSelection, value: any) => {
    if (field === "selectedDays") {
      setSelection((prev) => ({
        ...prev,
        selectedDays: Array(value).fill(new Date()),
      }))
    } else {
      setSelection((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Fitnest.ma Pricing Calculator</h1>
        <p className="text-gray-600">Test the updated pricing model (Volume + Duration discounts only)</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Meal Selection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Meal Plan</label>
              <Select value={selection.planId} onValueChange={(value) => updateSelection("planId", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stay-fit">Stay Fit (5% discount)</SelectItem>
                  <SelectItem value="weight-loss">Weight Loss (base price)</SelectItem>
                  <SelectItem value="keto">Keto (10% premium)</SelectItem>
                  <SelectItem value="muscle-gain">Muscle Gain (15% premium)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Main Meals per Day</label>
              <Select
                value={selection.mainMeals.toString()}
                onValueChange={(value) => updateSelection("mainMeals", Number.parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Main Meal</SelectItem>
                  <SelectItem value="2">2 Main Meals</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Breakfast</label>
              <Select
                value={selection.breakfast.toString()}
                onValueChange={(value) => updateSelection("breakfast", value === "true")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">No Breakfast</SelectItem>
                  <SelectItem value="true">Include Breakfast</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Snacks per Day</label>
              <Select
                value={selection.snacks.toString()}
                onValueChange={(value) => updateSelection("snacks", Number.parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No Snacks</SelectItem>
                  <SelectItem value="1">1 Snack</SelectItem>
                  <SelectItem value="2">2 Snacks</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Days per Week</label>
              <Select
                value={selection.selectedDays.length.toString()}
                onValueChange={(value) => updateSelection("selectedDays", Number.parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Days</SelectItem>
                  <SelectItem value="4">4 Days</SelectItem>
                  <SelectItem value="5">5 Days</SelectItem>
                  <SelectItem value="6">6 Days</SelectItem>
                  <SelectItem value="7">7 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Subscription Duration</label>
              <Select
                value={selection.subscriptionWeeks?.toString() || "1"}
                onValueChange={(value) => updateSelection("subscriptionWeeks", Number.parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Week</SelectItem>
                  <SelectItem value="2">2 Weeks</SelectItem>
                  <SelectItem value="4">1 Month (4 weeks)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Seasonal Code (Optional)</label>
              <Select value={seasonalCode} onValueChange={setSeasonalCode}>
                <SelectTrigger>
                  <SelectValue placeholder="No code" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Code</SelectItem>
                  <SelectItem value="NEW-CUSTOMER">NEW-CUSTOMER (20%)</SelectItem>
                  <SelectItem value="RAMADAN">RAMADAN (15%)</SelectItem>
                  <SelectItem value="SUMMER">SUMMER (10%)</SelectItem>
                  <SelectItem value="BULK-ORDER">BULK-ORDER (25%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={calculatePricing} className="w-full">
              Calculate Price
            </Button>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Price Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {breakdown && (
              <div className="space-y-4">
                {/* Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Final Total</span>
                    <span className="text-2xl font-bold text-blue-600">{breakdown.finalTotal} MAD</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Per Week:</span>
                      <span>{breakdown.pricePerWeek} MAD</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Per Day:</span>
                      <span>{breakdown.pricePerDay} MAD</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Items:</span>
                      <span>{breakdown.totalItems}</span>
                    </div>
                  </div>
                </div>

                {/* Daily Breakdown */}
                <div>
                  <h4 className="font-semibold mb-2">Daily Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Main Meals ({selection.mainMeals}×):</span>
                      <span>{breakdown.dailyBreakdown.mainMeals} MAD</span>
                    </div>
                    {selection.breakfast && (
                      <div className="flex justify-between">
                        <span>Breakfast:</span>
                        <span>{breakdown.dailyBreakdown.breakfast} MAD</span>
                      </div>
                    )}
                    {selection.snacks > 0 && (
                      <div className="flex justify-between">
                        <span>Snacks ({selection.snacks}×):</span>
                        <span>{breakdown.dailyBreakdown.snacks} MAD</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold border-t pt-2">
                      <span>Daily Total:</span>
                      <span>{breakdown.dailyBreakdown.dailyTotal} MAD</span>
                    </div>
                  </div>
                </div>

                {/* Discounts */}
                {breakdown.discounts.totalDiscount > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Discounts Applied</h4>
                    <div className="space-y-2 text-sm">
                      {breakdown.discounts.appliedWeeklyDiscount > 0 && (
                        <div className="flex justify-between">
                          <span>Volume Discount ({breakdown.discounts.appliedWeeklyDiscount}%):</span>
                          <Badge variant="secondary">
                            -
                            {(
                              breakdown.weeklyTotals.subtotal *
                              (breakdown.discounts.appliedWeeklyDiscount / 100) *
                              breakdown.totalWeeks
                            ).toFixed(2)}{" "}
                            MAD
                          </Badge>
                        </div>
                      )}
                      {breakdown.discounts.durationDiscount > 0 && (
                        <div className="flex justify-between">
                          <span>Duration Discount:</span>
                          <Badge variant="secondary">-{breakdown.discounts.durationDiscount} MAD</Badge>
                        </div>
                      )}
                      {breakdown.discounts.seasonalDiscount > 0 && (
                        <div className="flex justify-between">
                          <span>Seasonal Discount:</span>
                          <Badge variant="secondary">-{breakdown.discounts.seasonalDiscount} MAD</Badge>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold border-t pt-2">
                        <span>Total Savings:</span>
                        <Badge variant="default">-{breakdown.discounts.totalDiscount} MAD</Badge>
                      </div>
                    </div>
                  </div>
                )}

                {/* Subscription Details */}
                <div>
                  <h4 className="font-semibold mb-2">Subscription Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>
                        {breakdown.totalWeeks} week{breakdown.totalWeeks > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Days per Week:</span>
                      <span>{selection.selectedDays.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Subtotal (before discounts):</span>
                      <span>
                        {breakdown.subscriptionTotals.subscriptionSubtotal + breakdown.discounts.totalDiscount} MAD
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Examples Section */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Examples (Updated Pricing Model)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Budget Customer</h5>
              <p className="text-sm text-gray-600 mb-2">Stay Fit • 1 Main + Breakfast • 3 days • 1 week</p>
              <p className="font-bold">189.75 MAD</p>
              <p className="text-xs text-gray-500">63.25 MAD per day</p>
              <p className="text-xs text-green-600">No discounts (6 items)</p>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Popular Customer</h5>
              <p className="text-sm text-gray-600 mb-2">Weight Loss • 2 Main + 1 Snack • 5 days • 2 weeks</p>
              <p className="font-bold">855 MAD</p>
              <p className="text-xs text-gray-500">85.5 MAD per day</p>
              <p className="text-xs text-green-600">5% volume + 5% duration discount</p>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Premium Customer</h5>
              <p className="text-sm text-gray-600 mb-2">Muscle Gain • All Meals + 2 Snacks • 7 days • 1 month</p>
              <p className="font-bold">3,549.42 MAD</p>
              <p className="text-xs text-gray-500">126.77 MAD per day</p>
              <p className="text-xs text-green-600">15% volume + 10% duration discount</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h6 className="font-semibold text-yellow-800 mb-2">Updated Pricing Model</h6>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>
                • <strong>Removed:</strong> Days-based discounts
              </li>
              <li>
                • <strong>Kept:</strong> Volume discounts (6-13: 0%, 14-20: 5%, 21-35: 10%, 36+: 15%)
              </li>
              <li>
                • <strong>Kept:</strong> Duration discounts (1 week: 0%, 2 weeks: 5%, 1 month: 10%)
              </li>
              <li>
                • <strong>Kept:</strong> Seasonal/promo code discounts
              </li>
              <li>
                • <strong>Logic:</strong> Best weekly discount (volume vs seasonal) + duration discount
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
