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
import { Search, Plus, Edit, Trash2, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"

interface Accessory {
  id: number
  name: string
  description: string
  price: number
  sale_price?: number
  category: string
  brand?: string
  image_url?: string
  is_available: boolean
  stock_quantity?: number
}

export function AccessoriesContent() {
  const [accessories, setAccessories] = useState<Accessory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedAccessory, setSelectedAccessory] = useState<Accessory | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    sale_price: "",
    category: "accessory",
    brand: "",
    image_url: "",
    stock_quantity: "0",
    is_available: true,
  })

  useEffect(() => {
    fetchAccessories()
  }, [])

  const fetchAccessories = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/products/accessories")
      if (!response.ok) {
        throw new Error("Failed to fetch accessories")
      }
      const data = await response.json()
      setAccessories(data.accessories || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch accessories")
    } finally {
      setLoading(false)
    }
  }

  const filteredAccessories = accessories.filter(
    (accessory) =>
      accessory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      accessory.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (accessory.brand && accessory.brand.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Handle create
  const handleCreate = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      sale_price: "",
      category: "accessory",
      brand: "",
      image_url: "",
      stock_quantity: "0",
      is_available: true,
    })
    setSelectedAccessory(null)
    setIsCreateModalOpen(true)
  }

  // Handle edit
  const handleEdit = (accessory: Accessory) => {
    setSelectedAccessory(accessory)
    setFormData({
      name: accessory.name,
      description: accessory.description || "",
      price: accessory.price.toString(),
      sale_price: accessory.sale_price?.toString() || "",
      category: accessory.category || "accessory",
      brand: accessory.brand || "",
      image_url: accessory.image_url || "",
      stock_quantity: accessory.stock_quantity?.toString() || "0",
      is_available: accessory.is_available,
    })
    setIsEditModalOpen(true)
  }

  // Handle delete
  const handleDeleteClick = (accessory: Accessory) => {
    setSelectedAccessory(accessory)
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
        price: Number.parseFloat(formData.price),
        sale_price: formData.sale_price ? Number.parseFloat(formData.sale_price) : null,
        category: formData.category,
        brand: formData.brand || null,
        image_url: formData.image_url || null,
        stock_quantity: Number.parseInt(formData.stock_quantity) || 0,
        is_available: formData.is_available,
      }

      const url = selectedAccessory
        ? `/api/admin/products/accessories/${selectedAccessory.id}`
        : "/api/admin/products/accessories"
      const method = selectedAccessory ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setIsCreateModalOpen(false)
        setIsEditModalOpen(false)
        setSelectedAccessory(null)
        fetchAccessories() // Refresh list
      } else {
        setError(data.error || "Failed to save accessory")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save accessory")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!selectedAccessory) return

    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch(`/api/admin/products/accessories/${selectedAccessory.id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setIsDeleteDialogOpen(false)
        setSelectedAccessory(null)
        fetchAccessories() // Refresh list
      } else {
        setError(data.error || "Failed to delete accessory")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete accessory")
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
          <h1 className="text-2xl font-bold">Accessories Management</h1>
          <p className="text-gray-600">Manage your accessory products</p>
        </div>
        <Button onClick={handleCreate} disabled={isSubmitting}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Accessory
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
              placeholder="Search accessories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accessories ({filteredAccessories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccessories.map((accessory) => (
                <TableRow key={accessory.id}>
                  <TableCell>
                    <div className="relative h-12 w-12 rounded-md overflow-hidden">
                      <Image
                        src={accessory.image_url || "/placeholder.svg?height=48&width=48"}
                        alt={accessory.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{accessory.name}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{accessory.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>{accessory.brand || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{accessory.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      {accessory.sale_price ? (
                        <>
                          <span className="line-through text-gray-400">{accessory.price} MAD</span>
                          <span className="font-semibold text-red-600">{accessory.sale_price} MAD</span>
                        </>
                      ) : (
                        <span>{accessory.price} MAD</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {accessory.stock_quantity !== undefined ? `${accessory.stock_quantity} units` : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={accessory.is_available ? "default" : "secondary"}>
                      {accessory.is_available ? "Available" : "Unavailable"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(accessory)}
                        disabled={isSubmitting}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(accessory)}
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

          {filteredAccessories.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No accessories found</p>
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
          setSelectedAccessory(null)
          setError("")
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedAccessory ? "Edit Accessory" : "Add New Accessory"}</DialogTitle>
            <DialogDescription>
              {selectedAccessory ? "Update accessory information" : "Create a new accessory product"}
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
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sale_price">Sale Price (MAD)</Label>
                <Input
                  id="sale_price"
                  type="number"
                  step="0.01"
                  value={formData.sale_price}
                  onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="bag">Bag</option>
                  <option value="bottle">Bottle</option>
                  <option value="apparel">Apparel</option>
                  <option value="equipment">Equipment</option>
                  <option value="accessory">Accessory</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock_quantity">Stock Quantity</Label>
                <Input
                  id="stock_quantity"
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                />
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
                  setSelectedAccessory(null)
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
                  selectedAccessory ? "Update" : "Create"
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
            <AlertDialogTitle>Delete Accessory</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedAccessory?.name}"? This action cannot be undone.
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
