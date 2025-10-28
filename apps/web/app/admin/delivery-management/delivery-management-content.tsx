"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Package, Clock, CheckCircle, Truck, AlertTriangle } from "lucide-react"

interface Delivery {
  id: number
  order_id: number
  customer_name: string
  customer_email: string
  delivery_date: string
  status: string
  total_amount: number
  week_number: number
}

export function DeliveryManagementContent() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [selectedDeliveries, setSelectedDeliveries] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    today: 0,
  })

  useEffect(() => {
    fetchDeliveries()
  }, [])

  const fetchDeliveries = async () => {
    try {
      const response = await fetch("/api/admin/get-pending-deliveries")

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login"
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Deliveries data:", data)

      if (data.success) {
        setDeliveries(data.deliveries || [])
        setStats({
          total: data.deliveries?.length || 0,
          pending: data.deliveries?.filter((d: Delivery) => d.status === "pending")?.length || 0,
          today:
            data.deliveries?.filter((d: Delivery) => {
              const today = new Date().toDateString()
              const deliveryDate = new Date(d.delivery_date).toDateString()
              return today === deliveryDate
            })?.length || 0,
        })
      } else {
        setError(data.error || "Failed to fetch deliveries")
      }
    } catch (error) {
      console.error("Error fetching deliveries:", error)
      setError("Failed to load deliveries. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsDelivered = async () => {
    if (selectedDeliveries.length === 0) return

    try {
      const response = await fetch("/api/admin/mark-delivery-delivered", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryIds: selectedDeliveries }),
      })

      if (response.ok) {
        setMessage(`${selectedDeliveries.length} deliveries marked as delivered`)
        setSelectedDeliveries([])
        fetchDeliveries()
        setTimeout(() => setMessage(null), 5000)
      } else {
        setError("Failed to update deliveries")
      }
    } catch (error) {
      console.error("Error marking deliveries as delivered:", error)
      setError("Error updating deliveries")
    }
  }

  const handleSelectDelivery = (deliveryId: number, checked: boolean) => {
    if (checked) {
      setSelectedDeliveries([...selectedDeliveries, deliveryId])
    } else {
      setSelectedDeliveries(selectedDeliveries.filter((id) => id !== deliveryId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDeliveries(deliveries.map((d) => d.id))
    } else {
      setSelectedDeliveries([])
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
            Pending
          </Badge>
        )
      case "delivered":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700">
            Delivered
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700">
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Link href="/admin" className="flex items-center text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Admin Dashboard
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Loading deliveries...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32 animate-pulse rounded-md bg-muted" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Link href="/admin" className="flex items-center text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Admin Dashboard
          </Link>
        </div>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchDeliveries} className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href="/admin" className="flex items-center text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Admin Dashboard
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Delivery Management</h1>
        <p className="text-gray-600">Manage customer meal deliveries and mark them as completed</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <Package className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Deliveries</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Truck className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Deliveries</p>
              <p className="text-2xl font-bold">{stats.today}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {message && (
        <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Deliveries</CardTitle>
              <CardDescription>Select deliveries to mark as completed</CardDescription>
            </div>
            {selectedDeliveries.length > 0 && (
              <Button onClick={handleMarkAsDelivered} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark {selectedDeliveries.length} as Delivered
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {deliveries.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium">No deliveries found</h3>
              <p className="mt-1 text-sm text-gray-500">Deliveries will appear here when orders are placed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header with select all */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <Checkbox checked={selectedDeliveries.length === deliveries.length} onCheckedChange={handleSelectAll} />
                <div className="grid grid-cols-6 gap-4 flex-1 text-sm font-medium text-gray-600">
                  <div>Order #</div>
                  <div>Customer</div>
                  <div>Amount</div>
                  <div>Delivery Date</div>
                  <div>Week</div>
                  <div>Status</div>
                </div>
              </div>

              {/* Delivery rows */}
              {deliveries.map((delivery) => (
                <div key={delivery.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <Checkbox
                    checked={selectedDeliveries.includes(delivery.id)}
                    onCheckedChange={(checked) => handleSelectDelivery(delivery.id, checked as boolean)}
                  />
                  <div className="grid grid-cols-6 gap-4 flex-1 text-sm">
                    <div className="font-medium">#{delivery.order_id}</div>
                    <div>
                      <p className="font-medium">{delivery.customer_name}</p>
                      <p className="text-gray-500 text-xs">{delivery.customer_email}</p>
                    </div>
                    <div className="font-medium">{delivery.total_amount} MAD</div>
                    <div>{formatDate(delivery.delivery_date)}</div>
                    <div>Week {delivery.week_number}</div>
                    <div>{getStatusBadge(delivery.status)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
