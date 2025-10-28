"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ExternalLink, AlertTriangle, RefreshCw } from "lucide-react"

interface MealPlan {
  id: number
  planId: number
  planName: string
  status: string
  createdAt: string
  totalAmount: number
}

export default function MyMealPlansPage() {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMealPlans = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log("Fetching meal plans...")
      const response = await fetch("/api/user/subscriptions", {
        method: "GET",
        credentials: "include", // Include cookies
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("You need to log in to view your meal plans")
        }
        throw new Error(`HTTP ${response.status}: Failed to fetch meal plans`)
      }

      const data = await response.json()
      console.log("Response data:", data)

      if (data.success) {
        setMealPlans(data.subscriptions || [])
      } else {
        setError(data.error || "Failed to load meal plans")
      }
    } catch (err) {
      console.error("Error fetching meal plans:", err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("We couldn't load your meal plans. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMealPlans()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "paused":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "completed":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Meal Plans</h1>
          <p className="text-gray-600 mt-2">View and manage your active meal plan subscriptions.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-6xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Meal Plans</h1>
          <p className="text-gray-600 mt-2">View and manage your active meal plan subscriptions.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>We couldn't load your meal plans</CardTitle>
            <CardDescription>Please try again in a moment.</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="mt-4 flex gap-4">
              <Button onClick={fetchMealPlans} className="bg-green-600 hover:bg-green-700">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try again
              </Button>
              <Link href="/meal-plans">
                <Button variant="outline">Browse Meal Plans</Button>
              </Link>
              {error.includes("log in") && (
                <Link href="/login">
                  <Button className="bg-blue-600 hover:bg-blue-700">Log In</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (mealPlans.length === 0) {
    return (
      <div className="container mx-auto max-w-6xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Meal Plans</h1>
          <p className="text-gray-600 mt-2">View and manage your active meal plan subscriptions.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>No meal plans found</CardTitle>
            <CardDescription>You don't have any active meal plan subscriptions yet.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Start your fitness journey by choosing a meal plan that fits your goals.
            </p>
            <Link href="/meal-plans">
              <Button className="bg-green-600 hover:bg-green-700">Browse Meal Plans</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-6xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Meal Plans</h1>
        <p className="text-gray-600 mt-2">View and manage your active meal plan subscriptions.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {mealPlans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <span>🍽️</span>
                    {plan.planName || `Plan ${plan.planId}`}
                  </CardTitle>
                  <CardDescription>📅 Started on {formatDate(plan.createdAt)}</CardDescription>
                </div>
                <Badge className={getStatusColor(plan.status)}>{plan.status || "Active"}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-500">Order ID</p>
                    <p>#{plan.id}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-500">Total</p>
                    <p>{plan.totalAmount} MAD</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Link href={`/dashboard/orders/${plan.id}`} className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View order details
                    </Button>
                  </Link>
                  <Link href={`/dashboard/my-meal-plans/${plan.id}`} className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent">
                      Manage deliveries
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
