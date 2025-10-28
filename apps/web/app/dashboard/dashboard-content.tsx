"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, ShoppingCart, Settings, User, Calendar, ArrowRight } from "lucide-react"

interface UserType {
  id: number
  name: string
  email: string
  role?: string
}

type OrderType = {
  id: number
  user_id: number
  status: string | null
  plan_id: number | null
  meal_plan_id: number | null
  total_amount: number | null
  created_at: string | null
  plan_name?: string
  price_per_week?: number
}

type ExpressShopOrderType = {
  id: number
  user_id: number
  total_amount: number | null
  status: string | null
  created_at: string | null
  order_type: string
}

type DashboardPayload = {
  user: UserType
  activeSubscriptions?: OrderType[]
  orderHistory?: OrderType[]
  expressShopOrders?: ExpressShopOrderType[]
  upcomingDeliveries?: any[]
  stats?: {
    totalOrders: number
    totalExpressShopOrders: number
    totalExpressShopSpent: number
  }
}

interface DashboardContentProps {
  user: UserType
}

export function DashboardContent({ user }: DashboardContentProps) {
  const [dashboardData, setDashboardData] = useState<DashboardPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setError(null)
      const response = await fetch("/api/user/dashboard", {
        cache: "no-store",
        credentials: "include",
      })

      if (response.ok) {
        const raw = await response.json()
        console.log("Dashboard data received:", raw)
        const data: DashboardPayload = raw?.data ?? raw
        setDashboardData(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to fetch dashboard data")
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
      setError("Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome back, {user.name}!</h1>
          <p className="text-gray-600">Loading your fitness journey overview...</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome back, {user.name}!</h1>
          <p className="text-red-600">Error loading dashboard: {error}</p>
        </div>
        <Button onClick={fetchDashboardData}>Retry</Button>
      </div>
    )
  }

  const activeSubscriptionsCount = dashboardData?.activeSubscriptions?.length ?? 0
  const totalExpressShopOrders = dashboardData?.stats?.totalExpressShopOrders ?? 0
  const totalExpressShopSpent = dashboardData?.stats?.totalExpressShopSpent ?? 0

  // Combine and sort all orders by date
  const allOrders = [
    ...(dashboardData?.orderHistory?.map((order) => ({
      ...order,
      type: "meal_plan",
      displayId: `Subscription #${order.id}`,
      displayName: order.plan_name || "Meal Plan Subscription",
    })) ?? []),
    ...(dashboardData?.expressShopOrders?.map((order) => ({
      ...order,
      type: "express_shop",
      displayId: `Order #${order.id}`,
      displayName: "Express Shop Order",
    })) ?? []),
  ].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {user.name}!</h1>
        <p className="text-gray-600">Here's your fitness journey overview</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscriptionsCount}</div>
            <p className="text-xs text-muted-foreground">
              {activeSubscriptionsCount === 0
                ? "No active meal plan subscriptions"
                : `You have ${activeSubscriptionsCount} active subscription${activeSubscriptionsCount > 1 ? "s" : ""}`}
            </p>
            <div className="mt-3">
              {activeSubscriptionsCount > 0 ? (
                <Link href="/dashboard/my-meal-plans">
                  <Button variant="outline" size="sm">
                    Manage My Subscriptions
                  </Button>
                </Link>
              ) : (
                <Link href="/meal-plans">
                  <Button variant="outline" size="sm">
                    Browse Meal Plans
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Delivery</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.upcomingDeliveries?.length
                ? new Date(dashboardData.upcomingDeliveries[0].delivery_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                : "None"}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.upcomingDeliveries?.length
                ? "Your next scheduled delivery"
                : "No upcoming deliveries scheduled"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Express Shop Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExpressShopOrders}</div>
            <p className="text-xs text-muted-foreground">
              {totalExpressShopSpent > 0
                ? `${totalExpressShopSpent.toFixed(2)} MAD total spent`
                : "No express shop orders yet"}
            </p>
            <div className="mt-3">
              <Link href="/express-shop">
                <Button variant="outline" size="sm">
                  Browse Express Shop
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your latest meal plan subscriptions and express shop orders</CardDescription>
          </CardHeader>
          <CardContent>
            {allOrders.length ? (
              <div className="space-y-4">
                {allOrders.slice(0, 5).map((order: any) => (
                  <div key={`${order.type}-${order.id}`} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{order.displayId}</p>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {order.type === "meal_plan" ? "Subscription" : "Express Shop"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{order.displayName}</p>
                      <p className="text-sm text-gray-500">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : "Unknown"}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className="font-medium">
                          {(() => {
                            const amt = order.total_amount ?? 0
                            const normalized =
                              Number(amt) >= 1000
                                ? (Number(amt) / 100).toFixed(2)
                                : (Number(amt).toFixed?.(2) ?? `${amt}`)
                            return `${normalized} MAD`
                          })()}
                        </p>
                        <p className="text-sm text-gray-600 capitalize">{order.status ?? "pending"}</p>
                      </div>
                      <Link
                        href={
                          order.type === "meal_plan"
                            ? `/dashboard/my-meal-plans/${order.id}`
                            : `/dashboard/orders/${order.id}`
                        }
                      >
                        <Button variant="ghost" size="sm">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
                {allOrders.length > 5 && (
                  <div className="pt-4 border-t">
                    <Link href="/dashboard/orders">
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        View All Orders
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No orders yet</p>
                <Link href="/meal-plans">
                  <Button variant="outline" size="sm">
                    Browse Meal Plans
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your account and orders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/meal-plans" className="w-full">
              <Button className="w-full bg-transparent" variant="outline">
                <Package className="mr-2 h-4 w-4" />
                Browse Meal Plans
              </Button>
            </Link>
            <Link href="/express-shop" className="w-full">
              <Button className="w-full bg-transparent" variant="outline">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Express Shop
              </Button>
            </Link>
            <Link href="/dashboard/orders" className="w-full">
              <Button className="w-full bg-transparent" variant="outline">
                <User className="mr-2 h-4 w-4" />
                Order History
              </Button>
            </Link>
            <Button className="w-full bg-transparent" variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Account Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
