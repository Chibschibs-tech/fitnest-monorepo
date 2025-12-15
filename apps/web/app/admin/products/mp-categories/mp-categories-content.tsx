"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Search, Plus, Edit, Trash2, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

interface MPCategory {
  id: number
  name: string
  slug: string
  description: string
  variables: Record<string, any>
  meal_plans_count: number
  created_at: string
  updated_at: string
}

export function MPCategoriesContent() {
  const [categories, setCategories] = useState<MPCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<MPCategory | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    variables: "{}",
    baseBreakfast: "",
    baseLunch: "",
    baseDinner: "",
    baseSnack: "",
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await fetch("/api/admin/mp-categories")
      const data = await response.json()
      
      if (!response.ok) {
        // Extract error message from various possible formats
        let errorMessage = "Failed to fetch categories"
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
        setCategories([])
        return
      }
      
      if (data.success && data.categories) {
        setCategories(data.categories || [])
        setError("")
      } else {
        // Extract error message from various possible formats
        let errorMessage = "Failed to fetch categories"
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
        setCategories([])
      }
    } catch (err) {
      console.error("Error fetching categories:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch categories"
      setError(errorMessage)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Handle create
  const handleCreate = () => {
    setFormData({
      name: "",
      description: "",
      variables: "{}",
      baseBreakfast: "",
      baseLunch: "",
      baseDinner: "",
      baseSnack: "",
    })
    setSelectedCategory(null)
    setIsCreateModalOpen(true)
  }

  // Handle edit
  const handleEdit = async (category: MPCategory) => {
    setSelectedCategory(category)

    // Start with basic fields
    setFormData((prev) => ({
      ...prev,
      name: category.name,
      description: category.description || "",
      variables: JSON.stringify(category.variables || {}, null, 2),
      baseBreakfast: "",
      baseLunch: "",
      baseDinner: "",
      baseSnack: "",
    }))

    // Load existing base prices for this category from meal_type_prices
    try {
      const res = await fetch("/api/admin/pricing/meal-prices")
      if (res.ok) {
        const data = await res.json()
        const prices = (data.mealPrices || []).filter(
          (p: any) => p.plan_name === category.name,
        )
        const byType: Record<string, string> = {}
        for (const p of prices) {
          if (p.meal_type === "Breakfast") byType.baseBreakfast = String(p.base_price_mad ?? "")
          if (p.meal_type === "Lunch") byType.baseLunch = String(p.base_price_mad ?? "")
          if (p.meal_type === "Dinner") byType.baseDinner = String(p.base_price_mad ?? "")
          if (p.meal_type === "Snack") byType.baseSnack = String(p.base_price_mad ?? "")
        }
        setFormData((prev) => ({ ...prev, ...byType }))
      }
    } catch (e) {
      console.error("Failed to load meal prices for category", category.name, e)
    }

    setIsEditModalOpen(true)
  }

  // Handle delete
  const handleDeleteClick = (category: MPCategory) => {
    setSelectedCategory(category)
    setIsDeleteDialogOpen(true)
  }

  // Submit create/edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      // Parse variables JSON
      let variables = {}
      try {
        variables = JSON.parse(formData.variables || "{}")
      } catch (e) {
        setError("Invalid JSON in variables field")
        setIsSubmitting(false)
        return
      }

      const basePrices: Record<string, number> = {}
      const b = Number.parseFloat(formData.baseBreakfast)
      const l = Number.parseFloat(formData.baseLunch)
      const d = Number.parseFloat(formData.baseDinner)
      const s = Number.parseFloat(formData.baseSnack)
      if (!Number.isNaN(b) && b > 0) basePrices["Breakfast"] = b
      if (!Number.isNaN(l) && l > 0) basePrices["Lunch"] = l
      if (!Number.isNaN(d) && d > 0) basePrices["Dinner"] = d
      if (!Number.isNaN(s) && s > 0) basePrices["Snack"] = s

      const payload: any = {
        name: formData.name,
        description: formData.description,
        variables: variables,
      }
      if (Object.keys(basePrices).length > 0) {
        payload.basePrices = basePrices
      }

      const url = selectedCategory
        ? `/api/admin/mp-categories/${selectedCategory.id}`
        : "/api/admin/mp-categories"
      const method = selectedCategory ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setIsCreateModalOpen(false)
        setIsEditModalOpen(false)
        setSelectedCategory(null)
        fetchCategories() // Refresh list
      } else {
        // Extract error message from various possible formats
        let errorMessage = "Failed to save category"
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
      setError(err instanceof Error ? err.message : "Failed to save category")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!selectedCategory) return

    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch(`/api/admin/mp-categories/${selectedCategory.id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setIsDeleteDialogOpen(false)
        setSelectedCategory(null)
        fetchCategories() // Refresh list
      } else {
        // Extract error message from various possible formats
        let errorMessage = "Failed to delete category"
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
      setError(err instanceof Error ? err.message : "Failed to delete category")
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">MP Categories</h1>
          <p className="text-gray-500 mt-1">
            Diet families (Keto, Balanced, Muscle Gain, etc.) used as the pricing and nutrition
            profiles for meal plans. Base prices per meal type are configured under{" "}
            <span className="font-semibold">Pricing → Pricing Management</span>, and discount rules
            under the same section.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Categories ({filteredCategories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCategories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? "No categories found matching your search." : "No categories yet. Create your first category!"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Meal Plans</TableHead>
                  <TableHead>Variables</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-gray-600">
                      {category.description || <span className="text-gray-400">No description</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{category.meal_plans_count}</Badge>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {Object.keys(category.variables || {}).length} keys
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(category)}
                          disabled={category.meal_plans_count > 0}
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
      <Dialog
        open={isCreateModalOpen || isEditModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateModalOpen(false)
            setIsEditModalOpen(false)
            setSelectedCategory(null)
            setError("")
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedCategory ? "Edit Category" : "Create New Category"}</DialogTitle>
            <DialogDescription>
              Define the name, description, base prices per meal type, and (optional) advanced
              variables for this meal plan category.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Keto, Low Carb, Balanced"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of this category"
                    rows={3}
                  />
                </div>
              </div>

              <div className="border rounded-lg p-4 space-y-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Base Prices (per day, in MAD)</span>
                </div>
                <p className="text-xs text-gray-500">
                  These values populate the pricing engine for this category. You can refine them
                  later under <strong>Pricing → Pricing Management</strong>.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <Label htmlFor="baseBreakfast" className="text-xs">
                      Breakfast
                    </Label>
                    <Input
                      id="baseBreakfast"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.baseBreakfast}
                      onChange={(e) =>
                        setFormData({ ...formData, baseBreakfast: e.target.value })
                      }
                      placeholder="e.g. 45"
                    />
                  </div>
                  <div>
                    <Label htmlFor="baseLunch" className="text-xs">
                      Lunch
                    </Label>
                    <Input
                      id="baseLunch"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.baseLunch}
                      onChange={(e) => setFormData({ ...formData, baseLunch: e.target.value })}
                      placeholder="e.g. 60"
                    />
                  </div>
                  <div>
                    <Label htmlFor="baseDinner" className="text-xs">
                      Dinner
                    </Label>
                    <Input
                      id="baseDinner"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.baseDinner}
                      onChange={(e) => setFormData({ ...formData, baseDinner: e.target.value })}
                      placeholder="e.g. 55"
                    />
                  </div>
                  <div>
                    <Label htmlFor="baseSnack" className="text-xs">
                      Snack (optional)
                    </Label>
                    <Input
                      id="baseSnack"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.baseSnack}
                      onChange={(e) => setFormData({ ...formData, baseSnack: e.target.value })}
                      placeholder="e.g. 15"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="variables">Variables (JSON, advanced)</Label>
                <Textarea
                  id="variables"
                  value={formData.variables}
                  onChange={(e) => setFormData({ ...formData, variables: e.target.value })}
                  placeholder='{"target_calories_min": 1200, "target_calories_max": 1500, "macros": {"protein": 0.3, "carbs": 0.4, "fat": 0.3}}'
                  rows={6}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  JSON object defining available variables for meal plans in this category (for
                  example macros, target calories, allowed meal types, etc.).
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(false)
                  setIsEditModalOpen(false)
                  setSelectedCategory(null)
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
                  selectedCategory ? "Update" : "Create"
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
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedCategory?.name}"? 
              {selectedCategory && selectedCategory.meal_plans_count > 0 && (
                <span className="block mt-2 text-red-600 font-medium">
                  This category has {selectedCategory.meal_plans_count} meal plan(s) associated with it. 
                  You cannot delete it until all meal plans are removed or reassigned.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isSubmitting || (selectedCategory?.meal_plans_count || 0) > 0}
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

