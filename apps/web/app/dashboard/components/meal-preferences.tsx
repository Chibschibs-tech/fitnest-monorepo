"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"

export default function MealPreferences() {
  const [successMessage, setSuccessMessage] = useState("")
  const [calorieTarget, setCalorieTarget] = useState([1500])
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>(["high_protein"])
  const [allergies, setAllergies] = useState<string[]>(["nuts"])
  const [excludedIngredients, setExcludedIngredients] = useState<string[]>(["Mushrooms", "Olives"])
  const [newExcludedIngredient, setNewExcludedIngredient] = useState("")

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

  const handleSavePreferences = () => {
    // In a real app, this would send the data to an API
    setSuccessMessage("Your meal preferences have been updated successfully.")
    setTimeout(() => setSuccessMessage(""), 5000)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between md:flex-row md:items-center">
        <h2 className="text-2xl font-bold tracking-tight">Meal Preferences</h2>
        <Button onClick={handleSavePreferences} className="mt-2 md:mt-0 bg-green-600 hover:bg-green-700">
          Save Preferences
        </Button>
      </div>

      {successMessage && (
        <Alert className="bg-green-50 text-green-800 border-green-200">
          <Check className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="dietary" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dietary">Dietary Preferences</TabsTrigger>
          <TabsTrigger value="allergies">Allergies</TabsTrigger>
          <TabsTrigger value="exclusions">Excluded Ingredients</TabsTrigger>
        </TabsList>

        <TabsContent value="dietary" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Calorie Target</CardTitle>
              <CardDescription>Adjust your daily calorie intake</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Slider
                defaultValue={calorieTarget}
                max={3000}
                min={1000}
                step={50}
                onValueChange={setCalorieTarget}
                className="py-4"
              />
              <div className="text-center font-medium text-lg">{calorieTarget[0]} calories per day</div>
              <div className="text-sm text-gray-600 text-center">
                Move the slider to adjust your daily calorie target. Our nutritionists recommend between 1200-2800
                calories depending on your goals and activity level.
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
        </TabsContent>

        <TabsContent value="allergies" className="space-y-4 pt-4">
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
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Our kitchen takes allergies very seriously. We'll ensure your meals are prepared safely.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exclusions" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Excluded Ingredients</CardTitle>
              <CardDescription>Add any ingredients you want to exclude from your meals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">
                  These ingredients will be excluded from your meals whenever possible. Please note that some exclusions
                  may limit the variety of meals available to you.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
