"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Edit, Trash2 } from "lucide-react"
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
        <Button>
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
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
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
    </div>
  )
}
