"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Check, AlertTriangle, ArrowLeft, Clock, Package, Pause, RefreshCw } from "lucide-react"

interface Delivery {
  id: number
  scheduledDate: string
  status: string
}

interface DeliverySchedule {
  deliveries: Delivery[]
  totalDeliveries: number
  completedDeliveries: number
  pendingDeliveries: number
  nextDeliveryDate?: string
  canPause: boolean
  pauseEligibleDate?: string
}

interface Subscription {
  id: number
  status: string
  planId: number
  planName: string
  createdAt: string
  totalAmount: number
  pauseCount?: number
}

export default function SubscriptionManagementPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [deliverySchedule, setDeliverySchedule] = useState<DeliverySchedule | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showPauseDialog, setShowPauseDialog] = useState(false)
  const [showResumeDialog, setShowResumeDialog] = useState(false)
  const [pauseDuration, setPauseDuration] = useState("7")
  const [customResumeDate, setCustomResumeDate] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const orderId = Number.parseInt(params.id)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Fetch subscription details
        const orderResponse = await fetch(`/api/orders/${orderId}`)
        if (!orderResponse.ok) {
          throw new Error("Failed to fetch subscription details")
        }
        const orderData = await orderResponse.json()
        setSubscription({
          id: orderData.id,
          status: orderData.status || "active",
          planId: orderData.plan_id,
          planName: orderData.plan_name || "Meal Plan",
          createdAt: orderData.created_at,
          totalAmount: orderData.total_amount,
          pauseCount: orderData.pause_count || 0,
        })

        // Fetch delivery schedule
        const deliveryResponse = await fetch(`/api/subscriptions/${orderId}/deliveries`)
        if (!deliveryResponse.ok) {
          throw new Error("Failed to fetch delivery schedule")
        }
        const deliveryData = await deliveryResponse.json()
        setDeliverySchedule(deliveryData)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load subscription details. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [orderId])

  const handlePauseSubscription = async () => {
    setActionLoading(true)
    setActionError(null)

    try {
      const response = await fetch(`/api/subscriptions/${orderId}/pause`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pauseDurationDays: Number.parseInt(pauseDuration),
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setShowPauseDialog(false)
        setSuccessMessage(result.message)

        // Update subscription status
        setSubscription((prev) => (prev ? { ...prev, status: "paused", pauseCount: (prev.pauseCount || 0) + 1 } : null))

        // Refetch delivery schedule
        const deliveryResponse = await fetch(`/api/subscriptions/${orderId}/deliveries`)
        const deliveryData = await deliveryResponse.json()
        setDeliverySchedule(deliveryData)

        setTimeout(() => setSuccessMessage(null), 5000)
      } else {
        setActionError(result.message || "Failed to pause subscription")
      }
    } catch (err) {
      console.error("Error pausing subscription:", err)
      setActionError("An error occurred while pausing your subscription")
    } finally {
      setActionLoading(false)
    }
  }

  const handleResumeSubscription = async (resumeDate?: string) => {
    setActionLoading(true)
    setActionError(null)

    try {
      const response = await fetch(`/api/subscriptions/${orderId}/resume`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeDate: resumeDate,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setShowResumeDialog(false)
        setSuccessMessage(result.message)

        // Update subscription status
        setSubscription((prev) => (prev ? { ...prev, status: "active" } : null))

        // Refetch delivery schedule
        const deliveryResponse = await fetch(`/api/subscriptions/${orderId}/deliveries`)
        const deliveryData = await deliveryResponse.json()
        setDeliverySchedule(deliveryData)

        setTimeout(() => setSuccessMessage(null), 5000)
      } else {
        setActionError(result.message || "Failed to resume subscription")
      }
    } catch (err) {
      console.error("Error resuming subscription:", err)
      setActionError("An error occurred while resuming your subscription")
    } finally {
      setActionLoading(false)
    }
  }

  const getSmartResumeDate = () => {
    if (!deliverySchedule?.nextDeliveryDate) return null

    const nextDelivery = new Date(deliverySchedule.nextDeliveryDate)
    const now = new Date()
    const minResumeDate = new Date(now.getTime() + 48 * 60 * 60 * 1000) // 48 hours from now

    return nextDelivery > minResumeDate ? nextDelivery : minResumeDate
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Loading subscription details...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-24 animate-pulse rounded-md bg-muted" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !subscription) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>We couldn't load your subscription details</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error || "Subscription not found"}</AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/my-meal-plans">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to My Meal Plans
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const isPaused = subscription.status.toLowerCase() === "paused"

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-6">
        <Link href="/dashboard/my-meal-plans" className="flex items-center text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to My Meal Plans
        </Link>
      </div>

      <div className="flex flex-col justify-between md:flex-row md:items-center mb-6">
        <h1 className="text-3xl font-bold">{subscription.planName || `Plan ${subscription.planId}`}</h1>
        <Badge variant={isPaused ? "outline" : "default"} className={isPaused ? "bg-gray-100" : "bg-green-600"}>
          {subscription.status}
        </Badge>
      </div>

      {successMessage && (
        <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
          <Check className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Subscription Details</CardTitle>
            <CardDescription>Your meal plan subscription information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Order ID</p>
                <p>#{subscription.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Start Date</p>
                <p>{subscription.createdAt ? formatDate(subscription.createdAt) : "Unknown"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Amount</p>
                <p>{subscription.totalAmount} MAD</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Pause Count</p>
                <p>{subscription.pauseCount || 0} of 1 used</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            {isPaused ? (
              <Dialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resume Subscription
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Resume Your Subscription</DialogTitle>
                    <DialogDescription>Choose when you'd like to resume your meal deliveries.</DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-800">Smart Resume (Recommended)</h4>
                      <p className="text-sm text-green-600 mt-1">
                        Resume on {getSmartResumeDate()?.toLocaleDateString()} based on your original schedule
                      </p>
                      <Button
                        onClick={() => handleResumeSubscription()}
                        className="mt-2 bg-green-600 hover:bg-green-700"
                        disabled={actionLoading}
                      >
                        {actionLoading ? "Resuming..." : "Resume Now"}
                      </Button>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium">Choose Custom Date</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Select a specific date to resume (minimum 48 hours notice)
                      </p>
                      <div className="mt-2 space-y-2">
                        <input
                          type="date"
                          value={customResumeDate}
                          onChange={(e) => setCustomResumeDate(e.target.value)}
                          min={new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split("T")[0]}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
                        />
                        <Button
                          onClick={() => handleResumeSubscription(customResumeDate)}
                          variant="outline"
                          disabled={!customResumeDate || actionLoading}
                        >
                          {actionLoading ? "Resuming..." : "Resume on Selected Date"}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {actionError && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{actionError}</AlertDescription>
                    </Alert>
                  )}

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowResumeDialog(false)}>
                      Cancel
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ) : (
              <Dialog open={showPauseDialog} onOpenChange={setShowPauseDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={(subscription.pauseCount || 0) >= 1 || !deliverySchedule?.canPause}
                  >
                    <Pause className="mr-2 h-4 w-4" />
                    Pause Subscription
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Pause Your Subscription</DialogTitle>
                    <DialogDescription>
                      Pause your deliveries temporarily. You can only pause once per subscription.
                    </DialogDescription>
                  </DialogHeader>

                  {!deliverySchedule?.canPause && (
                    <Alert variant="warning" className="bg-amber-50 text-amber-800 border-amber-200">
                      <Clock className="h-4 w-4" />
                      <AlertTitle>Cannot Pause</AlertTitle>
                      <AlertDescription>
                        Deliveries can only be paused if they are at least 72 hours away.
                        {deliverySchedule?.pauseEligibleDate &&
                          ` Next eligible pause date: ${formatDate(deliverySchedule.pauseEligibleDate)}`}
                      </AlertDescription>
                    </Alert>
                  )}

                  {(subscription.pauseCount || 0) >= 1 && (
                    <Alert variant="warning" className="bg-amber-50 text-amber-800 border-amber-200">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Pause Limit Reached</AlertTitle>
                      <AlertDescription>
                        You can only pause once per subscription. You have already used your pause.
                      </AlertDescription>
                    </Alert>
                  )}

                  {deliverySchedule?.canPause && (subscription.pauseCount || 0) < 1 && (
                    <>
                      <RadioGroup value={pauseDuration} onValueChange={setPauseDuration} className="mt-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="7" id="1-week" />
                          <Label htmlFor="1-week">1 Week (7 days)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="14" id="2-weeks" />
                          <Label htmlFor="2-weeks">2 Weeks (14 days)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="21" id="3-weeks" />
                          <Label htmlFor="3-weeks">3 Weeks (21 days) - Maximum</Label>
                        </div>
                      </RadioGroup>

                      <Alert className="bg-blue-50 text-blue-800 border-blue-200 mt-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Important</AlertTitle>
                        <AlertDescription>
                          Your subscription will be extended to make up for the paused time. All remaining deliveries
                          will be shifted by {pauseDuration} days.
                        </AlertDescription>
                      </Alert>

                      {actionError && (
                        <Alert variant="destructive" className="mt-4">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>{actionError}</AlertDescription>
                        </Alert>
                      )}
                    </>
                  )}

                  <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => setShowPauseDialog(false)}>
                      Cancel
                    </Button>
                    {deliverySchedule?.canPause && (subscription.pauseCount || 0) < 1 && (
                      <Button
                        onClick={handlePauseSubscription}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={actionLoading}
                      >
                        {actionLoading ? "Pausing..." : "Pause Subscription"}
                      </Button>
                    )}
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            <Link href={`/dashboard/orders/${subscription.id}`}>
              <Button variant="outline">View Order Details</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Schedule</CardTitle>
            <CardDescription>Your upcoming and past meal deliveries</CardDescription>
          </CardHeader>
          <CardContent>
            {!deliverySchedule || deliverySchedule.deliveries.length === 0 ? (
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium">No deliveries found</h3>
                <p className="mt-1 text-sm text-gray-500">We couldn't find any deliveries for this subscription.</p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Delivery Progress</span>
                    <span className="text-sm">
                      {deliverySchedule.completedDeliveries} of {deliverySchedule.totalDeliveries} delivered
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-green-600"
                      style={{
                        width: `${(deliverySchedule.completedDeliveries / deliverySchedule.totalDeliveries) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Upcoming Deliveries</h3>
                  <div className="rounded-md border">
                    <div className="divide-y">
                      {deliverySchedule.deliveries
                        .filter((d) => d.status === "pending")
                        .slice(0, 5)
                        .map((delivery) => (
                          <div key={delivery.id} className="flex items-center justify-between p-4">
                            <div>
                              <p className="font-medium">{formatDate(delivery.scheduledDate)}</p>
                              <p className="text-sm text-gray-500">Scheduled delivery</p>
                            </div>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                              {delivery.status}
                            </Badge>
                          </div>
                        ))}

                      {deliverySchedule.deliveries.filter((d) => d.status === "pending").length === 0 && (
                        <div className="p-4 text-center text-gray-500">No upcoming deliveries</div>
                      )}
                    </div>
                  </div>

                  <h3 className="font-medium pt-2">Past Deliveries</h3>
                  <div className="rounded-md border">
                    <div className="divide-y">
                      {deliverySchedule.deliveries
                        .filter((d) => d.status === "delivered")
                        .slice(0, 5)
                        .map((delivery) => (
                          <div key={delivery.id} className="flex items-center justify-between p-4">
                            <div>
                              <p className="font-medium">{formatDate(delivery.scheduledDate)}</p>
                              <p className="text-sm text-gray-500">Delivered</p>
                            </div>
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">{delivery.status}</Badge>
                          </div>
                        ))}

                      {deliverySchedule.deliveries.filter((d) => d.status === "delivered").length === 0 && (
                        <div className="p-4 text-center text-gray-500">No past deliveries</div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
