"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface MealPlan {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
}

export function FeaturedMealPlans() {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMealPlans() {
      try {
        // In a real app, this would fetch from your API
        // For now, we'll use mock data
        const mockMealPlans = [
          {
            id: "1",
            name: "Weight Loss",
            description: "Calorie-controlled meals designed to help you lose weight while staying satisfied.",
            price: 249,
            image: "/vibrant-weight-loss-meal.png",
            category: "weight-loss",
          },
          {
            id: "2",
            name: "Stay Fit",
            description: "Well-balanced meals to maintain your health and energy throughout the day.",
            price: 299,
            image: "/vibrant-nutrition-plate.png",
            category: "balanced-nutrition",
          },
          {
            id: "3",
            name: "Muscle Gain",
            description: "Protein-rich meals to support muscle growth and recovery after workouts.",
            price: 299,
            image: "/hearty-muscle-meal.png",
            category: "muscle-gain",
          },
        ]

        setMealPlans(mockMealPlans)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching meal plans:", error)
        setLoading(false)
      }
    }

    fetchMealPlans()
  }, [])

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Popular Meal Plans</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our chef-crafted meal plans designed to meet your nutritional goals and satisfy your taste buds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading
            ? // Skeleton loading state
              Array(3)
                .fill(0)
                .map((_, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="h-48 bg-gray-200">
                      <Skeleton className="h-full w-full" />
                    </div>
                    <CardHeader>
                      <Skeleton className="h-8 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6 mt-1" />
                    </CardHeader>
                    <CardFooter>
                      <Skeleton className="h-10 w-full" />
                    </CardFooter>
                  </Card>
                ))
            : mealPlans.map((plan) => (
                <Card key={plan.id} className="overflow-hidden transition-all duration-300 hover:shadow-lg">
                  <div className="relative h-48">
                    <Image src={plan.image || "/placeholder.svg"} alt={plan.name} fill className="object-cover" />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                    <p className="text-gray-600">{plan.description}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-emerald-600">
                      {plan.price} MAD<span className="text-sm text-gray-500 font-normal"> / week</span>
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/meal-plans/${plan.id}`} className="w-full">
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700">View Plan</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/meal-plans">
            <Button variant="outline" size="lg" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">
              View All Meal Plans
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
