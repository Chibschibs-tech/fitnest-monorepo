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
import { Search, Plus, Edit, Trash2, Users, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"

interface MealPlan {
  id: number
  name: string
  description: string
  price_per_week: number
  duration_weeks: number
  meals_per_day: number
  category: string
  features: string[]
  image_url?: string
  is_available: boolean
  subscribers_count?: number
}

export function MealPlansContent() {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [loading, setLoading] = useState(true)
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
    category: "balanced",
    is_available: true,
  })

  useEffect(() => {
    fetchMealPlans()
  }, [])

  const fetchMealPlans = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/products/meal-plans")
      if (!response.ok) {
        throw new Error("Failed to fetch meal plans")
      }
      const data = await response.json()
      setMealPlans(data.mealPlans || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch meal plans")
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
      category: "balanced",
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
      category: plan.category || "balanced",
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
        category: formData.category,
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
        setError(data.error || "Failed to save meal plan")
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
        setError(data.error || "Failed to delete meal plan")
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
                <TableHead>Duration</TableHead>
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
                  <TableCell>{plan.duration_weeks} weeks</TableCell>
                  <TableCell>{plan.meals_per_day} meals</TableCell>
                  <TableCell>{plan.price_per_week} MAD</TableCell>
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
                        onClick={() => handleEdit(plan)}
                        disabled={isSubmitting}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(plan)}
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
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="keto">Keto</option>
                <option value="lowcarb">Low Carb</option>
                <option value="balanced">Balanced</option>
                <option value="muscle">Muscle</option>
                <option value="custom">Custom</option>
              </select>
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
