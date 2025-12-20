"use client"

import { useState, useEffect, useMemo } from "react"
// Menu page - updated 2025-12-20
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Check } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { getTranslations } from "@/lib/i18n"

interface Meal {
  id: number
  name: string
  description: string
  mealType: string
  imageUrl: string | null
  calories: number
  protein: number
  carbs: number
  fat: number
  tags: string[]
}

interface MealPlan {
  id: number
  name: string
  description: string
  category: string
  is_active: boolean
}

export default function MenuPage() {
  const { locale } = useLanguage()
  const t = getTranslations(locale)
  const [meals, setMeals] = useState<Meal[]>([])
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<string>("all")
  const [selectedMealType, setSelectedMealType] = useState<string>("all")
  const [displayedCount, setDisplayedCount] = useState(12)

  // Fetch meal plans
  useEffect(() => {
    async function fetchMealPlans() {
      try {
        const response = await fetch("/api/meal-plans")
        const data = await response.json()
        if (data.success && data.mealPlans) {
          setMealPlans(data.mealPlans)
        }
      } catch (error) {
        console.error("Error fetching meal plans:", error)
      }
    }
    fetchMealPlans()
  }, [])

  // Fetch meals
  useEffect(() => {
    async function fetchMeals() {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (selectedMealType !== "all") {
          params.set("type", selectedMealType)
        }
        if (selectedPlan !== "all" && !isNaN(Number(selectedPlan))) {
          params.set("plan_id", selectedPlan)
        }

        const response = await fetch(`/api/meals?${params.toString()}`)
        if (!response.ok) {
          throw new Error("Failed to fetch meals")
        }
        const data = await response.json()
        setMeals(data)
        setDisplayedCount(12)
      } catch (error) {
        console.error("Error fetching meals:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMeals()
  }, [selectedPlan, selectedMealType])

  const displayedMeals = useMemo(() => {
    return meals.slice(0, displayedCount)
  }, [meals, displayedCount])

  const handleLoadMore = () => {
    setDisplayedCount((prev) => Math.min(prev + 12, meals.length))
  }

  const mealTypeOptions = [
    { value: "all", label: locale === "fr" ? "Tous les repas" : "All Meals" },
    { value: "Breakfast", label: locale === "fr" ? "Petit-déjeuner" : "Breakfast" },
    { value: "Lunch", label: locale === "fr" ? "Déjeuner" : "Lunch" },
    { value: "Dinner", label: locale === "fr" ? "Dîner" : "Dinner" },
    { value: "Snack", label: locale === "fr" ? "Collation" : "Snack" },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold text-fitnest-green mb-4">
              {locale === "fr" ? "Menu de cette semaine" : "This Week's Menu"}
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {locale === "fr"
                ? "Découvrez notre sélection de repas sains et équilibrés, préparés quotidiennement par nos chefs avec des ingrédients frais et locaux."
                : "Discover our selection of healthy and balanced meals, prepared daily by our chefs with fresh, locally sourced ingredients."}
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-white border-b sticky top-20 z-40">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Meal Plan Filter */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <span className="text-sm font-medium text-gray-700 mr-2">
                {locale === "fr" ? "Plan:" : "Plan:"}
              </span>
              <button
                onClick={() => setSelectedPlan("all")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedPlan === "all"
                    ? "bg-fitnest-green text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {locale === "fr" ? "Tous" : "All"}
              </button>
              {mealPlans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(String(plan.id))}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedPlan === String(plan.id)
                      ? "bg-fitnest-green text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {plan.name}
                </button>
              ))}
            </div>

            {/* Meal Type Filter */}
            <div className="flex items-center gap-4 w-full md:w-auto">
              <span className="text-sm font-medium text-gray-700">
                {locale === "fr" ? "Type de repas:" : "Meal Type:"}
              </span>
              <Select value={selectedMealType} onValueChange={setSelectedMealType}>
                <SelectTrigger className="w-[180px] rounded-full border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mealTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Meals Grid Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayedMeals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">
                {locale === "fr" ? "Aucun repas trouvé" : "No meals found"}
              </p>
              <Button
                onClick={() => {
                  setSelectedPlan("all")
                  setSelectedMealType("all")
                }}
                variant="outline"
                className="rounded-full border-fitnest-green text-fitnest-green hover:bg-fitnest-green hover:text-white"
              >
                {locale === "fr" ? "Réinitialiser les filtres" : "Reset Filters"}
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayedMeals.map((meal) => (
                  <div
                    key={meal.id}
                    className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    <div className="relative h-48">
                      {meal.imageUrl ? (
                        <Image
                          src={meal.imageUrl}
                          alt={meal.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-sm">
                            {locale === "fr" ? "Pas d'image" : "No image"}
                          </span>
                        </div>
                      )}
                      <Badge className="absolute top-3 right-3 bg-fitnest-orange text-white rounded-full px-3 py-1">
                        {meal.calories} kcal
                      </Badge>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-fitnest-green mb-2">{meal.name}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{meal.description}</p>
                      
                      {/* Nutrition Info */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            {locale === "fr" ? "Protéines" : "Protein"}
                          </span>
                          <span className="font-semibold text-fitnest-green">
                            {Math.round(meal.protein)}g
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            {locale === "fr" ? "Glucides" : "Carbs"}
                          </span>
                          <span className="font-semibold text-fitnest-green">
                            {Math.round(meal.carbs)}g
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            {locale === "fr" ? "Lipides" : "Fat"}
                          </span>
                          <span className="font-semibold text-fitnest-green">
                            {Math.round(meal.fat)}g
                          </span>
                        </div>
                      </div>

                      {/* Tags */}
                      {meal.tags && meal.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {meal.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 bg-fitnest-green/10 text-fitnest-green rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <Link href={`/meals/${meal.id}`}>
                        <Button className="w-full rounded-full bg-fitnest-green text-white hover:bg-fitnest-green/90">
                          {locale === "fr" ? "Voir les détails" : "View Details"}
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {displayedCount < meals.length && (
                <div className="flex justify-center mt-12">
                  <Button
                    onClick={handleLoadMore}
                    variant="outline"
                    className="rounded-full px-8 py-2 border-fitnest-green text-fitnest-green hover:bg-fitnest-green hover:text-white"
                  >
                    {locale === "fr" ? "Charger plus" : "Load More"}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-fitnest-green text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 text-3xl font-bold">
            {locale === "fr"
              ? "Prêt à commencer votre parcours santé ?"
              : "Ready to Start Your Health Journey?"}
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-white/90">
            {locale === "fr"
              ? "Rejoignez-nous dans notre mission de rendre une alimentation saine simple, agréable et partie intégrante de la vie quotidienne. Faites le premier pas vers un vous plus sain dès aujourd'hui."
              : "Join us in our mission to make healthy eating simple, enjoyable, and part of everyday life. Take the first step toward a healthier you today."}
          </p>
          <Link href="/subscribe">
            <Button className="bg-fitnest-orange text-white hover:bg-fitnest-orange/90 rounded-full px-8 py-6 text-lg">
              {locale === "fr" ? "S'abonner maintenant" : "Subscribe Now"}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
