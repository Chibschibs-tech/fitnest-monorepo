"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, PauseCircle, Calendar, User, DollarSign } from "lucide-react"

interface ActiveSubscription {
  id: number
  customer_name: string
  customer_email: string
  plan_name: string
  total_amount: number
  created_at: string
  delivery_frequency: string
  next_delivery: string
}

export function ActiveSubscriptionsContent() {
  const [subscriptions, setSubscriptions] = useState<ActiveSubscription[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchActiveSubscriptions()
  }, [])

  const fetchActiveSubscriptions = async () => {
    try {
      const response = await fetch("/api/admin/subscriptions/active")
      if (response.ok) {
        const data = await response.json()
        setSubscriptions(data.subscriptions || [])
      }
    } catch (error) {
      console.error("Error fetching active subscriptions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePauseSubscription = async (subscriptionId: number) => {
    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}/pause`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duration: 7 }), // Default 7 days pause
      })

      if (response.ok) {
        setMessage("Subscription paused successfully")
        fetchActiveSubscriptions() // Refresh the list
        setTimeout(() => setMessage(null), 5000)
      }
    } catch (error) {
      console.error("Error pausing subscription:", error)
      setMessage("Error pausing subscription")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Loading active subscriptions...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32 animate-pulse rounded-md bg-muted" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href="/admin" className="flex items-center text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Admin Dashboard
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Active Subscriptions</h1>
        <p className="text-gray-600">Manage active customer meal plan subscriptions</p>
      </div>

      {message && (
        <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Active Subscriptions ({subscriptions.length})</CardTitle>
          <CardDescription>Currently active meal plan subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          {subscriptions.length === 0 ? (
            <div className="text-center py-8">
              <PauseCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium">No active subscriptions</h3>
              <p className="mt-1 text-sm text-gray-500">Active subscriptions will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {subscriptions.map((subscription) => (
                <div key={subscription.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="font-semibold">Order #{subscription.id}</h3>
                        <Badge variant="default" className="bg-green-100 text-green-700">
                          Active
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="font-medium">{subscription.customer_name}</p>
                            <p className="text-gray-500">{subscription.customer_email}</p>
                          </div>
                        </div>

                        <div>
                          <p className="font-medium">{subscription.plan_name || "Meal Plan"}</p>
                          <p className="text-gray-500">Plan</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="font-medium">{subscription.total_amount} MAD</p>
                            <p className="text-gray-500">Total Amount</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="font-medium">{formatDate(subscription.created_at)}</p>
                            <p className="text-gray-500">Started</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/admin/orders/${subscription.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                      <Button
                        onClick={() => handlePauseSubscription(subscription.id)}
                        variant="outline"
                        size="sm"
                        className="text-orange-600 border-orange-200 hover:bg-orange-50"
                      >
                        <PauseCircle className="h-4 w-4 mr-2" />
                        Pause
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
