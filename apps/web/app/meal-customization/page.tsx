"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { saveMealPreferences } from "./actions"

export default function MealCustomizationPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState("weight_loss")
  const [calorieRange, setCalorieRange] = useState([1500])
  const [mealFrequency, setMealFrequency] = useState("3")
  const [daysPerWeek, setDaysPerWeek] = useState("5")
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([])
  const [allergies, setAllergies] = useState<string[]>([])
  const [excludedIngredients, setExcludedIngredients] = useState<string[]>([])
  const [newExcludedIngredient, setNewExcludedIngredient] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const dietaryOptions = [
    { value: "vegetarian", label: "Vegetarian" },
    { value: "vegan", label: "Vegan" },
    { value: "pescatarian", label: "Pescatarian" },
    { value: "gluten_free", label: "Gluten Free" },
    { value: "dairy_free", label: "Dairy Free" },
    { value: "low_carb", label: "Low Carb" },
    { value: "high_protein", label: "High Protein" },
  ]

  const allergyOptions = [
    { value: "nuts", label: "Nuts" },
    { value: "shellfish", label: "Shellfish" },
    { value: "eggs", label: "Eggs" },
    { value: "soy", label: "Soy" },
    { value: "wheat", label: "Wheat" },
    { value: "fish", label: "Fish" },
    { value: "dairy", label: "Dairy" },
  ]

  const toggleDietaryPreference = (value: string) => {
    if (dietaryPreferences.includes(value)) {
      setDietaryPreferences(dietaryPreferences.filter((item) => item !== value))
    } else {
      setDietaryPreferences([...dietaryPreferences, value])
    }
  }

  const toggleAllergy = (value: string) => {
    if (allergies.includes(value)) {
      setAllergies(allergies.filter((item) => item !== value))
    } else {
      setAllergies([...allergies, value])
    }
  }

  const addExcludedIngredient = () => {
    if (newExcludedIngredient.trim() && !excludedIngredients.includes(newExcludedIngredient.trim())) {
      setExcludedIngredients([...excludedIngredients, newExcludedIngredient.trim()])
      setNewExcludedIngredient("")
    }
  }

  const removeExcludedIngredient = (ingredient: string) => {
    setExcludedIngredients(excludedIngredients.filter((item) => item !== ingredient))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const preferences = {
        planType: selectedPlan,
        calorieTarget: calorieRange[0],
        mealsPerDay: Number.parseInt(mealFrequency),
        daysPerWeek: Number.parseInt(daysPerWeek),
        dietaryPreferences,
        allergies,
        excludedIngredients,
      }

      await saveMealPreferences(preferences)
      router.push("/meal-plans/preview")
    } catch (error) {
      console.error("Error saving preferences:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Customize Your Meal Plan</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Tailor your meal plan to your specific needs and preferences. Our chefs will prepare meals that match your
          requirements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Plan Selection</CardTitle>
              <CardDescription>Choose your base meal plan</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="weight_loss" onValueChange={setSelectedPlan} className="w-full">
                <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-4">
                  <TabsTrigger value="weight_loss">Weight Loss</TabsTrigger>
                  <TabsTrigger value="balanced">Balanced</TabsTrigger>
                  <TabsTrigger value="muscle_gain">Muscle Gain</TabsTrigger>
                  <TabsTrigger value="keto">Keto</TabsTrigger>
                </TabsList>

                <TabsContent value="weight_loss">
                  <div className="space-y-4">
                    <h3 className="font-medium">Weight Loss Plan</h3>
                    <p className="text-sm text-gray-600">
                      Designed to help you lose weight while maintaining energy and satisfaction. Calorie-controlled
                      portions with high protein content to keep you full.
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge>1200-1500 calories</Badge>
                      <Badge variant="outline">High Protein</Badge>
                      <Badge variant="outline">Low Carb</Badge>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="balanced">
                  <div className="space-y-4">
                    <h3 className="font-medium">Balanced Nutrition Plan</h3>
                    <p className="text-sm text-gray-600">
                      Perfect for maintaining a healthy lifestyle with balanced macronutrients. Ideal for those looking
                      to maintain weight and energy levels.
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge>1800-2000 calories</Badge>
                      <Badge variant="outline">Balanced Macros</Badge>
                      <Badge variant="outline">Nutrient Dense</Badge>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="muscle_gain">
                  <div className="space-y-4">
                    <h3 className="font-medium">Muscle Gain Plan</h3>
                    <p className="text-sm text-gray-600">
                      High protein meals to support muscle growth and recovery after workouts. Includes complex
                      carbohydrates for sustained energy.
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge>2500-2800 calories</Badge>
                      <Badge variant="outline">High Protein</Badge>
                      <Badge variant="outline">Performance</Badge>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="keto">
                  <div className="space-y-4">
                    <h3 className="font-medium">Keto Plan</h3>
                    <p className="text-sm text-gray-600">
                      Low-carb, high-fat meals designed to keep you in ketosis. Helps with fat loss while maintaining
                      muscle mass.
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge>1600-1800 calories</Badge>
                      <Badge variant="outline">Low Carb</Badge>
                      <Badge variant="outline">High Fat</Badge>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Calorie Target</CardTitle>
              <CardDescription>Adjust your daily calorie intake</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Slider
                  defaultValue={[1500]}
                  max={3000}
                  min={1000}
                  step={50}
                  onValueChange={setCalorieRange}
                  className="py-4"
                />
                <div className="text-center font-medium text-lg">{calorieRange[0]} calories per day</div>
                <div className="text-sm text-gray-600 text-center">
                  Move the slider to adjust your daily calorie target. Our nutritionists recommend between 1200-2800
                  calories depending on your goals and activity level.
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Meal Frequency</CardTitle>
              <CardDescription>Choose how many meals you want per day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  className={`border rounded-lg p-4 text-center cursor-pointer transition-colors ${
                    mealFrequency === "2" ? "bg-green-50 border-green-500" : ""
                  }`}
                  onClick={() => setMealFrequency("2")}
                >
                  <div className="font-medium mb-2">2 Meals</div>
                  <div className="text-sm text-gray-600">Lunch & Dinner</div>
                </div>
                <div
                  className={`border rounded-lg p-4 text-center cursor-pointer transition-colors ${
                    mealFrequency === "3" ? "bg-green-50 border-green-500" : ""
                  }`}
                  onClick={() => setMealFrequency("3")}
                >
                  <div className="font-medium mb-2">3 Meals</div>
                  <div className="text-sm text-gray-600">Breakfast, Lunch & Dinner</div>
                </div>
                <div
                  className={`border rounded-lg p-4 text-center cursor-pointer transition-colors ${
                    mealFrequency === "5" ? "bg-green-50 border-green-500" : ""
                  }`}
                  onClick={() => setMealFrequency("5")}
                >
                  <div className="font-medium mb-2">5 Meals</div>
                  <div className="text-sm text-gray-600">3 Meals + 2 Snacks</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delivery Schedule</CardTitle>
              <CardDescription>Choose how many days per week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className={`border rounded-lg p-4 text-center cursor-pointer transition-colors ${
                    daysPerWeek === "5" ? "bg-green-50 border-green-500" : ""
                  }`}
                  onClick={() => setDaysPerWeek("5")}
                >
                  <div className="font-medium mb-2">5 Days</div>
                  <div className="text-sm text-gray-600">Monday to Friday</div>
                </div>
                <div
                  className={`border rounded-lg p-4 text-center cursor-pointer transition-colors ${
                    daysPerWeek === "7" ? "bg-green-50 border-green-500" : ""
                  }`}
                  onClick={() => setDaysPerWeek("7")}
                >
                  <div className="font-medium mb-2">7 Days</div>
                  <div className="text-sm text-gray-600">Full Week Coverage</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dietary Preferences</CardTitle>
              <CardDescription>Select any dietary preferences you have</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {dietaryOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`flex items-center justify-between border rounded-lg p-3 cursor-pointer transition-colors ${
                      dietaryPreferences.includes(option.value) ? "bg-green-50 border-green-500" : ""
                    }`}
                    onClick={() => toggleDietaryPreference(option.value)}
                  >
                    <span>{option.label}</span>
                    {dietaryPreferences.includes(option.value) && <Check className="h-4 w-4 text-green-600" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Allergies</CardTitle>
              <CardDescription>Select any allergies you have</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {allergyOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`flex items-center justify-between border rounded-lg p-3 cursor-pointer transition-colors ${
                      allergies.includes(option.value) ? "bg-green-50 border-green-500" : ""
                    }`}
                    onClick={() => toggleAllergy(option.value)}
                  >
                    <span>{option.label}</span>
                    {allergies.includes(option.value) && <Check className="h-4 w-4 text-green-600" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Excluded Ingredients</CardTitle>
              <CardDescription>Add any ingredients you want to exclude from your meals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter ingredient to exclude"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newExcludedIngredient}
                    onChange={(e) => setNewExcludedIngredient(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addExcludedIngredient()
                      }
                    }}
                  />
                  <Button onClick={addExcludedIngredient}>Add</Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {excludedIngredients.map((ingredient) => (
                    <Badge key={ingredient} variant="secondary" className="flex items-center gap-1">
                      {ingredient}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeExcludedIngredient(ingredient)} />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <Card>
              <CardHeader>
                <CardTitle>Your Plan Summary</CardTitle>
                <CardDescription>Review your customized meal plan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm text-gray-500">Selected Plan</div>
                  <div className="font-medium">
                    {selectedPlan === "weight_loss"
                      ? "Weight Loss"
                      : selectedPlan === "balanced"
                        ? "Balanced Nutrition"
                        : selectedPlan === "muscle_gain"
                          ? "Muscle Gain"
                          : "Keto"}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-gray-500">Calorie Target</div>
                  <div className="font-medium">{calorieRange[0]} calories per day</div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-gray-500">Meal Frequency</div>
                  <div className="font-medium">
                    {mealFrequency === "2"
                      ? "2 Meals per day"
                      : mealFrequency === "3"
                        ? "3 Meals per day"
                        : "5 Meals per day"}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-gray-500">Delivery Schedule</div>
                  <div className="font-medium">{daysPerWeek === "5" ? "5 Days (Mon-Fri)" : "7 Days (Full Week)"}</div>
                </div>

                {dietaryPreferences.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-500">Dietary Preferences</div>
                    <div className="flex flex-wrap gap-1">
                      {dietaryPreferences.map((pref) => (
                        <Badge key={pref} variant="outline">
                          {dietaryOptions.find((o) => o.value === pref)?.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {allergies.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-500">Allergies</div>
                    <div className="flex flex-wrap gap-1">
                      {allergies.map((allergy) => (
                        <Badge key={allergy} variant="outline">
                          {allergyOptions.find((o) => o.value === allergy)?.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {excludedIngredients.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-500">Excluded Ingredients</div>
                    <div className="flex flex-wrap gap-1">
                      {excludedIngredients.map((ingredient) => (
                        <Badge key={ingredient} variant="outline">
                          {ingredient}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="flex justify-between mb-2">
                    <span>Base Plan Price:</span>
                    <span className="font-medium">
                      {daysPerWeek === "5"
                        ? selectedPlan === "weight_loss"
                          ? "349"
                          : selectedPlan === "balanced"
                            ? "399"
                            : selectedPlan === "muscle_gain"
                              ? "449"
                              : "429"
                        : selectedPlan === "weight_loss"
                          ? "489"
                          : selectedPlan === "balanced"
                            ? "559"
                            : selectedPlan === "muscle_gain"
                              ? "629"
                              : "599"}{" "}
                      MAD/week
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Customization:</span>
                    <span className="font-medium">
                      {(dietaryPreferences.length > 0 || allergies.length > 0 || excludedIngredients.length > 0) &&
                      mealFrequency === "5"
                        ? "+50"
                        : "+0"}{" "}
                      MAD/week
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total:</span>
                    <span>
                      {Number.parseInt(
                        daysPerWeek === "5"
                          ? selectedPlan === "weight_loss"
                            ? "349"
                            : selectedPlan === "balanced"
                              ? "399"
                              : selectedPlan === "muscle_gain"
                                ? "449"
                                : "429"
                          : selectedPlan === "weight_loss"
                            ? "489"
                            : selectedPlan === "balanced"
                              ? "559"
                              : selectedPlan === "muscle_gain"
                                ? "629"
                                : "599",
                      ) +
                        ((dietaryPreferences.length > 0 || allergies.length > 0 || excludedIngredients.length > 0) &&
                        mealFrequency === "5"
                          ? 50
                          : 0)}{" "}
                      MAD/week
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Continue to Checkout"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
