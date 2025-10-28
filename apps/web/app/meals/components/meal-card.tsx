"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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
}

interface MealCardProps {
  meal: Meal
  onViewDetails: (meal: Meal) => void
}

export function MealCard({ meal, onViewDetails }: MealCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-48 overflow-hidden">
        <img
          src={meal.imageUrl || "/placeholder.svg"}
          alt={meal.name}
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
        <div className="absolute top-2 right-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-white/80 hover:bg-white"
                  onClick={(e) => {
                    e.stopPropagation()
                    onViewDetails(meal)
                  }}
                >
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View details</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Badge className="absolute bottom-2 left-2 capitalize" variant="secondary">
          {meal.mealType}
        </Badge>
        <Badge className="absolute bottom-2 right-2" variant="outline">
          {meal.calories} cal
        </Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{meal.name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{meal.description}</p>
        <div className="flex justify-between text-sm">
          <div>
            <span className="text-gray-500">Protein:</span> {meal.protein}g
          </div>
          <div>
            <span className="text-gray-500">Carbs:</span> {meal.carbs}g
          </div>
          <div>
            <span className="text-gray-500">Fat:</span> {meal.fat}g
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <div className="flex flex-wrap gap-1">
          {meal.dietaryInfo.slice(0, 2).map((info) => (
            <Badge key={info} variant="outline" className="text-xs capitalize">
              {info.replace("-", " ")}
            </Badge>
          ))}
          {meal.dietaryInfo.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{meal.dietaryInfo.length - 2}
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewDetails(meal)}
          className="text-green-600 hover:text-green-700 hover:bg-green-50"
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  )
}
