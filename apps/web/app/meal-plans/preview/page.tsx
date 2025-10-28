"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Calendar, Clock, Utensils } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import type { MealPreferences } from "@/app/meal-customization/actions"

export default function MealPlanPreviewPage() {
  const [preferences, setPreferences] = useState<MealPreferences | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real application, you would fetch this from the server
    // For now, we'll retrieve it from the cookie
    const getCookieValue = (name: string) => {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop()?.split(";").shift()
      return null
    }

    const preferencesJson = getCookieValue("meal_preferences")
    if (preferencesJson) {
      try {
        setPreferences(JSON.parse(preferencesJson))
      } catch (e) {
        console.error("Error parsing preferences:", e)
      }
    }
    setLoading(false)
  }, [])

  // Sample meal data - in a real app, this would be generated based on preferences
  const mealsByDay = [
    {
      day: "Monday",
      meals: [
        {
          type: "Breakfast",
          name: "Greek Yogurt Parfait",
          description: "Greek yogurt with mixed berries, honey, and granola",
          calories: 280,
          protein: 15,
          carbs: 40,
          fat: 8,
          image: "/meals/yogurt-parfait.jpg",
        },
        {
          type: "Lunch",
          name: "Grilled Chicken Salad",
          description: "Fresh mixed greens with grilled chicken breast, cherry tomatoes, and balsamic vinaigrette",
          calories: 350,
          protein: 35,
          carbs: 15,
          fat: 18,
          image: "/meals/grilled-chicken-salad.jpg",
        },
        {
          type: "Dinner",
          name: "Salmon with Quinoa",
          description: "Baked salmon fillet with lemon herb quinoa and steamed broccoli",
          calories: 420,
          protein: 32,
          carbs: 30,
          fat: 20,
          image: "/meals/salmon-quinoa.jpg",
        },
      ],
    },
    {
      day: "Tuesday",
      meals: [
        {
          type: "Breakfast",
          name: "Protein Pancakes",
          description: "Fluffy protein-packed pancakes with fresh berries and sugar-free syrup",
          calories: 340,
          protein: 25,
          carbs: 30,
          fat: 12,
          image: "/meals/protein-pancakes.jpg",
        },
        {
          type: "Lunch",
          name: "Turkey Meatballs",
          description: "Lean turkey meatballs with zucchini noodles and homemade marinara sauce",
          calories: 380,
          protein: 28,
          carbs: 22,
          fat: 19,
          image: "/meals/turkey-meatballs.jpg",
        },
        {
          type: "Dinner",
          name: "Vegetable Stir Fry",
          description: "Mixed vegetables stir-fried with tofu in a light ginger sauce",
          calories: 320,
          protein: 18,
          carbs: 35,
          fat: 14,
          image: "/meals/vegetable-stir-fry.jpg",
        },
      ],
    },
    {
      day: "Wednesday",
      meals: [
        {
          type: "Breakfast",
          name: "Egg White Omelette",
          description: "Fluffy egg white omelette with spinach, mushrooms, and feta cheese",
          calories: 250,
          protein: 22,
          carbs: 8,
          fat: 14,
          image: "/meals/egg-white-omelette.jpg",
        },
        {
          type: "Lunch",
          name: "Chicken Quinoa Bowl",
          description: "Grilled chicken with quinoa, roasted vegetables, and tahini dressing",
          calories: 420,
          protein: 35,
          carbs: 45,
          fat: 12,
          image: "/meals/chicken-quinoa-bowl.jpg",
        },
        {
          type: "Dinner",
          name: "Beef and Broccoli",
          description: "Lean beef strips with broccoli in a savory sauce with brown rice",
          calories: 450,
          protein: 30,
          carbs: 40,
          fat: 15,
          image: "/meals/beef-broccoli.jpg",
        },
      ],
    },
    {
      day: "Thursday",
      meals: [
        {
          type: "Breakfast",
          name: "Greek Yogurt Parfait",
          description: "Greek yogurt with mixed berries, honey, and granola",
          calories: 280,
          protein: 15,
          carbs: 40,
          fat: 8,
          image: "/meals/yogurt-parfait.jpg",
        },
        {
          type: "Lunch",
          name: "Tuna Avocado Wrap",
          description: "Tuna salad with avocado and mixed greens in a whole grain wrap",
          calories: 380,
          protein: 28,
          carbs: 30,
          fat: 18,
          image: "/meals/tuna-avocado-wrap.jpg",
        },
        {
          type: "Dinner",
          name: "Turkey Meatballs",
          description: "Lean turkey meatballs with zucchini noodles and homemade marinara sauce",
          calories: 380,
          protein: 28,
          carbs: 22,
          fat: 19,
          image: "/meals/turkey-meatballs.jpg",
        },
      ],
    },
    {
      day: "Friday",
      meals: [
        {
          type: "Breakfast",
          name: "Protein Pancakes",
          description: "Fluffy protein-packed pancakes with fresh berries and sugar-free syrup",
          calories: 340,
          protein: 25,
          carbs: 30,
          fat: 12,
          image: "/meals/protein-pancakes.jpg",
        },
        {
          type: "Lunch",
          name: "Grilled Chicken Salad",
          description: "Fresh mixed greens with grilled chicken breast, cherry tomatoes, and balsamic vinaigrette",
          calories: 350,
          protein: 35,
          carbs: 15,
          fat: 18,
          image: "/meals/grilled-chicken-salad.jpg",
        },
        {
          type: "Dinner",
          name: "Salmon with Quinoa",
          description: "Baked salmon fillet with lemon herb quinoa and steamed broccoli",
          calories: 420,
          protein: 32,
          carbs: 30,
          fat: 20,
          image: "/meals/salmon-quinoa.jpg",
        },
      ],
    },
  ]

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 md:px-6 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-12"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 rounded-lg p-6 h-64"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!preferences) {
    return (
      <div className="container mx-auto px-4 py-12 md:px-6 text-center">
        <h1 className="text-3xl font-bold mb-4">No Meal Plan Found</h1>
        <p className="text-gray-600 mb-8">You haven't customized a meal plan yet. Please go back and create one.</p>
        <Link href="/meal-customization">
          <Button className="bg-green-600 hover:bg-green-700">Create Meal Plan</Button>
        </Link>
      </div>
    )
  }

  const getPlanName = () => {
    switch (preferences.planType) {
      case "weight_loss":
        return "Weight Loss"
      case "balanced":
        return "Balanced Nutrition"
      case "muscle_gain":
        return "Muscle Gain"
      case "keto":
        return "Keto"
      default:
        return "Custom"
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Customized Meal Plan</h1>
            <p className="text-gray-600">
              Here's a preview of your {getPlanName()} meal plan based on your preferences
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-2">
            <Link href="/meal-customization">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Edit Preferences
              </Button>
            </Link>
            <Link href="/checkout">
              <Button className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-full">
                  <Utensils className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Meal Plan</div>
                  <div className="font-medium">{getPlanName()}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-full">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Delivery Schedule</div>
                  <div className="font-medium">
                    {preferences.daysPerWeek === 5 ? "5 Days (Mon-Fri)" : "7 Days (Full Week)"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Meals Per Day</div>
                  <div className="font-medium">{preferences.mealsPerDay} meals</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="monday" className="w-full">
        <TabsList className="grid grid-cols-5 mb-8">
          <TabsTrigger value="monday">Monday</TabsTrigger>
          <TabsTrigger value="tuesday">Tuesday</TabsTrigger>
          <TabsTrigger value="wednesday">Wednesday</TabsTrigger>
          <TabsTrigger value="thursday">Thursday</TabsTrigger>
          <TabsTrigger value="friday">Friday</TabsTrigger>
        </TabsList>

        {mealsByDay.map((dayMeals, index) => (
          <TabsContent key={index} value={dayMeals.day.toLowerCase()}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {dayMeals.meals.slice(0, preferences.mealsPerDay).map((meal, mealIndex) => (
                <Card key={mealIndex} className="overflow-hidden">
                  <div className="h-48 overflow-hidden">
                    <img
                      src={meal.image || "/placeholder.svg?height=200&width=400&query=healthy food"}
                      alt={meal.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge variant="outline" className="mb-2">
                          {meal.type}
                        </Badge>
                        <CardTitle className="text-xl">{meal.name}</CardTitle>
                      </div>
                      <Badge className="bg-green-600">{meal.calories} cal</Badge>
                    </div>
                    <CardDescription>{meal.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="text-sm text-gray-500">Protein</div>
                        <div className="font-medium">{meal.protein}g</div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="text-sm text-gray-500">Carbs</div>
                        <div className="font-medium">{meal.carbs}g</div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="text-sm text-gray-500">Fat</div>
                        <div className="font-medium">{meal.fat}g</div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      Swap Meal
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div className="mt-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Start Your Healthy Journey?</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-6">
          Your customized meal plan is ready. Proceed to checkout to start receiving delicious, nutritious meals
          tailored to your preferences.
        </p>
        <Link href="/checkout">
          <Button size="lg" className="bg-green-600 hover:bg-green-700">
            Proceed to Checkout
          </Button>
        </Link>
      </div>
    </div>
  )
}
