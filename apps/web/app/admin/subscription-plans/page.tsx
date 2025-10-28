"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Loader2, Plus, Edit, Trash2, Users, DollarSign, Package, Settings, Eye } from "lucide-react"

interface SubscriptionPlan {
  id: number
  name: string
  description: string
  billing_period: string
  price: number
  trial_period_days: number
  delivery_frequency: string
  items_per_delivery: number
  is_active: boolean
  product_name: string
  featured_image: string
  item_count: number
  subscriber_count: number
  monthly_revenue: number
  created_at: string
}

export default function SubscriptionPlansPage() {
  const router = useRouter()
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cleaningDuplicates, setCleaningDuplicates] = useState(false)

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/subscription-plans")
      const data = await response.json()

      if (data.success) {
        setPlans(data.plans)
        setError(null)
      } else {
        setError(data.error || "Failed to fetch plans")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const cleanDuplicates = async () => {
    try {
      setCleaningDuplicates(true)
      const response = await fetch("/api/admin/clean-duplicate-plans", {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        alert(`Cleaned ${data.deletedCount} duplicate plans`)
        await fetchPlans() // Refresh the list
      } else {
        alert(data.error || "Failed to clean duplicates")
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setCleaningDuplicates(false)
    }
  }

  const deletePlan = async (planId: number) => {
    if (!confirm("Are you sure you want to delete this subscription plan?")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/subscription-plans/${planId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        await fetchPlans() // Refresh the list
      } else {
        alert(data.error || "Failed to delete plan")
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unknown error")
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  // Check for duplicates
  const planNames = plans.map((p) => p.name)
  const hasDuplicates = planNames.length !== new Set(planNames).size

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Subscription Plans</h1>
          <p className="text-gray-600">Manage your subscription plans and their contents.</p>
        </div>
        <div className="flex gap-2">
          {hasDuplicates && (
            <Button variant="outline" onClick={cleanDuplicates} disabled={cleaningDuplicates}>
              {cleaningDuplicates && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Clean Duplicates
            </Button>
          )}
          <Button onClick={() => router.push("/admin/subscription-plans/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Plan
          </Button>
        </div>
      </div>

      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {hasDuplicates && (
        <Alert className="mb-6 border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Duplicate plans detected. Click "Clean Duplicates" to remove them.
          </AlertDescription>
        </Alert>
      )}

      {plans.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Subscription Plans</h3>
            <p className="text-gray-600 mb-4">
              You haven't created any subscription plans yet. Initialize them from your meal plans.
            </p>
            <Button onClick={() => router.push("/admin/init-subscription-plans")}>Initialize Plans</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {plans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {plan.name}
                      <Badge variant={plan.is_active ? "default" : "secondary"}>
                        {plan.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </CardTitle>
                    <p className="text-gray-600 mt-1">{plan.description}</p>
                    {plan.product_name && <p className="text-sm text-gray-500 mt-1">Product: {plan.product_name}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/admin/subscription-plans/${plan.id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deletePlan(plan.id)}
                      disabled={plan.subscriber_count > 0}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Price</p>
                      <p className="font-semibold">
                        {plan.price} MAD/{plan.billing_period}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Subscribers</p>
                      <p className="font-semibold">{plan.subscriber_count}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Items</p>
                      <p className="font-semibold">{plan.item_count} meals</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-600">Monthly Revenue</p>
                      <p className="font-semibold">{plan.monthly_revenue.toFixed(2)} MAD</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/subscription-plans/${plan.id}/items`)}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Manage Items
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/subscription-plans/${plan.id}/subscribers`)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Subscribers
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
