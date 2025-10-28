"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Clock, Utensils, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { calculateMealNutrition, type MealIngredient } from "@/lib/macro-calculator"

interface Meal {
  id: number
  name: string
  description: string
  calories: number
  protein: number
  carbs: number
  fat: number
  imageUrl: string
  tags: string[]
  mealType: string
  dietaryInfo: string[]
  ingredients?: MealIngredient[]
  nutrition?: { calories: number; protein: number; carbs: number; fat: number }
}

export default function MealDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [meal, setMeal] = useState<Meal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMeal = async () => {
      try {
        // In a real app, this would be an API call
        // For now, we'll use mock data
        const mockMeals: Meal[] = [
          {
            id: 1,
            name: "Grilled Chicken & Vegetable Medley",
            description: "Tender grilled chicken breast with a colorful mix of roasted vegetables and quinoa.",
            ingredients: [
              { ingredientId: "chicken-breast", amount: 120, displayText: "4 oz grilled chicken breast (~120g)" },
              { ingredientId: "broccoli", amount: 150, displayText: "1 cup steamed broccoli (~150g)" },
              { ingredientId: "carrots", amount: 80, displayText: "1/2 cup roasted carrots (~80g)" },
              { ingredientId: "zucchini", amount: 100, displayText: "1/2 cup grilled zucchini (~100g)" },
              { ingredientId: "quinoa-cooked", amount: 80, displayText: "1/3 cup cooked quinoa (~80g)" },
              { ingredientId: "olive-oil", amount: 8, displayText: "2 tsp olive oil (~8g)" },
            ] as MealIngredient[],
            get nutrition() {
              return calculateMealNutrition(this.ingredients!)
            },
            get calories() {
              return this.nutrition!.calories
            },
            get protein() {
              return this.nutrition!.protein
            },
            get carbs() {
              return this.nutrition!.carbs
            },
            get fat() {
              return this.nutrition!.fat
            },
            imageUrl: "/grilled-chicken-vegetable-medley.png",
            tags: ["high-protein", "balanced"],
            mealType: "lunch",
            dietaryInfo: ["gluten-free"],
          },
        ]

        const foundMeal = mockMeals.find((m) => m.id === Number.parseInt(params.id))

        if (foundMeal) {
          setMeal(foundMeal)
        } else {
          setError("Meal not found")
        }

        setLoading(false)
      } catch (error) {
        console.error("Error fetching meal:", error)
        setError("Failed to load meal details")
        setLoading(false)
      }
    }

    fetchMeal()
  }, [params.id])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 md:px-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !meal) {
    return (
      <div className="container mx-auto px-4 py-12 md:px-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-gray-600 mb-6">{error || "Meal not found"}</p>
        <Link href="/meals">
          <Button>Back to Meals</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <Link href="/meals" className="flex items-center text-green-600 hover:text-green-700 mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Meals
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="rounded-lg overflow-hidden mb-6">
            <img src={meal.imageUrl || "/placeholder.svg"} alt={meal.name} className="w-full h-auto object-cover" />
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <Badge className="capitalize">{meal.mealType}</Badge>
            {meal.dietaryInfo.map((info) => (
              <Badge key={info} variant="outline" className="capitalize">
                {info.replace("-", " ")}
              </Badge>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded text-center">
              <div className="text-sm text-gray-500">Calories</div>
              <div className="font-medium text-xl">{meal.calories}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded text-center">
              <div className="text-sm text-gray-500">Protein</div>
              <div className="font-medium text-xl">{meal.protein}g</div>
            </div>
            <div className="bg-gray-50 p-4 rounded text-center">
              <div className="text-sm text-gray-500">Carbs</div>
              <div className="font-medium text-xl">{meal.carbs}g</div>
            </div>
            <div className="bg-gray-50 p-4 rounded text-center">
              <div className="text-sm text-gray-500">Fat</div>
              <div className="font-medium text-xl">{meal.fat}g</div>
            </div>
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">{meal.name}</h1>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center text-gray-600">
              <Utensils className="h-4 w-4 mr-1" />
              <span className="capitalize">{meal.mealType}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="h-4 w-4 mr-1" />
              <span>Ready to eat</span>
            </div>
          </div>

          <p className="text-gray-700 mb-6">{meal.description}</p>

          <Separator className="mb-6" />

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {meal.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="capitalize">
                  {tag.replace("-", " ")}
                </Badge>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Nutritional Benefits</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>High in lean protein to support muscle growth and recovery</li>
              <li>Complex carbohydrates for sustained energy</li>
              <li>Essential vitamins and minerals from fresh vegetables</li>
              <li>Balanced macronutrients for optimal nutrition</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <Button className="flex-1 bg-green-600 hover:bg-green-700">Add to My Meals</Button>
            <Button variant="outline" className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
