"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Package, Plus, Edit, RefreshCw } from "lucide-react"
import Image from "next/image"

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
      const response = await fetch(`/api/admin/products/snacks/${snackId}/status`, {
        method: "PATCH",
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
          <Button>
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
            <Card key={snack.id} className="overflow-hidden">
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
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
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
          ))
        )}
      </div>
    </div>
  )
}
