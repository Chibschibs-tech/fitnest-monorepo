"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Calculator, Edit, Trash2, AlertCircle } from "lucide-react"

interface MealPrice {
  id: number
  plan_name: string
  meal_type: string
  base_price_mad: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface DiscountRule {
  id: number
  discount_type: string
  condition_value: number
  discount_percentage: number
  stackable: boolean
  is_active: boolean
  valid_from: string | null
  valid_to: string | null
  created_at: string
  updated_at: string
}

interface PriceCalculation {
  currency: string
  pricePerDay: number
  grossWeekly: number
  discountsApplied: Array<{
    type: string
    condition: number
    percentage: number
    amount: number
  }>
  finalWeekly: number
  durationWeeks: number
  totalRoundedMAD: number
  breakdown: {
    plan: string
    meals: string[]
    days: number
    mealPrices: Array<{
      meal: string
      price: number
    }>
  }
}

export default function PricingPage() {
  const [mealPrices, setMealPrices] = useState<MealPrice[]>([])
  const [discountRules, setDiscountRules] = useState<DiscountRule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Simulator state
  const [simulatorData, setSimulatorData] = useState({
    plan: "Weight Loss",
    meals: ["Breakfast"],
    days: 5,
    duration: 4,
  })
  const [calculationResult, setCalculationResult] = useState<PriceCalculation | null>(null)
  const [calculating, setCalculating] = useState(false)

  // Load data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [mealPricesRes, discountRulesRes] = await Promise.all([
        fetch("/api/admin/pricing/meal-prices"),
        fetch("/api/admin/pricing/discount-rules"),
      ])

      const mealPricesData = await mealPricesRes.json()
      const discountRulesData = await discountRulesRes.json()

      setMealPrices(mealPricesData.mealPrices || [])
      setDiscountRules(discountRulesData.discountRules || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const calculatePrice = async () => {
    setCalculating(true)
    try {
      const response = await fetch("/api/calculate-price", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(simulatorData),
      })

      const data = await response.json()

      if (response.ok) {
        setCalculationResult(data)
      } else {
        setError(data.error || "Calculation failed")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Calculation failed")
    } finally {
      setCalculating(false)
    }
  }

  const handleMealToggle = (meal: string, checked: boolean) => {
    setSimulatorData((prev) => ({
      ...prev,
      meals: checked ? [...prev.meals, meal] : prev.meals.filter((m) => m !== meal),
    }))
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Loading pricing data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pricing Management</h1>
          <p className="text-gray-600 mt-2">Manage meal prices, discount rules, and test pricing calculations</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="simulator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="simulator">Price Simulator</TabsTrigger>
            <TabsTrigger value="meal-prices">Meal Prices</TabsTrigger>
            <TabsTrigger value="discount-rules">Discount Rules</TabsTrigger>
          </TabsList>

          <TabsContent value="simulator">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Price Calculator
                  </CardTitle>
                  <CardDescription>Test pricing calculations with different combinations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="plan">Plan</Label>
                    <Select
                      value={simulatorData.plan}
                      onValueChange={(value) => setSimulatorData((prev) => ({ ...prev, plan: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Weight Loss">Weight Loss</SelectItem>
                        <SelectItem value="Stay Fit">Stay Fit</SelectItem>
                        <SelectItem value="Muscle Gain">Muscle Gain</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Meals</Label>
                    <div className="space-y-2 mt-2">
                      {["Breakfast", "Lunch", "Dinner"].map((meal) => (
                        <div key={meal} className="flex items-center space-x-2">
                          <Checkbox
                            id={meal}
                            checked={simulatorData.meals.includes(meal)}
                            onCheckedChange={(checked) => handleMealToggle(meal, checked as boolean)}
                          />
                          <Label htmlFor={meal}>{meal}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="days">Days per Week</Label>
                    <Select
                      value={simulatorData.days.toString()}
                      onValueChange={(value) => setSimulatorData((prev) => ({ ...prev, days: Number.parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                          <SelectItem key={day} value={day.toString()}>
                            {day} days
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="duration">Duration (Weeks)</Label>
                    <Select
                      value={simulatorData.duration.toString()}
                      onValueChange={(value) =>
                        setSimulatorData((prev) => ({ ...prev, duration: Number.parseInt(value) }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 week</SelectItem>
                        <SelectItem value="2">2 weeks</SelectItem>
                        <SelectItem value="4">4 weeks</SelectItem>
                        <SelectItem value="8">8 weeks</SelectItem>
                        <SelectItem value="12">12 weeks</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={calculatePrice}
                    disabled={calculating || simulatorData.meals.length === 0}
                    className="w-full"
                  >
                    {calculating ? "Calculating..." : "Calculate Price"}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Calculation Result</CardTitle>
                </CardHeader>
                <CardContent>
                  {calculationResult ? (
                    <div className="space-y-4">
                      <div className="text-3xl font-bold text-green-600">
                        {calculationResult.totalRoundedMAD.toFixed(2)} {calculationResult.currency}
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Price per day:</span>
                          <span>{calculationResult.pricePerDay.toFixed(2)} MAD</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Gross weekly:</span>
                          <span>{calculationResult.grossWeekly.toFixed(2)} MAD</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Final weekly:</span>
                          <span>{calculationResult.finalWeekly.toFixed(2)} MAD</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span>Duration:</span>
                          <span>{calculationResult.durationWeeks} weeks</span>
                        </div>
                      </div>

                      {calculationResult.discountsApplied.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Discounts Applied:</h4>
                          <div className="space-y-1">
                            {calculationResult.discountsApplied.map((discount, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span>
                                  {discount.type === "days_per_week"
                                    ? `${discount.condition} days/week`
                                    : `${discount.condition} weeks`}
                                  :
                                </span>
                                <span className="text-green-600">
                                  -{(discount.percentage * 100).toFixed(1)}% (-{discount.amount.toFixed(2)} MAD)
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="font-semibold mb-2">Breakdown:</h4>
                        <div className="space-y-1 text-sm">
                          {calculationResult.breakdown.mealPrices.map((meal, index) => (
                            <div key={index} className="flex justify-between">
                              <span>{meal.meal}:</span>
                              <span>{meal.price.toFixed(2)} MAD</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">Configure options and click "Calculate Price" to see results</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="meal-prices">
            <Card>
              <CardHeader>
                <CardTitle>Meal Prices</CardTitle>
                <CardDescription>Manage base prices for each meal type per plan</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plan</TableHead>
                      <TableHead>Meal Type</TableHead>
                      <TableHead>Price (MAD)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mealPrices.map((price) => (
                      <TableRow key={price.id}>
                        <TableCell className="font-medium">{price.plan_name}</TableCell>
                        <TableCell>{price.meal_type}</TableCell>
                        <TableCell>{price.base_price_mad.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={price.is_active ? "default" : "secondary"}>
                            {price.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="discount-rules">
            <Card>
              <CardHeader>
                <CardTitle>Discount Rules</CardTitle>
                <CardDescription>Manage discount rules for days per week and duration</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Stackable</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {discountRules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell className="font-medium">{rule.discount_type.replace("_", " ")}</TableCell>
                        <TableCell>
                          {rule.discount_type === "days_per_week"
                            ? `${rule.condition_value} days`
                            : `${rule.condition_value} weeks`}
                        </TableCell>
                        <TableCell>{(rule.discount_percentage * 100).toFixed(1)}%</TableCell>
                        <TableCell>
                          <Badge variant={rule.stackable ? "default" : "secondary"}>
                            {rule.stackable ? "Yes" : "No"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={rule.is_active ? "default" : "secondary"}>
                            {rule.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
