"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Plus, Trash2, Edit } from "lucide-react"
import Image from "next/image"

interface PlanVariant {
  id: number
  label: string
  days_per_week: number
  meals_per_day: number
  weekly_price_mad: number
  published: boolean
}

interface Meal {
  id: number
  title: string
  meal_type: "Breakfast" | "Lunch" | "Dinner" | "Snack" | null
  image_url?: string
}

interface MealAssignment {
  id: number
  plan_variant_id: number
  variant_label: string
  day_index: number
  slot_index: number
  meal_id: number
  meal_title: string
  meal_type: string | null
  meal_image_url?: string
}

interface MealAssignmentSectionProps {
  mealPlanId: string
  variants: PlanVariant[]
  onRefresh?: () => void
}

export function MealAssignmentSection({ mealPlanId, variants, onRefresh }: MealAssignmentSectionProps) {
  const [assignments, setAssignments] = useState<MealAssignment[]>([])
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
  const [selectedMeal, setSelectedMeal] = useState<number | null>(null)
  const [mealTypeFilter, setMealTypeFilter] = useState<string>("all")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchAssignments()
    fetchMeals()
  }, [mealPlanId])

  const fetchAssignments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/products/meal-plans/${mealPlanId}/meals`)
      const data = await response.json()

      if (response.ok && data.success) {
        setAssignments(data.assignments || [])
      } else {
        setError(data.error || "Failed to load assignments")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load assignments")
    } finally {
      setLoading(false)
    }
  }

  const fetchMeals = async () => {
    try {
      const response = await fetch("/api/admin/products/meals")
      const data = await response.json()

      if (response.ok && data.success) {
        setMeals(data.meals || [])
      }
    } catch (err) {
      console.error("Failed to fetch meals:", err)
    }
  }

  const handleAssignMeal = (variantId: number, dayIndex: number, slotIndex: number) => {
    setSelectedVariant(variantId)
    setSelectedDay(dayIndex)
    setSelectedSlot(slotIndex)
    
    // Find existing assignment for this slot
    const existing = assignments.find(
      (a) => a.plan_variant_id === variantId && a.day_index === dayIndex && a.slot_index === slotIndex
    )
    setSelectedMeal(existing?.meal_id || null)
    
    setIsAssignModalOpen(true)
  }

  const handleSaveAssignment = async () => {
    if (!selectedVariant || selectedDay === null || selectedSlot === null || !selectedMeal) {
      setError("Please select all required fields")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch(`/api/admin/products/meal-plans/${mealPlanId}/meals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignments: [
            {
              plan_variant_id: selectedVariant,
              day_index: selectedDay,
              slot_index: selectedSlot,
              meal_id: selectedMeal,
            },
          ],
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setIsAssignModalOpen(false)
        setSelectedVariant(null)
        setSelectedDay(null)
        setSelectedSlot(null)
        setSelectedMeal(null)
        fetchAssignments()
        onRefresh?.()
      } else {
        setError(data.error || "Failed to assign meal")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign meal")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAssignment = async (assignmentId: number) => {
    if (!confirm("Are you sure you want to remove this meal assignment?")) return

    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch(
        `/api/admin/products/meal-plans/${mealPlanId}/meals/${assignmentId}`,
        {
          method: "DELETE",
        }
      )

      const data = await response.json()

      if (response.ok && data.success) {
        fetchAssignments()
        onRefresh?.()
      } else {
        setError(data.error || "Failed to delete assignment")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete assignment")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getMealForSlot = (variantId: number, dayIndex: number, slotIndex: number) => {
    return assignments.find(
      (a) => a.plan_variant_id === variantId && a.day_index === dayIndex && a.slot_index === slotIndex
    )
  }

  const getMealTypeLabel = (slotIndex: number, mealsPerDay: number): string => {
    if (mealsPerDay === 1) return "Meal"
    if (mealsPerDay === 2) return slotIndex === 0 ? "Breakfast" : "Dinner"
    if (mealsPerDay === 3) {
      if (slotIndex === 0) return "Breakfast"
      if (slotIndex === 1) return "Lunch"
      return "Dinner"
    }
    if (mealsPerDay === 4) {
      if (slotIndex === 0) return "Breakfast"
      if (slotIndex === 1) return "Lunch"
      if (slotIndex === 2) return "Dinner"
      return "Snack"
    }
    // 5 meals
    if (slotIndex === 0) return "Breakfast"
    if (slotIndex === 1) return "Snack"
    if (slotIndex === 2) return "Lunch"
    if (slotIndex === 3) return "Snack"
    return "Dinner"
  }

  const filteredMeals = meals.filter((meal) => {
    if (mealTypeFilter === "all") return true
    return meal.meal_type === mealTypeFilter
  })

  const activeVariants = variants.filter((v) => v.published)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Meal Assignments</CardTitle>
          <CardDescription>
            Assign specific meals to each day and meal slot for each variant. Click on a slot to assign or change a meal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {activeVariants.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No active variants. Please create and activate variants first.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {activeVariants.map((variant) => (
                <div key={variant.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{variant.label}</h3>
                      <p className="text-sm text-gray-500">
                        {variant.days_per_week} days/week × {variant.meals_per_day} meals/day
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Day</TableHead>
                          {Array.from({ length: variant.meals_per_day }).map((_, slotIdx) => (
                            <TableHead key={slotIdx} className="text-center">
                              {getMealTypeLabel(slotIdx, variant.meals_per_day)}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.from({ length: variant.days_per_week }).map((_, dayIdx) => (
                          <TableRow key={dayIdx}>
                            <TableCell className="font-medium">Day {dayIdx + 1}</TableCell>
                            {Array.from({ length: variant.meals_per_day }).map((_, slotIdx) => {
                              const assignment = getMealForSlot(variant.id, dayIdx, slotIdx)
                              return (
                                <TableCell key={slotIdx} className="text-center">
                                  {assignment ? (
                                    <div className="flex flex-col items-center gap-2">
                                      {assignment.meal_image_url && (
                                        <Image
                                          src={assignment.meal_image_url}
                                          alt={assignment.meal_title}
                                          width={40}
                                          height={40}
                                          className="rounded object-cover"
                                        />
                                      )}
                                      <span className="text-xs font-medium">{assignment.meal_title}</span>
                                      {assignment.meal_type && (
                                        <Badge variant="outline" className="text-xs">
                                          {assignment.meal_type}
                                        </Badge>
                                      )}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleAssignMeal(variant.id, dayIdx, slotIdx)}
                                        className="h-6 text-xs"
                                      >
                                        <Edit className="h-3 w-3 mr-1" />
                                        Change
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteAssignment(assignment.id)}
                                        disabled={isSubmitting}
                                        className="h-6 text-xs text-red-600 hover:text-red-700"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleAssignMeal(variant.id, dayIdx, slotIdx)}
                                      className="w-full"
                                    >
                                      <Plus className="h-4 w-4 mr-1" />
                                      Assign
                                    </Button>
                                  )}
                                </TableCell>
                              )
                            })}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign Meal Modal */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Meal</DialogTitle>
            <DialogDescription>
              Select a meal to assign to this slot. Filter by meal type to find appropriate meals.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Filter by Meal Type</label>
              <Select value={mealTypeFilter} onValueChange={setMealTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Breakfast">Breakfast</SelectItem>
                  <SelectItem value="Lunch">Lunch</SelectItem>
                  <SelectItem value="Dinner">Dinner</SelectItem>
                  <SelectItem value="Snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Select Meal</label>
              <div className="max-h-60 overflow-y-auto border rounded-md p-2">
                {filteredMeals.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No meals available</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {filteredMeals.map((meal) => (
                      <button
                        key={meal.id}
                        type="button"
                        onClick={() => setSelectedMeal(meal.id)}
                        className={`p-3 border rounded-md text-left hover:bg-gray-50 transition-colors ${
                          selectedMeal === meal.id ? "border-blue-500 bg-blue-50" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {meal.image_url && (
                            <Image
                              src={meal.image_url}
                              alt={meal.title}
                              width={40}
                              height={40}
                              className="rounded object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{meal.title}</p>
                            {meal.meal_type && (
                              <Badge variant="outline" className="text-xs mt-1">
                                {meal.meal_type}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSaveAssignment} disabled={isSubmitting || !selectedMeal}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Assign Meal"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

