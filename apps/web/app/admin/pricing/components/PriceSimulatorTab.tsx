"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function PriceSimulatorTab({ data }) {
  const [plan, setPlan] = useState("Weight Loss")
  const [meals, setMeals] = useState(["Breakfast"])
  const [daysPerWeek, setDaysPerWeek] = useState(5)
  const [durationWeeks, setDurationWeeks] = useState(4)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const calculatePrice = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/calculate-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_name: plan,
          meal_types: meals,
          days_per_week: daysPerWeek,
          duration_weeks: durationWeeks,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setResult(data.calculation)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Price Calculator</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Plan</label>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option>Weight Loss</option>
              <option>Stay Fit</option>
              <option>Muscle Gain</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Days/Week</label>
            <input
              type="number"
              min="1"
              max="7"
              value={daysPerWeek}
              onChange={(e) => setDaysPerWeek(parseInt(e.target.value))}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Duration (weeks)</label>
            <input
              type="number"
              min="1"
              max="12"
              value={durationWeeks}
              onChange={(e) => setDurationWeeks(parseInt(e.target.value))}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Meals</label>
            <div className="space-y-2">
              {["Breakfast", "Lunch", "Dinner"].map((meal) => (
                <label key={meal} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={meals.includes(meal)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setMeals([...meals, meal])
                      } else {
                        setMeals(meals.filter((m) => m !== meal))
                      }
                    }}
                    className="mr-2"
                  />
                  {meal}
                </label>
              ))}
            </div>
          </div>
        </div>
        <Button onClick={calculatePrice} disabled={loading} className="mt-4 w-full">
          {loading ? "Calculating..." : "Calculate Price"}
        </Button>
      </Card>

      {result && (
        <Card className="p-6 bg-green-50">
          <h3 className="text-lg font-semibold mb-4">Result</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>Base Price: {result.basePrice} MAD</div>
            <div>Weekly Price: {result.weeklyPrice} MAD</div>
            <div>Days Discount: {result.daysDiscountRate}%</div>
            <div>Duration Discount: {result.durationDiscountRate}%</div>
            <div className="col-span-2 text-lg font-bold">
              Final Price: {result.finalPrice} MAD
            </div>
          </div>
        </Card>
      )}

      {error && (
        <Card className="p-6 bg-red-50 border-red-200">
          <p className="text-red-700">Error: {error}</p>
        </Card>
      )}
    </div>
  )
}
