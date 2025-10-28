"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Check, CreditCard, Pause, RefreshCw, Edit, AlertTriangle, Clock, Package } from "lucide-react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

interface DeliverySchedule {
  deliveries: Array<{
    id: number
    scheduledDate: string
    status: string
  }>
  totalDeliveries: number
  completedDeliveries: number
  pendingDeliveries: number
  nextDeliveryDate?: string
  canPause: boolean
  pauseEligibleDate?: string
}

export default function ActiveSubscription() {
  const [isPaused, setIsPaused] = useState(false)
  const [showPauseDialog, setShowPauseDialog] = useState(false)
  const [showResumeDialog, setShowResumeDialog] = useState(false)
  const [showChangeDialog, setShowChangeDialog] = useState(false)
  const [pauseDuration, setPauseDuration] = useState("7")
  const [customResumeDate, setCustomResumeDate] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [deliverySchedule, setDeliverySchedule] = useState<DeliverySchedule | null>(null)
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false)

  // Sample data - in a real app, this would come from an API
  const subscription = {
    id: 1,
    plan: "Weight Loss",
    status: isPaused ? "Paused" : "Active",
    startDate: "April 15, 2023",
    nextBillingDate: "May 15, 2023",
    price: 349,
    frequency: "Weekly",
    deliveryDays: "Monday to Friday",
    mealCount: "3 meals per day",
    mealTypes: ["Lunch", "Dinner", "Snack"],
    deliveryTime: "Morning (8AM - 12PM)",
    deliveryAddress: "Apartment 3B, 123 Maarif Street, Casablanca",
    features: ["Customizable meals", "Nutritionist support", "Weekly menu rotation", "Pause or cancel anytime"],
    pauseCount: 0,
  }

  // Fetch delivery schedule
  useEffect(() => {
    fetchDeliverySchedule()
  }, [])

  const fetchDeliverySchedule = async () => {
    try {
      const response = await fetch(`/api/subscriptions/${subscription.id}/deliveries`)
      if (response.ok) {
        const data = await response.json()
        setDeliverySchedule(data)
      }
    } catch (error) {
      console.error("Error fetching delivery schedule:", error)
    }
  }

  const handlePauseSubscription = async () => {
    setLoading(true)
    setErrorMessage("")

    try {
      const response = await fetch(`/api/subscriptions/${subscription.id}/pause`, {
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
        setIsPaused(true)
        setShowPauseDialog(false)
        setSuccessMessage(result.message)
        fetchDeliverySchedule() // Refresh delivery schedule
        setTimeout(() => setSuccessMessage(""), 5000)
      } else {
        setErrorMessage(result.message)
      }
    } catch (error) {
      setErrorMessage("Failed to pause subscription. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleResumeSubscription = async (resumeDate?: string) => {
    setLoading(true)
    setErrorMessage("")

    try {
      const response = await fetch(`/api/subscriptions/${subscription.id}/resume`, {
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
        setIsPaused(false)
        setShowResumeDialog(false)
        setSuccessMessage(result.message)
        fetchDeliverySchedule() // Refresh delivery schedule
        setTimeout(() => setSuccessMessage(""), 5000)
      } else {
        setErrorMessage(result.message)
      }
    } catch (error) {
      setErrorMessage("Failed to resume subscription. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getSmartResumeDate = () => {
    if (!deliverySchedule?.nextDeliveryDate) return null

    const nextDelivery = new Date(deliverySchedule.nextDeliveryDate)
    const now = new Date()
    const minResumeDate = new Date(now.getTime() + 48 * 60 * 60 * 1000) // 48 hours from now

    return nextDelivery > minResumeDate ? nextDelivery : minResumeDate
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between md:flex-row md:items-center">
        <h2 className="text-2xl font-bold tracking-tight">My Subscription</h2>
        <div className="mt-2 flex space-x-2 md:mt-0">
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
                      disabled={loading}
                    >
                      {loading ? "Resuming..." : "Resume Now"}
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
                        disabled={!customResumeDate || loading}
                      >
                        {loading ? "Resuming..." : "Resume on Selected Date"}
                      </Button>
                    </div>
                  </div>
                </div>

                {errorMessage && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{errorMessage}</AlertDescription>
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
                <Button variant="outline" disabled={subscription.pauseCount >= 1 || !deliverySchedule?.canPause}>
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
                        ` Next eligible pause date: ${new Date(deliverySchedule.pauseEligibleDate).toLocaleDateString()}`}
                    </AlertDescription>
                  </Alert>
                )}

                {deliverySchedule?.canPause && (
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

                    <Alert className="bg-blue-50 text-blue-800 border-blue-200">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Important</AlertTitle>
                      <AlertDescription>
                        Your subscription will be extended to make up for the paused time. All remaining deliveries will
                        be shifted by {pauseDuration} days.
                      </AlertDescription>
                    </Alert>

                    {errorMessage && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{errorMessage}</AlertDescription>
                      </Alert>
                    )}
                  </>
                )}

                <DialogFooter className="mt-4">
                  <Button variant="outline" onClick={() => setShowPauseDialog(false)}>
                    Cancel
                  </Button>
                  {deliverySchedule?.canPause && (
                    <Button
                      onClick={handlePauseSubscription}
                      className="bg-green-600 hover:bg-green-700"
                      disabled={loading}
                    >
                      {loading ? "Pausing..." : "Pause Subscription"}
                    </Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          <Button variant="outline">
            <CreditCard className="mr-2 h-4 w-4" />
            Manage Billing
          </Button>

          <Link href="/dashboard/my-meal-plans">
            <Button variant="outline">
              <Package className="mr-2 h-4 w-4" />
              View All Plans
            </Button>
          </Link>
        </div>
      </div>

      {successMessage && (
        <Alert className="bg-green-50 text-green-800 border-green-200">
          <Check className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{subscription.plan} Plan</CardTitle>
              <CardDescription>Your current meal plan subscription</CardDescription>
            </div>
            <Badge variant={isPaused ? "outline" : "default"} className={isPaused ? "bg-gray-100" : "bg-green-600"}>
              {subscription.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Start Date</p>
                <p>{subscription.startDate}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Next Billing Date</p>
                <p>{subscription.nextBillingDate}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Price</p>
                <p>{subscription.price} MAD per week</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Billing Frequency</p>
                <p>{subscription.frequency}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Delivery Days</p>
                <p>{subscription.deliveryDays}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Meals</p>
                <p>{subscription.mealCount}</p>
              </div>
              {deliverySchedule && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Delivery Progress</p>
                  <p>
                    {deliverySchedule.completedDeliveries} of {deliverySchedule.totalDeliveries} delivered
                  </p>
                  {deliverySchedule.nextDeliveryDate && (
                    <p className="text-sm text-gray-600">
                      Next delivery: {new Date(deliverySchedule.nextDeliveryDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-500">Features</p>
                <ul className="mt-1 space-y-1">
                  {subscription.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <Check className="mr-2 h-4 w-4 text-green-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <h3 className="font-medium mb-4">Delivery Settings</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">Delivery Schedule</p>
                  <p className="text-sm text-gray-600 mt-1">{subscription.deliveryDays}</p>
                  <p className="text-sm text-gray-600">{subscription.deliveryTime}</p>
                </div>
                <Dialog open={showDeliveryDialog} onOpenChange={setShowDeliveryDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Delivery Settings</DialogTitle>
                      <DialogDescription>Change your delivery schedule and preferences</DialogDescription>
                    </DialogHeader>

                    <div className="mt-4 space-y-4">
                      <div className="space-y-2">
                        <Label>Delivery Days</Label>
                        <div className="flex flex-wrap gap-2">
                          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
                            <div
                              key={day}
                              className={`h-10 w-10 rounded-full flex items-center justify-center cursor-pointer
                                ${i < 5 ? "bg-green-500 text-white" : "bg-gray-100 text-gray-700"}`}
                            >
                              {day.charAt(0)}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Delivery Time</Label>
                        <RadioGroup defaultValue="morning">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="morning" id="delivery-morning" />
                            <Label htmlFor="delivery-morning">Morning (8AM - 12PM)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="afternoon" id="delivery-afternoon" />
                            <Label htmlFor="delivery-afternoon">Afternoon (12PM - 4PM)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="evening" id="delivery-evening" />
                            <Label htmlFor="delivery-evening">Evening (4PM - 8PM)</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="delivery-address">Delivery Address</Label>
                        <textarea
                          id="delivery-address"
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
                          rows={3}
                          defaultValue={subscription.deliveryAddress}
                        />
                      </div>
                    </div>

                    <DialogFooter className="mt-4">
                      <Button variant="outline" onClick={() => setShowDeliveryDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => setShowDeliveryDialog(false)} className="bg-green-600 hover:bg-green-700">
                        Save Changes
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Delivery Address</p>
                    <p className="text-sm text-gray-600 mt-1">{subscription.deliveryAddress}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <Dialog open={showChangeDialog} onOpenChange={setShowChangeDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">Change Plan Details</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Change Your Meal Plan</DialogTitle>
                <DialogDescription>Customize your meal plan to better fit your needs</DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="plan-type" className="mt-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="plan-type">Plan Type</TabsTrigger>
                  <TabsTrigger value="meals">Meals</TabsTrigger>
                  <TabsTrigger value="frequency">Frequency</TabsTrigger>
                </TabsList>

                <TabsContent value="plan-type" className="space-y-4 pt-4">
                  <RadioGroup defaultValue="weight-loss">
                    <div className="flex items-center justify-between space-x-2 border rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="weight-loss" id="weight-loss" />
                        <Label htmlFor="weight-loss">Weight Loss</Label>
                      </div>
                      <Badge>Current</Badge>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-3">
                      <RadioGroupItem value="balanced" id="balanced" />
                      <Label htmlFor="balanced">Balanced Nutrition</Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-3">
                      <RadioGroupItem value="muscle-gain" id="muscle-gain" />
                      <Label htmlFor="muscle-gain">Muscle Gain</Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-3">
                      <RadioGroupItem value="keto" id="keto" />
                      <Label htmlFor="keto">Keto</Label>
                    </div>
                  </RadioGroup>
                </TabsContent>

                <TabsContent value="meals" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Meals Per Day</Label>
                    <RadioGroup defaultValue="3-meals">
                      <div className="flex items-center justify-between space-x-2 border rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="2-meals" id="2-meals" />
                          <Label htmlFor="2-meals">2 Meals</Label>
                        </div>
                        <Badge>Current</Badge>
                      </div>
                      <div className="flex items-center justify-between space-x-2 border rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="3-meals" id="3-meals" />
                          <Label htmlFor="3-meals">3 Meals</Label>
                        </div>
                        <Badge>Current</Badge>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-3">
                        <RadioGroupItem value="5-meals" id="5-meals" />
                        <Label htmlFor="5-meals">5 Meals (3 + 2 Snacks)</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2 pt-4">
                    <Label>Meal Types</Label>
                    <div className="space-y-2">
                      {["Breakfast", "Lunch", "Dinner", "Snack"].map((meal, i) => (
                        <div key={meal} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`meal-${meal.toLowerCase()}`}
                            defaultChecked={subscription.mealTypes.includes(meal)}
                            className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <Label htmlFor={`meal-${meal.toLowerCase()}`}>{meal}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="frequency" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Days Per Week</Label>
                    <RadioGroup defaultValue="5-days">
                      <div className="flex items-center justify-between space-x-2 border rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="5-days" id="5-days" />
                          <Label htmlFor="5-days">5 Days (Mon-Fri)</Label>
                        </div>
                        <Badge>Current</Badge>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-3">
                        <RadioGroupItem value="7-days" id="7-days" />
                        <Label htmlFor="7-days">7 Days (Full Week)</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2 pt-4">
                    <Label>Billing Cycle</Label>
                    <RadioGroup defaultValue="weekly">
                      <div className="flex items-center justify-between space-x-2 border rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="weekly" id="weekly" />
                          <Label htmlFor="weekly">Weekly</Label>
                        </div>
                        <Badge>Current</Badge>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-3">
                        <RadioGroupItem value="monthly" id="monthly" />
                        <Label htmlFor="monthly">Monthly (Save 10%)</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-medium">New Total:</span>
                  <span className="font-bold text-lg">349 MAD/week</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Changes will take effect on your next billing cycle</p>
              </div>

              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setShowChangeDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setShowChangeDialog(false)
                    setSuccessMessage("Your plan changes will take effect on your next billing cycle.")
                    setTimeout(() => setSuccessMessage(""), 5000)
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Link href="/meal-plans">
            <Button className="bg-green-600 hover:bg-green-700">
              <Calendar className="mr-2 h-4 w-4" />
              Browse All Plans
            </Button>
          </Link>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Payments</CardTitle>
          <CardDescription>Your scheduled payments for this subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <p className="font-medium">May 15, 2023</p>
                <p className="text-sm text-gray-500">Weight Loss Plan (5 days)</p>
              </div>
              <p className="font-medium">349 MAD</p>
            </div>
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <p className="font-medium">May 22, 2023</p>
                <p className="text-sm text-gray-500">Weight Loss Plan (5 days)</p>
              </div>
              <p className="font-medium">349 MAD</p>
            </div>
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <p className="font-medium">May 29, 2023</p>
                <p className="text-sm text-gray-500">Weight Loss Plan (5 days)</p>
              </div>
              <p className="font-medium">349 MAD</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
