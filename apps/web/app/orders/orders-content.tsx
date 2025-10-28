"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function OrdersContent() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function fetchUserData() {
      try {
        const res = await fetch("/api/auth/session")
        const data = await res.json()

        if (data.user) {
          setUser(data.user)
        } else {
          setError("Unable to load user data. Please try logging in again.")
        }
      } catch (err) {
        console.error("Error fetching user data:", err)
        setError("Something went wrong. Please refresh the page and try again.")
      } finally {
        setLoading(false)
      }
    }

    async function fetchOrders() {
      try {
        console.log("Fetching orders...") // Debug log
        const response = await fetch("/api/orders")

        console.log("Response status:", response.status) // Debug log
        console.log("Response ok:", response.ok) // Debug log

        if (!response.ok) {
          const errorText = await response.text()
          console.error("API Error:", errorText) // Debug log
          throw new Error(`Failed to load orders: ${response.status}`)
        }

        const data = await response.json()
        console.log("Raw orders data:", data) // Debug log

        // Handle both array and object responses
        let ordersArray = []
        if (Array.isArray(data)) {
          ordersArray = data
        } else if (data.orders && Array.isArray(data.orders)) {
          ordersArray = data.orders
        } else {
          console.log("Unexpected data format:", data)
          ordersArray = []
        }

        // Transform the database orders to match the expected format
        const transformedOrders = ordersArray.map((order) => ({
          id: order.id,
          date: order.created_at ? new Date(order.created_at).toLocaleDateString() : "Unknown Date",
          status:
            order.status === "pending"
              ? "Active"
              : order.status === "completed"
                ? "Completed"
                : order.status === "cancelled"
                  ? "Cancelled"
                  : order.status || "Unknown",
          mealPlan: order.plan_id ? `Plan ${order.plan_id}` : "Unknown Plan",
          totalAmount: order.total_amount ? `${(order.total_amount / 100).toFixed(2)} MAD` : "0.00 MAD",
        }))

        console.log("Transformed orders:", transformedOrders) // Debug log
        setOrders(transformedOrders)
      } catch (error) {
        console.error("Detailed error loading orders:", error)
        // Don't set error state, just show empty orders
        setOrders([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
    fetchOrders()
  }, [])

  const filteredOrders = orders.filter((order) => {
    const searchLower = searchQuery.toLowerCase()
    const orderIdMatch = order.id ? String(order.id).toLowerCase().includes(searchLower) : false
    const mealPlanMatch = order.mealPlan ? String(order.mealPlan).toLowerCase().includes(searchLower) : false
    return orderIdMatch || mealPlanMatch
  })

  const displayOrders = filteredOrders

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          Please log in to view your orders.
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Your Orders</h1>
        <p className="text-gray-600">View and manage your meal plan orders</p>
      </div>

      {displayOrders.length > 0 ? (
        <div className="space-y-6">
          {displayOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : order.status === "Completed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">{order.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Meal Plan</p>
                    <p className="font-medium">{order.mealPlan}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="font-medium">{order.totalAmount}</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Link href={`/dashboard/orders/${order.id}`}>
                    <Button variant="outline" size="sm" className="mr-2">
                      View Details
                    </Button>
                  </Link>
                  {order.status === "Active" && (
                    <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                      Cancel Subscription
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">You don't have any orders yet</h3>
          <p className="text-gray-500 mb-6">Start by exploring our meal plans and placing your first order</p>
          <Link href="/meal-plans">
            <Button>Browse Meal Plans</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
