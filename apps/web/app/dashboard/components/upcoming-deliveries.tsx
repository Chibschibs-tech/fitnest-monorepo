"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Package } from "lucide-react"

export default function UpcomingDeliveries() {
  const [activeDay, setActiveDay] = useState("monday")

  // Sample data - in a real app, this would come from an API
  const deliveries = {
    monday: {
      date: "April 29, 2023",
      status: "Scheduled",
      timeSlot: "8:00 AM - 12:00 PM",
      address: "Apartment 3B, 123 Maarif Street, Casablanca",
      meals: [
        {
          type: "Breakfast",
          name: "Greek Yogurt Parfait",
          calories: 280,
          image: "/meals/yogurt-parfait.jpg",
        },
        {
          type: "Lunch",
          name: "Grilled Chicken Salad",
          calories: 350,
          image: "/meals/grilled-chicken-salad.jpg",
        },
        {
          type: "Dinner",
          name: "Salmon with Quinoa",
          calories: 420,
          image: "/meals/salmon-quinoa.jpg",
        },
      ],
    },
    tuesday: {
      date: "April 30, 2023",
      status: "Scheduled",
      timeSlot: "8:00 AM - 12:00 PM",
      address: "Apartment 3B, 123 Maarif Street, Casablanca",
      meals: [
        {
          type: "Breakfast",
          name: "Protein Pancakes",
          calories: 340,
          image: "/meals/protein-pancakes.jpg",
        },
        {
          type: "Lunch",
          name: "Turkey Meatballs",
          calories: 380,
          image: "/meals/turkey-meatballs.jpg",
        },
        {
          type: "Dinner",
          name: "Vegetable Stir Fry",
          calories: 320,
          image: "/meals/vegetable-stir-fry.jpg",
        },
      ],
    },
    wednesday: {
      date: "May 1, 2023",
      status: "Scheduled",
      timeSlot: "8:00 AM - 12:00 PM",
      address: "Apartment 3B, 123 Maarif Street, Casablanca",
      meals: [
        {
          type: "Breakfast",
          name: "Egg White Omelette",
          calories: 250,
          image: "/meals/egg-white-omelette.jpg",
        },
        {
          type: "Lunch",
          name: "Chicken Quinoa Bowl",
          calories: 420,
          image: "/meals/chicken-quinoa-bowl.jpg",
        },
        {
          type: "Dinner",
          name: "Beef and Broccoli",
          calories: 450,
          image: "/meals/beef-broccoli.jpg",
        },
      ],
    },
    thursday: {
      date: "May 2, 2023",
      status: "Scheduled",
      timeSlot: "8:00 AM - 12:00 PM",
      address: "Apartment 3B, 123 Maarif Street, Casablanca",
      meals: [
        {
          type: "Breakfast",
          name: "Greek Yogurt Parfait",
          calories: 280,
          image: "/meals/yogurt-parfait.jpg",
        },
        {
          type: "Lunch",
          name: "Tuna Avocado Wrap",
          calories: 380,
          image: "/meals/tuna-avocado-wrap.jpg",
        },
        {
          type: "Dinner",
          name: "Turkey Meatballs",
          calories: 380,
          image: "/meals/turkey-meatballs.jpg",
        },
      ],
    },
    friday: {
      date: "May 3, 2023",
      status: "Scheduled",
      timeSlot: "8:00 AM - 12:00 PM",
      address: "Apartment 3B, 123 Maarif Street, Casablanca",
      meals: [
        {
          type: "Breakfast",
          name: "Protein Pancakes",
          calories: 340,
          image: "/meals/protein-pancakes.jpg",
        },
        {
          type: "Lunch",
          name: "Grilled Chicken Salad",
          calories: 350,
          image: "/meals/grilled-chicken-salad.jpg",
        },
        {
          type: "Dinner",
          name: "Salmon with Quinoa",
          calories: 420,
          image: "/meals/salmon-quinoa.jpg",
        },
      ],
    },
  }

  const currentDelivery = deliveries[activeDay as keyof typeof deliveries]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Deliveries</CardTitle>
        <CardDescription>Your scheduled meal deliveries for this week</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="monday" onValueChange={setActiveDay} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="monday">Mon</TabsTrigger>
            <TabsTrigger value="tuesday">Tue</TabsTrigger>
            <TabsTrigger value="wednesday">Wed</TabsTrigger>
            <TabsTrigger value="thursday">Thu</TabsTrigger>
            <TabsTrigger value="friday">Fri</TabsTrigger>
          </TabsList>

          {Object.keys(deliveries).map((day) => (
            <TabsContent key={day} value={day} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">{currentDelivery.date}</h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="mr-1 h-4 w-4" />
                        {currentDelivery.timeSlot}
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      {currentDelivery.status}
                    </Badge>
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="mb-4 flex items-start">
                      <MapPin className="mr-2 h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Delivery Address</p>
                        <p className="text-sm text-gray-500">{currentDelivery.address}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Package className="mr-2 h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Delivery Instructions</p>
                        <p className="text-sm text-gray-500">
                          Please call when you arrive. The building has a security gate.
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-between">
                      <Button variant="outline" size="sm">
                        Change Time
                      </Button>
                      <Button variant="outline" size="sm">
                        Edit Address
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 font-medium">Meals in this Delivery</h3>
                  <div className="space-y-3">
                    {currentDelivery.meals.map((meal, index) => (
                      <div key={index} className="flex items-center rounded-lg border p-2">
                        <div className="h-16 w-16 overflow-hidden rounded-md">
                          <img
                            src={meal.image || "/placeholder.svg?height=64&width=64&query=food"}
                            alt={meal.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="ml-3 flex-1">
                          <Badge variant="outline" className="mb-1">
                            {meal.type}
                          </Badge>
                          <p className="font-medium">{meal.name}</p>
                          <p className="text-sm text-gray-500">{meal.calories} calories</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
