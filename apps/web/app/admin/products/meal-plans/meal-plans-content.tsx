"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Search, Plus, Edit, Trash2, Users, Loader2, Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface MealPlan {
  id: number
  name: string
  description: string
  price_per_week: number
  duration_weeks: number
  meals_per_day: number
  category: string
  mp_category_id?: number
  features: string[]
  image_url?: string
  is_available: boolean
  subscribers_count?: number
}

interface MPCategory {
  id: number
  name: string
  slug: string
  description: string
}

export function MealPlansContent() {
  const router = useRouter()
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [categories, setCategories] = useState<MPCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedMealPlan, setSelectedMealPlan] = useState<MealPlan | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    mp_category_id: "",
    is_available: true,
  })

  useEffect(() => {
    fetchMealPlans()
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true)
      const response = await fetch("/api/admin/mp-categories")
      const data = await response.json()
      
      if (response.ok && data.success && data.categories) {
        setCategories(data.categories || [])
      }
    } catch (err) {
      console.error("Error fetching categories:", err)
    } finally {
      setCategoriesLoading(false)
    }
  }

  const fetchMealPlans = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await fetch("/api/admin/products/meal-plans")
      const data = await response.json()
      
      if (!response.ok) {
        // Extract error message from various possible formats
        let errorMessage = "Failed to fetch meal plans"
        if (data.error) {
          if (typeof data.error === 'string') {
            errorMessage = data.error
          } else if (data.error.message) {
            errorMessage = data.error.message
          } else {
            errorMessage = JSON.stringify(data.error)
          }
        } else if (data.message) {
          errorMessage = data.message
        }
        setError(errorMessage)
        setMealPlans([])
        return
      }
      
      if (data.success && data.mealPlans) {
        setMealPlans(data.mealPlans || [])
        setError("")
      } else {
        // Extract error message from various possible formats
        let errorMessage = "Failed to fetch meal plans"
        if (data.error) {
          if (typeof data.error === 'string') {
            errorMessage = data.error
          } else if (data.error.message) {
            errorMessage = data.error.message
          } else {
            errorMessage = JSON.stringify(data.error)
          }
        } else if (data.message) {
          errorMessage = data.message
        }
        setError(errorMessage)
        setMealPlans([])
      }
    } catch (err) {
      console.error("Error fetching meal plans:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch meal plans"
      setError(errorMessage)
      setMealPlans([])
    } finally {
      setLoading(false)
    }
  }

  const filteredMealPlans = mealPlans.filter(
    (plan) =>
      plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Handle create
  const handleCreate = () => {
    setFormData({
      name: "",
      description: "",
      mp_category_id: categories.length > 0 ? categories[0].id.toString() : "",
      is_available: true,
    })
    setSelectedMealPlan(null)
    setIsCreateModalOpen(true)
  }

  // Handle edit
  const handleEdit = (plan: MealPlan) => {
    setSelectedMealPlan(plan)
    setFormData({
      name: plan.name,
      description: plan.description || "",
      mp_category_id: plan.mp_category_id?.toString() || "",
      is_available: plan.is_available,
    })
    setIsEditModalOpen(true)
  }

  // Handle delete
  const handleDeleteClick = (plan: MealPlan) => {
    setSelectedMealPlan(plan)
    setIsDeleteDialogOpen(true)
  }

  // Submit create/edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        mp_category_id: Number.parseInt(formData.mp_category_id),
        published: formData.is_available,
      }

      const url = selectedMealPlan
        ? `/api/admin/products/meal-plans/${selectedMealPlan.id}`
        : "/api/admin/products/meal-plans"
      const method = selectedMealPlan ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setIsCreateModalOpen(false)
        setIsEditModalOpen(false)
        setSelectedMealPlan(null)
        fetchMealPlans() // Refresh list
      } else {
        // Extract error message from various possible formats
        let errorMessage = "Failed to save meal plan"
        if (data.error) {
          if (typeof data.error === 'string') {
            errorMessage = data.error
          } else if (data.error.message) {
            errorMessage = data.error.message
          } else {
            errorMessage = JSON.stringify(data.error)
          }
        } else if (data.message) {
          errorMessage = data.message
        }
        setError(errorMessage)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save meal plan")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!selectedMealPlan) return

    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch(`/api/admin/products/meal-plans/${selectedMealPlan.id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setIsDeleteDialogOpen(false)
        setSelectedMealPlan(null)
        fetchMealPlans() // Refresh list
      } else {
        // Extract error message from various possible formats
        let errorMessage = "Failed to delete meal plan"
        if (data.error) {
          if (typeof data.error === 'string') {
            errorMessage = data.error
          } else if (data.error.message) {
            errorMessage = data.error.message
          } else {
            errorMessage = JSON.stringify(data.error)
          }
        } else if (data.message) {
          errorMessage = data.message
        }
        setError(errorMessage)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete meal plan")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Meal Plans Management</h1>
          <p className="text-gray-600">Manage your meal plan offerings</p>
        </div>
        <Button onClick={handleCreate} disabled={isSubmitting}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Meal Plan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search meal plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Meal Plans ({filteredMealPlans.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Variants</TableHead>
                <TableHead>Meals/Day</TableHead>
                <TableHead>Price/Week</TableHead>
                <TableHead>Subscribers</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMealPlans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>
                    <div className="relative h-12 w-12 rounded-md overflow-hidden">
                      <Image
                        src={plan.image_url || "/placeholder.svg?height=48&width=48"}
                        alt={plan.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{plan.name}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{plan.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{plan.category}</Badge>
                  </TableCell>
                  <TableCell>
                    {plan.variant_count > 0 ? (
                      <span className="text-sm text-gray-600">{plan.variant_count} variant(s)</span>
                    ) : (
                      <span className="text-sm text-gray-400">No variants</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {plan.variant_count > 0 ? (
                      <span className="text-sm text-gray-600">See variants</span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {plan.price_per_week > 0 ? (
                      <span>{plan.price_per_week} MAD/week</span>
                    ) : (
                      <span className="text-sm text-gray-400">Set in variants</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>{plan.subscribers_count || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={plan.is_available ? "default" : "secondary"}>
                      {plan.is_available ? "Available" : "Unavailable"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/products/meal-plans/${plan.id}`)}
                        title="Manage Variants"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(plan)}
                        disabled={isSubmitting}
                        title="Edit Meal Plan"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(plan)}
                        disabled={isSubmitting}
                        title="Delete Meal Plan"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredMealPlans.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No meal plans found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isCreateModalOpen || isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateModalOpen(false)
          setIsEditModalOpen(false)
          setSelectedMealPlan(null)
          setError("")
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedMealPlan ? "Edit Meal Plan" : "Add New Meal Plan"}</DialogTitle>
            <DialogDescription>
              {selectedMealPlan ? "Update meal plan information" : "Create a new meal plan"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Plan Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
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
            <div className="space-y-2">
              <Label htmlFor="mp_category_id">MP Category *</Label>
              {categoriesLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-gray-500">Loading categories...</span>
                </div>
              ) : (
                <Select
                  value={formData.mp_category_id}
                  onValueChange={(value) => setFormData({ ...formData, mp_category_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {categories.length === 0 && !categoriesLoading && (
                <p className="text-xs text-gray-500 mt-1">
                  No categories available. <a href="/admin/products/mp-categories" className="text-blue-600 underline">Create one first</a>
                </p>
              )}
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
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(false)
                  setIsEditModalOpen(false)
                  setSelectedMealPlan(null)
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
                  selectedMealPlan ? "Update" : "Create"
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
            <AlertDialogTitle>Delete Meal Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedMealPlan?.name}"? This action cannot be undone.
              {selectedMealPlan?.subscribers_count && selectedMealPlan.subscribers_count > 0 && (
                <span className="block mt-2 text-yellow-600">
                  Warning: This plan has {selectedMealPlan.subscribers_count} active subscribers. It will be unpublished instead of deleted.
                </span>
              )}
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
