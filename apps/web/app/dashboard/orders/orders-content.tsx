"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { DashboardLayout } from "../dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ShoppingBag, Search, Filter, CheckCircle, Clock, AlertTriangle, XCircle } from "lucide-react"

interface Order {
  id: string
  date: string
  status: "pending" | "processing" | "delivered" | "cancelled"
  total: number
  items: number
  type: "meal_plan" | "express_shop" | "mixed"
}

export function OrdersContent() {
  const [isLoading, setIsLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date-desc")

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await fetch("/api/orders")

        if (!response.ok) {
          throw new Error("Failed to load orders")
        }

        const data = await response.json()
        setOrders(data.orders || [])
      } catch (error) {
        console.error("Error loading orders:", error)
        setError("Failed to load your orders. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [])

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Filter and sort orders
  const filteredOrders = orders
    .filter((order) => {
      // Search filter
      if (searchQuery && !order.id.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      // Status filter
      if (statusFilter !== "all" && order.status !== statusFilter) {
        return false
      }

      // Type filter
      if (typeFilter !== "all" && order.type !== typeFilter) {
        return false
      }

      return true
    })
    .sort((a, b) => {
      // Sort by date or total
      if (sortBy === "date-desc") {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      } else if (sortBy === "date-asc") {
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      } else if (sortBy === "total-desc") {
        return b.total - a.total
      } else {
        return a.total - b.total
      }
    })

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "processing":
        return <Clock className="h-5 w-5 text-blue-600" />
      case "pending":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <ShoppingBag className="h-5 w-5 text-gray-600" />
    }
  }

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case "delivered":
        return "Delivered"
      case "processing":
        return "Processing"
      case "pending":
        return "Pending"
      case "cancelled":
        return "Cancelled"
      default:
        return status
    }
  }

  // Get order type text
  const getOrderTypeText = (type: string) => {
    switch (type) {
      case "meal_plan":
        return "Meal Plan"
      case "express_shop":
        return "Express Shop"
      case "mixed":
        return "Mixed Order"
      default:
        return type
    }
  }

  // Mock data for demonstration
  const mockOrders: Order[] = [
    {
      id: "ORD-12345",
      date: "2023-06-01T14:30:00",
      status: "delivered",
      total: 349,
      items: 3,
      type: "meal_plan",
    },
    {
      id: "ORD-12346",
      date: "2023-05-15T10:15:00",
      status: "delivered",
      total: 249,
      items: 2,
      type: "express_shop",
    },
    {
      id: "ORD-12347",
      date: "2023-06-10T09:45:00",
      status: "processing",
      total: 499,
      items: 5,
      type: "mixed",
    },
    {
      id: "ORD-12348",
      date: "2023-06-12T16:20:00",
      status: "pending",
      total: 199,
      items: 1,
      type: "express_shop",
    },
    {
      id: "ORD-12349",
      date: "2023-05-05T11:30:00",
      status: "cancelled",
      total: 299,
      items: 3,
      type: "meal_plan",
    },
  ]

  // Use mock data for now, replace with actual data when available
  const displayOrders = orders.length > 0 ? filteredOrders : mockOrders

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Order History</h1>
        <p className="text-gray-600">View and track all your orders</p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <ShoppingBag className="h-4 w-4 text-gray-500" />
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Order Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="meal_plan">Meal Plan</SelectItem>
                    <SelectItem value="express_shop">Express Shop</SelectItem>
                    <SelectItem value="mixed">Mixed Order</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Newest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                  <SelectItem value="total-desc">Highest Amount</SelectItem>
                  <SelectItem value="total-asc">Lowest Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Orders</CardTitle>
          <CardDescription>
            {displayOrders.length} order{displayOrders.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {displayOrders.length > 0 ? (
            <div className="space-y-4">
              {displayOrders.map((order) => (
                <div key={order.id} className="overflow-hidden rounded-lg border">
                  <div className="flex flex-col justify-between p-4 sm:flex-row sm:items-center">
                    <div className="mb-4 flex items-center space-x-4 sm:mb-0">
                      <div className="rounded-full bg-gray-100 p-2">{getStatusIcon(order.status)}</div>
                      <div>
                        <p className="font-medium">Order #{order.id}</p>
                        <p className="text-sm text-gray-500">{formatDate(order.date)}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:space-x-4">
                      <div className="mr-4 flex flex-col">
                        <span className="text-sm text-gray-500">Status</span>
                        <span className="font-medium">{getStatusText(order.status)}</span>
                      </div>
                      <div className="mr-4 flex flex-col">
                        <span className="text-sm text-gray-500">Type</span>
                        <span className="font-medium">{getOrderTypeText(order.type)}</span>
                      </div>
                      <div className="mr-4 flex flex-col">
                        <span className="text-sm text-gray-500">Items</span>
                        <span className="font-medium">{order.items}</span>
                      </div>
                      <div className="mr-4 flex flex-col">
                        <span className="text-sm text-gray-500">Total</span>
                        <span className="font-medium">{order.total} MAD</span>
                      </div>
                      <Link href={`/dashboard/orders/${order.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center p-12 text-center">
              <ShoppingBag className="mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-xl font-medium">No Orders Found</h3>
              <p className="mb-6 text-gray-500">
                {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                  ? "No orders match your current filters. Try adjusting your search criteria."
                  : "You haven't placed any orders yet. Browse our meal plans or express shop to get started."}
              </p>
              <div className="flex space-x-4">
                <Link href="/meal-plans">
                  <Button variant="outline">Browse Meal Plans</Button>
                </Link>
                <Link href="/express-shop">
                  <Button className="bg-green-600 hover:bg-green-700">Shop Now</Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
