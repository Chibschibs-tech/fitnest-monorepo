"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, Plus, Edit, Trash2, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface MealPlan {
  id: number
  name: string
  description: string
  category: string
  is_available: boolean
}

interface PlanVariant {
  id: number
  label: string
  days_per_week: number
  meals_per_day: number
  weekly_price_mad: number
  published: boolean
}

export function MealPlanDetailContent({ mealPlanId }: { mealPlanId: string }) {
  const router = useRouter()
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null)
  const [variants, setVariants] = useState<PlanVariant[]>([])
  const [loading, setLoading] = useState(true)
  const [variantsLoading, setVariantsLoading] = useState(false)
  const [error, setError] = useState<string>("")

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<PlanVariant | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    label: "",
    days_per_week: 5,
    meals_per_day: 3,
    weekly_price_mad: 0,
    published: true,
  })

  useEffect(() => {
    fetchMealPlan()
    fetchVariants()
  }, [mealPlanId])

  const fetchMealPlan = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/products/meal-plans/${mealPlanId}`)
      const data = await response.json()

      if (response.ok && data.success) {
        setMealPlan(data.mealPlan)
      } else {
        let errorMessage = "Failed to fetch meal plan"
        if (data.error) {
          if (typeof data.error === 'string') {
            errorMessage = data.error
          } else if (data.error.message) {
            errorMessage = data.error.message
          }
        }
        setError(errorMessage)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch meal plan")
    } finally {
      setLoading(false)
    }
  }

  const fetchVariants = async () => {
    try {
      setVariantsLoading(true)
      const response = await fetch(`/api/admin/products/meal-plans/${mealPlanId}/variants`)
      const data = await response.json()

      if (response.ok && data.success) {
        setVariants(data.variants || [])
      } else {
        console.error("Failed to fetch variants:", data.error)
      }
    } catch (err) {
      console.error("Error fetching variants:", err)
    } finally {
      setVariantsLoading(false)
    }
  }

  // Handle create
  const handleCreate = () => {
    setFormData({
      label: "",
      days_per_week: 5,
      meals_per_day: 3,
      weekly_price_mad: 0,
      published: true,
    })
    setSelectedVariant(null)
    setIsCreateModalOpen(true)
  }

  // Handle edit
  const handleEdit = (variant: PlanVariant) => {
    setSelectedVariant(variant)
    setFormData({
      label: variant.label,
      days_per_week: variant.days_per_week,
      meals_per_day: variant.meals_per_day,
      weekly_price_mad: variant.weekly_price_mad,
      published: variant.published,
    })
    setIsEditModalOpen(true)
  }

  // Handle delete
  const handleDeleteClick = (variant: PlanVariant) => {
    setSelectedVariant(variant)
    setIsDeleteDialogOpen(true)
  }

  // Handle toggle published
  const handleTogglePublished = async (variant: PlanVariant) => {
    try {
      const response = await fetch(
        `/api/admin/products/meal-plans/${mealPlanId}/variants/${variant.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            published: !variant.published,
          }),
        }
      )

      const data = await response.json()

      if (response.ok && data.success) {
        fetchVariants() // Refresh list
      } else {
        let errorMessage = "Failed to update variant"
        if (data.error) {
          if (typeof data.error === 'string') {
            errorMessage = data.error
          } else if (data.error.message) {
            errorMessage = data.error.message
          }
        }
        setError(errorMessage)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update variant")
    }
  }

  // Submit create/edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const payload = {
        label: formData.label,
        days_per_week: formData.days_per_week,
        meals_per_day: formData.meals_per_day,
        weekly_price_mad: formData.weekly_price_mad,
        published: formData.published,
      }

      const url = selectedVariant
        ? `/api/admin/products/meal-plans/${mealPlanId}/variants/${selectedVariant.id}`
        : `/api/admin/products/meal-plans/${mealPlanId}/variants`
      const method = selectedVariant ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setIsCreateModalOpen(false)
        setIsEditModalOpen(false)
        setSelectedVariant(null)
        fetchVariants() // Refresh list
      } else {
        let errorMessage = "Failed to save variant"
        if (data.error) {
          if (typeof data.error === 'string') {
            errorMessage = data.error
          } else if (data.error.message) {
            errorMessage = data.error.message
          }
        }
        setError(errorMessage)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save variant")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!selectedVariant) return

    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch(
        `/api/admin/products/meal-plans/${mealPlanId}/variants/${selectedVariant.id}`,
        {
          method: "DELETE",
        }
      )

      const data = await response.json()

      if (response.ok && data.success) {
        setIsDeleteDialogOpen(false)
        setSelectedVariant(null)
        fetchVariants() // Refresh list
      } else {
        let errorMessage = "Failed to delete variant"
        if (data.error) {
          if (typeof data.error === 'string') {
            errorMessage = data.error
          } else if (data.error.message) {
            errorMessage = data.error.message
          }
        }
        setError(errorMessage)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete variant")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!mealPlan) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error || "Meal plan not found"}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/admin/products/meal-plans")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Meal Plans
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{mealPlan.name}</h1>
            <p className="text-gray-500 mt-1">{mealPlan.description || "No description"}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">{mealPlan.category}</Badge>
              <Badge variant={mealPlan.is_available ? "default" : "secondary"}>
                {mealPlan.is_available ? "Published" : "Unpublished"}
              </Badge>
            </div>
          </div>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Variant
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Variants Table */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Variants ({variants.length})</CardTitle>
          <CardDescription>
            Manage different options for this meal plan. Each variant can have different days per week, meals per day, and pricing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {variantsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : variants.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No variants yet. Create your first variant to get started!</p>
              <p className="text-sm mt-2">Variants define different options (days/week, meals/day, pricing) for this meal plan.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Label</TableHead>
                  <TableHead>Days/Week</TableHead>
                  <TableHead>Meals/Day</TableHead>
                  <TableHead>Price/Week</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.map((variant) => (
                  <TableRow key={variant.id}>
                    <TableCell className="font-medium">{variant.label}</TableCell>
                    <TableCell>{variant.days_per_week} days</TableCell>
                    <TableCell>{variant.meals_per_day} meals</TableCell>
                    <TableCell>{variant.weekly_price_mad.toFixed(2)} MAD</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={variant.published}
                          onChange={() => handleTogglePublished(variant)}
                          className="rounded"
                        />
                        <Badge variant={variant.published ? "default" : "secondary"}>
                          {variant.published ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(variant)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(variant)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={isCreateModalOpen || isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateModalOpen(false)
          setIsEditModalOpen(false)
          setSelectedVariant(null)
          setError("")
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedVariant ? "Edit Variant" : "Create New Variant"}</DialogTitle>
            <DialogDescription>
              {selectedVariant ? "Update the variant details." : "Create a new variant for this meal plan. Variants define different options (days per week, meals per day, pricing)."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="label">Label *</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="e.g., 5 days • 3 meals/day"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">A descriptive label for this variant</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="days_per_week">Days per Week *</Label>
                  <Input
                    id="days_per_week"
                    type="number"
                    min="1"
                    max="7"
                    value={formData.days_per_week}
                    onChange={(e) => setFormData({ ...formData, days_per_week: Number.parseInt(e.target.value) || 5 })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="meals_per_day">Meals per Day *</Label>
                  <Input
                    id="meals_per_day"
                    type="number"
                    min="1"
                    max="5"
                    value={formData.meals_per_day}
                    onChange={(e) => setFormData({ ...formData, meals_per_day: Number.parseInt(e.target.value) || 3 })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="weekly_price_mad">Weekly Price (MAD) *</Label>
                <Input
                  id="weekly_price_mad"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.weekly_price_mad}
                  onChange={(e) => setFormData({ ...formData, weekly_price_mad: Number.parseFloat(e.target.value) || 0 })}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Price per week. Total price = weekly_price × duration (selected by customer)</p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="published">Active (published)</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(false)
                  setIsEditModalOpen(false)
                  setSelectedVariant(null)
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  selectedVariant ? "Update" : "Create"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Variant?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedVariant?.label}"? This action cannot be undone.
              {selectedVariant?.published && (
                <span className="block mt-2 text-yellow-600 font-medium">
                  This variant is currently active. It will be unpublished if it has active subscriptions.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

