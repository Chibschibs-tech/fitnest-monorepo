"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Calendar, Clock, MapPin, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { format, addDays } from "date-fns"

export default function DeliverySchedule() {
  const [successMessage, setSuccessMessage] = useState("")
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string>("morning")

  // Sample data - in a real app, this would come from an API
  const deliverySchedule = [
    { date: addDays(new Date(), 1), status: "scheduled", time: "morning" },
    { date: addDays(new Date(), 2), status: "scheduled", time: "morning" },
    { date: addDays(new Date(), 3), status: "scheduled", time: "morning" },
    { date: addDays(new Date(), 4), status: "scheduled", time: "morning" },
    { date: addDays(new Date(), 5), status: "scheduled", time: "morning" },
  ]

  const handleUpdateDelivery = () => {
    if (!selectedDay) {
      return
    }

    setSuccessMessage(`Your delivery for ${selectedDay} has been updated to ${getTimeLabel(selectedTime)}.`)
    setTimeout(() => {
      setSuccessMessage("")
      setSelectedDay(null)
    }, 5000)
  }

  const getTimeLabel = (time: string) => {
    switch (time) {
      case "morning":
        return "Morning (8AM - 12PM)"
      case "afternoon":
        return "Afternoon (12PM - 4PM)"
      case "evening":
        return "Evening (4PM - 8PM)"
      default:
        return time
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
      case "processing":
        return <Badge className="bg-amber-100 text-amber-800">Processing</Badge>
      case "delivered":
        return <Badge className="bg-green-100 text-green-800">Delivered</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between md:flex-row md:items-center">
        <h2 className="text-2xl font-bold tracking-tight">Delivery Schedule</h2>
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
          <CardTitle>Upcoming Deliveries</CardTitle>
          <CardDescription>Manage your upcoming meal deliveries</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedDay ? (
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Update Delivery for {selectedDay}</h3>
                <Button variant="outline" size="sm" onClick={() => setSelectedDay(null)}>
                  Cancel
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Delivery Time</Label>
                  <RadioGroup value={selectedTime} onValueChange={setSelectedTime}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="morning" id="update-morning" />
                      <Label htmlFor="update-morning">Morning (8AM - 12PM)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="afternoon" id="update-afternoon" />
                      <Label htmlFor="update-afternoon">Afternoon (12PM - 4PM)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="evening" id="update-evening" />
                      <Label htmlFor="update-evening">Evening (4PM - 8PM)</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button onClick={handleUpdateDelivery} className="bg-green-600 hover:bg-green-700">
                  Update Delivery
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {deliverySchedule.map((delivery, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-start space-x-4">
                    <div className="bg-gray-100 p-3 rounded-full">
                      <Calendar className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">{format(delivery.date, "EEEE, MMMM d, yyyy")}</p>
                      <div className="flex items-center mt-1 text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        {getTimeLabel(delivery.time)}
                      </div>
                      <div className="flex items-center mt-1 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        Apartment 3B, 123 Maarif Street, Casablanca
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mt-4 md:mt-0">
                    {getStatusBadge(delivery.status)}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDay(format(delivery.date, "EEEE, MMMM d, yyyy"))}
                    >
                      Change Time
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-gray-600">
            You can change delivery times up to 24 hours before your scheduled delivery.
          </p>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Address</CardTitle>
          <CardDescription>Manage your delivery address</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">Current Delivery Address</h3>
                <p className="text-gray-600 mt-2">Apartment 3B, 123 Maarif Street, Casablanca</p>
              </div>
              <Button variant="outline" size="sm">
                Edit Address
              </Button>
            </div>
          </div>

          <Alert variant="info" className="bg-blue-50 text-blue-800 border-blue-200">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Delivery Information</AlertTitle>
            <AlertDescription>
              Address changes will apply to all future deliveries. Please ensure someone is available to receive your
              delivery.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
