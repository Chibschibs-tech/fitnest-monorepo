"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Eye, Edit, Trash2, Plus, RefreshCw, Loader2 } from "lucide-react"

interface Meal {
  id: number
  name: string
  description: string
  price: number
  category: string
  image_url?: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  ingredients?: string
  allergens?: string
  is_available: boolean
  status: "active" | "inactive"
  created_at: string
}

export default function MealsContent() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    image_url: "",
    is_available: true,
  })

  useEffect(() => {
    fetchMeals()
  }, [])

  const fetchMeals = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/admin/products/meals")
      const data = await response.json()

      if (response.ok) {
        setMeals(data.meals || [])
        console.log("Loaded meals:", data.meals?.length || 0)
      } else {
        setError(data.message || "Failed to load meals")
        console.error("API error:", data)
      }
    } catch (error) {
      console.error("Failed to fetch meals:", error)
      setError("Failed to load meals")
    } finally {
      setLoading(false)
    }
  }

  const filteredMeals = meals.filter(
    (meal) =>
      meal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meal.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Handle create
  const handleCreate = () => {
    setFormData({
      name: "",
      description: "",
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
      image_url: "",
      is_available: true,
    })
    setSelectedMeal(null)
    setIsCreateModalOpen(true)
  }

  // Handle edit
  const handleEdit = (meal: Meal) => {
    setSelectedMeal(meal)
    setFormData({
      name: meal.name,
      description: meal.description || "",
      calories: meal.calories.toString(),
      protein: meal.protein.toString(),
      carbs: meal.carbs.toString(),
      fat: meal.fat.toString(),
      image_url: meal.image_url || "",
      is_available: meal.is_available,
    })
    setIsEditModalOpen(true)
  }

  // Handle delete
  const handleDeleteClick = (meal: Meal) => {
    setSelectedMeal(meal)
    setIsDeleteDialogOpen(true)
  }

  // Submit create/edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        calories: Number.parseInt(formData.calories) || 0,
        protein: Number.parseFloat(formData.protein) || 0,
        carbs: Number.parseFloat(formData.carbs) || 0,
        fat: Number.parseFloat(formData.fat) || 0,
        image_url: formData.image_url || null,
        is_available: formData.is_available,
      }

      const url = selectedMeal
        ? `/api/admin/products/meals/${selectedMeal.id}`
        : "/api/admin/products/meals"
      const method = selectedMeal ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setIsCreateModalOpen(false)
        setIsEditModalOpen(false)
        setSelectedMeal(null)
        fetchMeals() // Refresh list
      } else {
        setError(data.error || "Failed to save meal")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save meal")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!selectedMeal) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/products/meals/${selectedMeal.id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setIsDeleteDialogOpen(false)
        setSelectedMeal(null)
        fetchMeals() // Refresh list
      } else {
        setError(data.error || "Failed to delete meal")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete meal")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
        <div className="grid gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button onClick={fetchMeals} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search meals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchMeals} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleCreate} disabled={isSubmitting}>
            <Plus className="h-4 w-4 mr-2" />
            Add Meal
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Meals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{meals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Meals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {meals.filter((meal) => meal.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(meals.map((meal) => meal.category)).size}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {meals.length > 0 ? (meals.reduce((sum, meal) => sum + meal.price, 0) / meals.length).toFixed(2) : 0} MAD
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Meals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Meals ({filteredMeals.length})</CardTitle>
          <CardDescription>Manage your meal offerings and nutritional information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Meal</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Nutrition</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMeals.map((meal) => (
                  <TableRow key={meal.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {meal.image_url && (
                          <img
                            src={meal.image_url || "/placeholder.svg"}
                            alt={meal.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium">{meal.name}</div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">{meal.description}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{meal.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{meal.price} MAD</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{meal.calories} cal</div>
                        <div className="text-gray-500">
                          P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fat}g
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={meal.status === "active" ? "default" : "secondary"}
                        className={meal.status === "active" ? "bg-green-100 text-green-800" : ""}
                      >
                        {meal.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(meal)}
                          disabled={isSubmitting}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(meal)}
                          disabled={isSubmitting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredMeals.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {meals.length === 0
                  ? "No meals found in the database."
                  : "No meals found matching your search criteria."}
              </p>
              {meals.length === 0 && (
                <p className="text-sm text-gray-400 mt-2">Add meals to start building your menu offerings.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={isCreateModalOpen || isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateModalOpen(false)
          setIsEditModalOpen(false)
          setSelectedMeal(null)
          setError(null)
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedMeal ? "Edit Meal" : "Add New Meal"}</DialogTitle>
            <DialogDescription>
              {selectedMeal ? "Update meal information" : "Create a new meal"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Meal Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="calories">Calories</Label>
                <Input
                  id="calories"
                  type="number"
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="protein">Protein (g)</Label>
                <Input
                  id="protein"
                  type="number"
                  step="0.1"
                  value={formData.protein}
                  onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carbs">Carbs (g)</Label>
                <Input
                  id="carbs"
                  type="number"
                  step="0.1"
                  value={formData.carbs}
                  onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fat">Fat (g)</Label>
                <Input
                  id="fat"
                  type="number"
                  step="0.1"
                  value={formData.fat}
                  onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_available"
                checked={formData.is_available}
                onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="is_available">Available</Label>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(false)
                  setIsEditModalOpen(false)
                  setSelectedMeal(null)
                }}
                disabled={isSubmitting}
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
                  selectedMeal ? "Update" : "Create"
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
            <AlertDialogTitle>Delete Meal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedMeal?.name}"? This action cannot be undone.
              {selectedMeal && " If this meal is used in meal plans, it will be unpublished instead of deleted."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
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
