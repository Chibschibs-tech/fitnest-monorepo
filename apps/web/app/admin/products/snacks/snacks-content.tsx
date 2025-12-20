"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Search, Package, Plus, Edit, RefreshCw, Trash2, Loader2, Download, MoreVertical } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import { ImageUpload } from "@/components/image-upload"

interface Snack {
  id: number
  name: string
  description: string
  price: number
  category: string
  status: string
  image_url?: string
  stock_quantity: number
  created_at: string
}

export default function SnacksContent() {
  const [snacks, setSnacks] = useState<Snack[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedSnack, setSelectedSnack] = useState<Snack | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedSnacks, setSelectedSnacks] = useState<number[]>([])
  const [isBulkProcessing, setIsBulkProcessing] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "snacks",
    image_url: "",
    stock_quantity: "0",
    status: "active",
  })

  useEffect(() => {
    fetchSnacks()
  }, [])

  const fetchSnacks = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/admin/products/snacks")
      const data = await response.json()

      if (data.success) {
        setSnacks(data.snacks || [])
      } else {
        setError(data.error || "Failed to fetch snacks")
      }
    } catch (error) {
      console.error("Error fetching snacks:", error)
      setError("Failed to fetch snacks")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (snackId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/products/snacks/${snackId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchSnacks() // Refresh the list
      } else {
        setError("Failed to update snack status")
      }
    } catch (error) {
      console.error("Error updating snack status:", error)
      setError("Error updating snack status")
    }
  }

  // Handle create
  const handleCreate = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "snacks",
      image_url: "",
      stock_quantity: "0",
      status: "active",
    })
    setSelectedSnack(null)
    setIsCreateModalOpen(true)
  }

  // Handle edit
  const handleEdit = (snack: Snack) => {
    setSelectedSnack(snack)
    setFormData({
      name: snack.name,
      description: snack.description || "",
      price: snack.price.toString(),
      category: snack.category || "snacks",
      image_url: snack.image_url || "",
      stock_quantity: snack.stock_quantity?.toString() || "0",
      status: snack.status || "active",
    })
    setIsEditModalOpen(true)
  }

  // Handle delete
  const handleDeleteClick = (snack: Snack) => {
    setSelectedSnack(snack)
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
        price: Number.parseFloat(formData.price),
        category: formData.category,
        image_url: formData.image_url || null,
        stock_quantity: Number.parseInt(formData.stock_quantity) || 0,
        status: formData.status,
      }

      const url = selectedSnack
        ? `/api/admin/products/snacks/${selectedSnack.id}`
        : "/api/admin/products/snacks"
      const method = selectedSnack ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setIsCreateModalOpen(false)
        setIsEditModalOpen(false)
        setSelectedSnack(null)
        fetchSnacks() // Refresh list
      } else {
        setError(data.error || "Failed to save snack")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save snack")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Bulk operations
  const handleSelectSnack = (snackId: number, checked: boolean) => {
    if (checked) {
      setSelectedSnacks([...selectedSnacks, snackId])
    } else {
      setSelectedSnacks(selectedSnacks.filter((id) => id !== snackId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSnacks(filteredSnacks.map((snack) => snack.id))
    } else {
      setSelectedSnacks([])
    }
  }

  const handleBulkActivate = async () => {
    if (selectedSnacks.length === 0) return
    setIsBulkProcessing(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/products/snacks/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "activate",
          ids: selectedSnacks,
        }),
      })

      const data = await response.json()
      if (response.ok && data.success) {
        setSelectedSnacks([])
        fetchSnacks()
      } else {
        setError(data.error || "Failed to activate snacks")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to activate snacks")
    } finally {
      setIsBulkProcessing(false)
    }
  }

  const handleBulkDeactivate = async () => {
    if (selectedSnacks.length === 0) return
    setIsBulkProcessing(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/products/snacks/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "deactivate",
          ids: selectedSnacks,
        }),
      })

      const data = await response.json()
      if (response.ok && data.success) {
        setSelectedSnacks([])
        fetchSnacks()
      } else {
        setError(data.error || "Failed to deactivate snacks")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to deactivate snacks")
    } finally {
      setIsBulkProcessing(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedSnacks.length === 0) return
    if (!confirm(`Are you sure you want to delete ${selectedSnacks.length} snack(s)?`)) return

    setIsBulkProcessing(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/products/snacks/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          ids: selectedSnacks,
        }),
      })

      const data = await response.json()
      if (response.ok && data.success) {
        setSelectedSnacks([])
        fetchSnacks()
      } else {
        setError(data.error || "Failed to delete snacks")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete snacks")
    } finally {
      setIsBulkProcessing(false)
    }
  }

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!selectedSnack) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/products/snacks/${selectedSnack.id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setIsDeleteDialogOpen(false)
        setSelectedSnack(null)
        fetchSnacks() // Refresh list
      } else {
        setError(data.error || "Failed to delete snack")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete snack")
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredSnacks = snacks.filter((snack) => {
    const matchesSearch =
      snack.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snack.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snack.category?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === "all" || snack.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  const formatCurrency = (amount: number | string | undefined) => {
    const numAmount = Number(amount) || 0
    return `${numAmount.toFixed(2)} MAD`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
      case "out_of_stock":
        return <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Snacks & Supplements</h1>
            <p className="text-muted-foreground">Manage your snack products</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const totalSnacks = snacks.length
  const activeSnacks = snacks.filter((snack) => snack.status === "active").length
  const outOfStock = snacks.filter((snack) => snack.status === "out_of_stock").length
  const totalValue = snacks.reduce(
    (sum, snack) => sum + (Number(snack.price) || 0) * (Number(snack.stock_quantity) || 0),
    0,
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Snacks & Supplements</h1>
          <p className="text-muted-foreground">Manage your snack products</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchSnacks} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={() => window.open("/api/admin/products/snacks/export?format=csv", "_blank")}
            variant="outline"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button
            onClick={() => window.open("/api/admin/products/snacks/export?format=json", "_blank")}
            variant="outline"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            JSON
          </Button>
          <Button onClick={handleCreate} disabled={isSubmitting}>
            <Plus className="h-4 w-4 mr-2" />
            Add Snack
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-red-600">{error}</p>
              <Button onClick={fetchSnacks} variant="outline" size="sm">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSnacks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeSnacks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStock}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search snacks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="protein_bars">Protein Bars</SelectItem>
                <SelectItem value="supplements">Supplements</SelectItem>
                <SelectItem value="healthy_snacks">Healthy Snacks</SelectItem>
                <SelectItem value="beverages">Beverages</SelectItem>
              </SelectContent>
            </Select>
            {filteredSnacks.length > 0 && (
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedSnacks.length === filteredSnacks.length && filteredSnacks.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <Label className="text-sm">Select All</Label>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredSnacks.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium">No snacks found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || categoryFilter !== "all"
                ? "No snacks match your current filters."
                : "Start by adding your first snack product."}
            </p>
            <Button className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Add Snack
            </Button>
          </div>
        ) : (
          filteredSnacks.map((snack) => (
            <Card key={snack.id} className="overflow-hidden relative">
              <div className="absolute top-2 left-2 z-10">
                <Checkbox
                  checked={selectedSnacks.includes(snack.id)}
                  onCheckedChange={(checked) => handleSelectSnack(snack.id, checked as boolean)}
                />
              </div>
              <div className="aspect-square relative bg-gray-100">
                {snack.image_url ? (
                  <Image src={snack.image_url || "/placeholder.svg"} alt={snack.name} fill className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-sm line-clamp-2">{snack.name}</h3>
                  {getStatusBadge(snack.status)}
                </div>
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">{snack.description}</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-green-600">{formatCurrency(snack.price)}</span>
                  <span className="text-xs text-gray-500">Stock: {snack.stock_quantity || 0}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    onClick={() => handleEdit(snack)}
                    disabled={isSubmitting}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick(snack)}
                    disabled={isSubmitting}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                  <Select value={snack.status} onValueChange={(value) => handleStatusUpdate(snack.id, value)}>
                    <SelectTrigger className="w-24 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )          )
        )}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={isCreateModalOpen || isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateModalOpen(false)
          setIsEditModalOpen(false)
          setSelectedSnack(null)
          setError(null)
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedSnack ? "Edit Snack" : "Add New Snack"}</DialogTitle>
            <DialogDescription>
              {selectedSnack ? "Update snack information" : "Create a new snack product"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (MAD) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="protein_bars">Protein Bars</SelectItem>
                    <SelectItem value="supplements">Supplements</SelectItem>
                    <SelectItem value="healthy_snacks">Healthy Snacks</SelectItem>
                    <SelectItem value="beverages">Beverages</SelectItem>
                    <SelectItem value="snacks">Snacks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock_quantity">Stock Quantity</Label>
                <Input
                  id="stock_quantity"
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Image</Label>
              <ImageUpload
                onUploadComplete={(url) => setFormData({ ...formData, image_url: url })}
                buttonText="Upload Snack Image"
              />
              {formData.image_url && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">Current image:</p>
                  <Image
                    src={formData.image_url}
                    alt="Snack preview"
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
                  setSelectedSnack(null)
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
                  selectedSnack ? "Update" : "Create"
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
            <AlertDialogTitle>Delete Snack</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedSnack?.name}"? This action cannot be undone.
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
