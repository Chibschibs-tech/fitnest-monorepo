"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, Users, Wallet } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface MealPlan {
  id: number
  name: string
  description: string
  category: string
  is_available: boolean
  price_per_week: number
  subscribers_count: number
}

export function MealPlanDetailContent({ mealPlanId }: { mealPlanId: string }) {
  const router = useRouter()
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    fetchMealPlan()
  }, [mealPlanId])

  const fetchMealPlan = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/products/meal-plans/${mealPlanId}`)
      const data = await response.json()

      if (response.ok && data.success) {
        setMealPlan(data.mealPlan)
      } else {
        let errorMessage = "Failed to fetch meal plan"
        if (data.error) {
          if (typeof data.error === 'string') {
            errorMessage = data.error
          } else if (data.error.message) {
            errorMessage = data.error.message
          }
        }
        setError(errorMessage)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch meal plan")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!mealPlan) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error || "Meal plan not found"}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push("/admin/products/meal-plans")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Meal Plans
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{mealPlan.name}</h1>
          <p className="text-gray-500 mt-1">{mealPlan.description || "No description"}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{mealPlan.category}</Badge>
            <Badge variant={mealPlan.is_available ? "default" : "secondary"}>
              {mealPlan.is_available ? "Published" : "Unpublished"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entry price</CardTitle>
            <Wallet className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mealPlan.price_per_week > 0
                ? `${mealPlan.price_per_week.toFixed(2)} MAD/week`
                : "—"}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Computed by the pricing engine (Lunch + Dinner, 5 days).
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active subscribers</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mealPlan.subscribers_count || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pricing pointer */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
          <CardDescription>
            Prices for this plan are defined per meal type (Breakfast, Lunch, Dinner…) in the
            central pricing settings. The price of a day is the sum of the selected meal types;
            discounts by days/week and duration are applied automatically at checkout.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push("/admin/pricing")}>Manage pricing</Button>
        </CardContent>
      </Card>
    </div>
  )
}
