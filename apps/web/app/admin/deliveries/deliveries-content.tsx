"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, MapPin, Clock, CheckCircle, RefreshCw, Truck } from "lucide-react"

interface Delivery {
  id: number
  order_id: number
  customer_name: string
  customer_email: string
  customer_phone?: string
  delivery_address: string
  delivery_date: string
  delivery_time: string
  status: "pending" | "delivered"
  total_amount: number
  created_at: string
}

export default function DeliveriesContent() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchDeliveries()
  }, [])

  const fetchDeliveries = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/admin/deliveries")
      const data = await response.json()

      if (response.ok) {
        setDeliveries(data.deliveries || [])
        console.log("Loaded deliveries:", data.deliveries?.length || 0)
      } else {
        setError(data.message || "Failed to load deliveries")
        console.error("API error:", data)
      }
    } catch (error) {
      console.error("Failed to fetch deliveries:", error)
      setError("Failed to load deliveries")
    } finally {
      setLoading(false)
    }
  }

  const markAsDelivered = async (deliveryId: number) => {
    try {
      const response = await fetch(`/api/admin/deliveries/${deliveryId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "delivered" }),
      })

      if (response.ok) {
        // Refresh deliveries
        fetchDeliveries()
      } else {
        alert("Failed to update delivery status")
      }
    } catch (error) {
      console.error("Failed to update delivery:", error)
      alert("Failed to update delivery status")
    }
  }

  const filteredDeliveries = deliveries.filter(
    (delivery) =>
      delivery.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.delivery_address.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const pendingDeliveries = deliveries.filter((d) => d.status === "pending")
  const todayDeliveries = deliveries.filter((d) => {
    const deliveryDate = new Date(d.delivery_date)
    const today = new Date()
    return deliveryDate.toDateString() === today.toDateString()
  })

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
          <Button onClick={fetchDeliveries} variant="outline" size="sm">
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
            placeholder="Search deliveries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={fetchDeliveries} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deliveries.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingDeliveries.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today's Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{todayDeliveries.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {deliveries.filter((d) => d.status === "delivered").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deliveries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Deliveries ({filteredDeliveries.length})</CardTitle>
          <CardDescription>Manage delivery schedules and mark orders as delivered</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Delivery Time</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeliveries.map((delivery) => (
                  <TableRow key={delivery.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">Order #{delivery.order_id}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(delivery.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{delivery.customer_name}</div>
                        <div className="text-sm text-gray-500">{delivery.customer_email}</div>
                        {delivery.customer_phone && (
                          <div className="text-sm text-gray-500">{delivery.customer_phone}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 mr-1 mt-0.5 text-gray-400" />
                        <div className="text-sm max-w-xs">{delivery.delivery_address}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium">
                            {new Date(delivery.delivery_date).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500">{delivery.delivery_time}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{delivery.total_amount.toFixed(2)} MAD</div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={delivery.status === "delivered" ? "default" : "secondary"}
                        className={
                          delivery.status === "delivered"
                            ? "bg-green-100 text-green-800"
                            : "bg-orange-100 text-orange-800"
                        }
                      >
                        {delivery.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {delivery.status === "pending" && (
                          <Button variant="outline" size="sm" onClick={() => markAsDelivered(delivery.id)}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark Delivered
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <Truck className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredDeliveries.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {deliveries.length === 0
                  ? "No deliveries found."
                  : "No deliveries found matching your search criteria."}
              </p>
              {deliveries.length === 0 && (
                <p className="text-sm text-gray-400 mt-2">Deliveries will appear here when orders are placed.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
