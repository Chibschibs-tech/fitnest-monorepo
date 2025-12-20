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
import { Search, Eye, Edit, Trash2, Plus, RefreshCw, Loader2, Download, X, MoreVertical } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ImageUpload } from "@/components/image-upload"
import Image from "next/image"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Meal {
  id: number
  name: string
  description: string
  price: number
  category: string
  meal_type?: "Breakfast" | "Lunch" | "Dinner" | "Snack" | null
  image_url?: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  sodium?: number
  sugar?: number
  cholesterol?: number
  saturated_fat?: number
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
  const [mealTypeFilter, setMealTypeFilter] = useState<string>("all")
  const [allergens, setAllergens] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [newAllergen, setNewAllergen] = useState("")
  const [newTag, setNewTag] = useState("")
  const [selectedMeals, setSelectedMeals] = useState<number[]>([])
  const [isBulkProcessing, setIsBulkProcessing] = useState(false)
  
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
    meal_type: "" as "Breakfast" | "Lunch" | "Dinner" | "Snack" | "",
    category: "meal",
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
    (meal) => {
      const matchesSearch = meal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meal.category.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = mealTypeFilter === "all" || meal.meal_type === mealTypeFilter
      return matchesSearch && matchesType
    }
  )

  // Handle create
  const handleCreate = () => {
    setFormData({
      name: "",
      description: "",
      meal_type: "",
      category: "meal",
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
      fiber: "",
      sodium: "",
      sugar: "",
      cholesterol: "",
      saturated_fat: "",
      image_url: "",
      is_available: true,
    })
    setAllergens([])
    setTags([])
    setNewAllergen("")
    setNewTag("")
    setSelectedMeal(null)
    setIsCreateModalOpen(true)
  }

  // Allergen management
  const addAllergen = () => {
    if (newAllergen.trim() && !allergens.includes(newAllergen.trim())) {
      setAllergens([...allergens, newAllergen.trim()])
      setNewAllergen("")
    }
  }

  const removeAllergen = (allergen: string) => {
    setAllergens(allergens.filter((a) => a !== allergen))
  }

  // Tag management
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  // Handle edit
  const handleEdit = (meal: Meal) => {
    setSelectedMeal(meal)
    setFormData({
      name: meal.name,
      description: meal.description || "",
      meal_type: meal.meal_type || "",
      category: meal.category || "meal",
      calories: meal.calories.toString(),
      protein: meal.protein.toString(),
      carbs: meal.carbs.toString(),
      fat: meal.fat.toString(),
      fiber: (meal.fiber || 0).toString(),
      sodium: (meal.sodium || 0).toString(),
      sugar: (meal.sugar || 0).toString(),
      cholesterol: (meal.cholesterol || 0).toString(),
      saturated_fat: (meal.saturated_fat || 0).toString(),
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

  // Bulk operations
  const handleSelectMeal = (mealId: number, checked: boolean) => {
    if (checked) {
      setSelectedMeals([...selectedMeals, mealId])
    } else {
      setSelectedMeals(selectedMeals.filter((id) => id !== mealId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMeals(filteredMeals.map((meal) => meal.id))
    } else {
      setSelectedMeals([])
    }
  }

  const handleBulkPublish = async () => {
    if (selectedMeals.length === 0) return
    setIsBulkProcessing(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/products/meals/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "publish",
          ids: selectedMeals,
        }),
      })

      const data = await response.json()
      if (response.ok && data.success) {
        setSelectedMeals([])
        fetchMeals()
      } else {
        setError(data.error || "Failed to publish meals")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish meals")
    } finally {
      setIsBulkProcessing(false)
    }
  }

  const handleBulkUnpublish = async () => {
    if (selectedMeals.length === 0) return
    setIsBulkProcessing(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/products/meals/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "unpublish",
          ids: selectedMeals,
        }),
      })

      const data = await response.json()
      if (response.ok && data.success) {
        setSelectedMeals([])
        fetchMeals()
      } else {
        setError(data.error || "Failed to unpublish meals")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unpublish meals")
    } finally {
      setIsBulkProcessing(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedMeals.length === 0) return
    if (!confirm(`Are you sure you want to delete ${selectedMeals.length} meal(s)?`)) return

    setIsBulkProcessing(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/products/meals/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          ids: selectedMeals,
        }),
      })

      const data = await response.json()
      if (response.ok && data.success) {
        setSelectedMeals([])
        fetchMeals()
      } else {
        setError(data.error || "Failed to delete meals")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete meals")
    } finally {
      setIsBulkProcessing(false)
    }
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
        meal_type: formData.meal_type || null,
        category: formData.category || "meal",
        calories: Number.parseInt(formData.calories) || 0,
        protein: Number.parseFloat(formData.protein) || 0,
        carbs: Number.parseFloat(formData.carbs) || 0,
        fat: Number.parseFloat(formData.fat) || 0,
        fiber: Number.parseFloat(formData.fiber) || 0,
        sodium: Number.parseFloat(formData.sodium) || 0,
        sugar: Number.parseFloat(formData.sugar) || 0,
        cholesterol: Number.parseFloat(formData.cholesterol) || 0,
        saturated_fat: Number.parseFloat(formData.saturated_fat) || 0,
        allergens: allergens,
        tags: tags,
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
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search meals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={mealTypeFilter} onValueChange={setMealTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
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
        <div className="flex gap-2">
          {selectedMeals.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isBulkProcessing}>
                  <MoreVertical className="h-4 w-4 mr-2" />
                  Bulk Actions ({selectedMeals.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleBulkPublish} disabled={isBulkProcessing}>
                  Publish Selected
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleBulkUnpublish} disabled={isBulkProcessing}>
                  Unpublish Selected
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleBulkDelete} disabled={isBulkProcessing} className="text-red-600">
                  Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button onClick={fetchMeals} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={() => window.open("/api/admin/products/meals/export?format=csv", "_blank")}
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button
            onClick={() => window.open("/api/admin/products/meals/export?format=json", "_blank")}
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" />
            Export JSON
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
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedMeals.length === filteredMeals.length && filteredMeals.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Meal</TableHead>
                  <TableHead>Type</TableHead>
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
                      <Checkbox
                        checked={selectedMeals.includes(meal.id)}
                        onCheckedChange={(checked) => handleSelectMeal(meal.id, checked as boolean)}
                      />
                    </TableCell>
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
                      {meal.meal_type ? (
                        <Badge variant="secondary">{meal.meal_type}</Badge>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
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
                <Label htmlFor="meal_type">Meal Type</Label>
                <Select
                  value={formData.meal_type}
                  onValueChange={(value) => setFormData({ ...formData, meal_type: value as typeof formData.meal_type })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select meal type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Breakfast">Breakfast</SelectItem>
                    <SelectItem value="Lunch">Lunch</SelectItem>
                    <SelectItem value="Dinner">Dinner</SelectItem>
                    <SelectItem value="Snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., meal, protein, vegetarian"
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
            <div className="grid grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fiber">Fiber (g)</Label>
                <Input
                  id="fiber"
                  type="number"
                  step="0.1"
                  value={formData.fiber}
                  onChange={(e) => setFormData({ ...formData, fiber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sodium">Sodium (mg)</Label>
                <Input
                  id="sodium"
                  type="number"
                  step="0.1"
                  value={formData.sodium}
                  onChange={(e) => setFormData({ ...formData, sodium: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sugar">Sugar (g)</Label>
                <Input
                  id="sugar"
                  type="number"
                  step="0.1"
                  value={formData.sugar}
                  onChange={(e) => setFormData({ ...formData, sugar: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cholesterol">Cholesterol (mg)</Label>
                <Input
                  id="cholesterol"
                  type="number"
                  step="0.1"
                  value={formData.cholesterol}
                  onChange={(e) => setFormData({ ...formData, cholesterol: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="saturated_fat">Saturated Fat (g)</Label>
                <Input
                  id="saturated_fat"
                  type="number"
                  step="0.1"
                  value={formData.saturated_fat}
                  onChange={(e) => setFormData({ ...formData, saturated_fat: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Image</Label>
              <ImageUpload
                onUploadComplete={(url) => setFormData({ ...formData, image_url: url })}
                buttonText="Upload Meal Image"
              />
              {formData.image_url && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">Current image:</p>
                  <Image
                    src={formData.image_url}
                    alt="Meal preview"
                    width={100}
                    height={100}
                    className="rounded object-cover"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({ ...formData, image_url: "" })}
                    className="mt-2"
                  >
                    Remove Image
                  </Button>
                </div>
              )}
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="Or enter image URL manually"
                className="mt-2"
              />
            </div>
            {/* Allergens Management */}
            <div className="space-y-2">
              <Label>Allergens</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add allergen (e.g., Nuts, Dairy)"
                  value={newAllergen}
                  onChange={(e) => setNewAllergen(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addAllergen()
                    }
                  }}
                />
                <Button type="button" onClick={addAllergen} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {allergens.map((allergen) => (
                  <Badge key={allergen} variant="secondary" className="flex items-center gap-1">
                    {allergen}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeAllergen(allergen)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Tags Management */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag (e.g., high-protein, vegetarian)"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
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
