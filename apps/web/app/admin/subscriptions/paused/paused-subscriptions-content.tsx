"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, PlayCircle, Calendar, User, DollarSign } from "lucide-react"

interface PausedSubscription {
  id: number
  customer_name: string
  customer_email: string
  plan_name: string
  total_amount: number
  created_at: string
  paused_until: string
}

export function PausedSubscriptionsContent() {
  const [subscriptions, setSubscriptions] = useState<PausedSubscription[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchPausedSubscriptions()
  }, [])

  const fetchPausedSubscriptions = async () => {
    try {
      const response = await fetch("/api/admin/subscriptions/paused")
      if (response.ok) {
        const data = await response.json()
        setSubscriptions(data.subscriptions || [])
      }
    } catch (error) {
      console.error("Error fetching paused subscriptions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleResumeSubscription = async (subscriptionId: number) => {
    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}/resume`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (response.ok) {
        setMessage("Subscription resumed successfully")
        fetchPausedSubscriptions() // Refresh the list
        setTimeout(() => setMessage(null), 5000)
      }
    } catch (error) {
      console.error("Error resuming subscription:", error)
      setMessage("Error resuming subscription")
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
            <CardTitle>Loading paused subscriptions...</CardTitle>
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
        <h1 className="text-3xl font-bold">Paused Subscriptions</h1>
        <p className="text-gray-600">Manage paused customer meal plan subscriptions</p>
      </div>

      {message && (
        <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Paused Subscriptions ({subscriptions.length})</CardTitle>
          <CardDescription>Currently paused meal plan subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          {subscriptions.length === 0 ? (
            <div className="text-center py-8">
              <PlayCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium">No paused subscriptions</h3>
              <p className="mt-1 text-sm text-gray-500">Paused subscriptions will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {subscriptions.map((subscription) => (
                <div key={subscription.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="font-semibold">Order #{subscription.id}</h3>
                        <Badge variant="outline" className="bg-orange-50 text-orange-700">
                          Paused
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
                        onClick={() => handleResumeSubscription(subscription.id)}
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Resume
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
