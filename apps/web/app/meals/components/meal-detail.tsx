"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
  planVariations?: {
    muscleGain: {
      calories: number
      protein: number
      carbs: number
      fat: number
      ingredients: string[]
    }
    weightLoss: {
      calories: number
      protein: number
      carbs: number
      fat: number
      ingredients: string[]
    }
    stayFit: {
      calories: number
      protein: number
      carbs: number
      fat: number
      ingredients: string[]
    }
  }
}

interface MealDetailProps {
  meal: Meal | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddToMeals?: () => void
}

export function MealDetail({ meal, open, onOpenChange, onAddToMeals }: MealDetailProps) {
  if (!meal) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{meal.name}</SheetTitle>
        </SheetHeader>
        <div className="py-4">
          <div className="aspect-video w-full overflow-hidden rounded-lg mb-4">
            <img src={meal.imageUrl || "/placeholder.svg"} alt={meal.name} className="h-full w-full object-cover" />
          </div>

          <p className="text-gray-700 mb-4">{meal.description}</p>

          {meal.planVariations ? (
            <div className="space-y-4">
              <h3 className="font-medium mb-2">Plan Variations</h3>
              <Tabs defaultValue="muscleGain" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="muscleGain">Muscle Gain</TabsTrigger>
                  <TabsTrigger value="weightLoss">Weight Loss</TabsTrigger>
                  <TabsTrigger value="stayFit">Stay Fit</TabsTrigger>
                </TabsList>

                <TabsContent value="muscleGain" className="space-y-4">
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="bg-gray-50 p-2 rounded text-center">
                      <div className="text-sm text-gray-500">Calories</div>
                      <div className="font-medium">{meal.planVariations.muscleGain.calories}</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded text-center">
                      <div className="text-sm text-gray-500">Protein</div>
                      <div className="font-medium">{meal.planVariations.muscleGain.protein}g</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded text-center">
                      <div className="text-sm text-gray-500">Carbs</div>
                      <div className="font-medium">{meal.planVariations.muscleGain.carbs}g</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded text-center">
                      <div className="text-sm text-gray-500">Fat</div>
                      <div className="font-medium">{meal.planVariations.muscleGain.fat}g</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Ingredients & Measurements:</h4>
                    <ul className="space-y-1 text-sm">
                      {meal.planVariations.muscleGain.ingredients.map((ingredient, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-2 h-2 bg-[#015033] rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {ingredient}
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="weightLoss" className="space-y-4">
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="bg-gray-50 p-2 rounded text-center">
                      <div className="text-sm text-gray-500">Calories</div>
                      <div className="font-medium">{meal.planVariations.weightLoss.calories}</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded text-center">
                      <div className="text-sm text-gray-500">Protein</div>
                      <div className="font-medium">{meal.planVariations.weightLoss.protein}g</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded text-center">
                      <div className="text-sm text-gray-500">Carbs</div>
                      <div className="font-medium">{meal.planVariations.weightLoss.carbs}g</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded text-center">
                      <div className="text-sm text-gray-500">Fat</div>
                      <div className="font-medium">{meal.planVariations.weightLoss.fat}g</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Ingredients & Measurements:</h4>
                    <ul className="space-y-1 text-sm">
                      {meal.planVariations.weightLoss.ingredients.map((ingredient, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-2 h-2 bg-[#015033] rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {ingredient}
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="stayFit" className="space-y-4">
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="bg-gray-50 p-2 rounded text-center">
                      <div className="text-sm text-gray-500">Calories</div>
                      <div className="font-medium">{meal.planVariations.stayFit.calories}</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded text-center">
                      <div className="text-sm text-gray-500">Protein</div>
                      <div className="font-medium">{meal.planVariations.stayFit.protein}g</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded text-center">
                      <div className="text-sm text-gray-500">Carbs</div>
                      <div className="font-medium">{meal.planVariations.stayFit.carbs}g</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded text-center">
                      <div className="text-sm text-gray-500">Fat</div>
                      <div className="font-medium">{meal.planVariations.stayFit.fat}g</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Ingredients & Measurements:</h4>
                    <ul className="space-y-1 text-sm">
                      {meal.planVariations.stayFit.ingredients.map((ingredient, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-2 h-2 bg-[#015033] rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {ingredient}
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 mb-6">
              <div className="bg-gray-50 p-2 rounded text-center">
                <div className="text-sm text-gray-500">Calories</div>
                <div className="font-medium">{meal.calories}</div>
              </div>
              <div className="bg-gray-50 p-2 rounded text-center">
                <div className="text-sm text-gray-500">Protein</div>
                <div className="font-medium">{meal.protein}g</div>
              </div>
              <div className="bg-gray-50 p-2 rounded text-center">
                <div className="text-sm text-gray-500">Carbs</div>
                <div className="font-medium">{meal.carbs}g</div>
              </div>
              <div className="bg-gray-50 p-2 rounded text-center">
                <div className="text-sm text-gray-500">Fat</div>
                <div className="font-medium">{meal.fat}g</div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Meal Type</h3>
              <Badge className="capitalize">{meal.mealType}</Badge>
            </div>

            <div>
              <h3 className="font-medium mb-2">Dietary Information</h3>
              <div className="flex flex-wrap gap-2">
                {meal.dietaryInfo.map((info) => (
                  <Badge key={info} variant="outline" className="capitalize">
                    {info.replace("-", " ")}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {meal.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="capitalize">
                    {tag.replace("-", " ")}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
        <SheetFooter>
          <Button className="w-full bg-[#015033] hover:bg-[#013d28]" onClick={onAddToMeals}>
            Add to My Meals
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
