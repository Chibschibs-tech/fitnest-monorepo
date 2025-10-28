"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  DollarSign,
  Users,
  Package,
  ShoppingBag,
  AlertTriangle,
  Mail,
  Settings,
  BarChart3,
  UserCheck,
  Truck,
  PauseCircle,
  PlayCircle,
} from "lucide-react"

interface DashboardStats {
  totalRevenue: number
  activeSubscriptions: number
  mealsDelivered: number
  recentOrders: any[]
  popularPlans: any[]
  pendingDeliveries: number
  todayDeliveries: number
  pausedSubscriptions: number
  waitlistCount: number
  expressShopOrders: number
}

export function AdminDashboardContent() {
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/admin/dashboard")
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      } else {
        setError("Failed to load dashboard data")
      }
    } catch (error) {
      console.error("Failed to fetch admin dashboard data:", error)
      setError("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
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
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchDashboardData} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your fitness meal delivery business</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.totalRevenue || 0} MAD</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.activeSubscriptions || 0}</div>
            <p className="text-xs text-muted-foreground">{dashboardData?.pausedSubscriptions || 0} paused</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Deliveries</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.pendingDeliveries || 0}</div>
            <p className="text-xs text-muted-foreground">{dashboardData?.todayDeliveries || 0} today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Waitlist</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.waitlistCount || 0}</div>
            <p className="text-xs text-muted-foreground">Potential customers</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Delivery Management
            </CardTitle>
            <CardDescription>Manage daily deliveries and mark as completed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Today's Deliveries</span>
              <Badge variant="outline">{dashboardData?.todayDeliveries || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Pending Total</span>
              <Badge variant="outline">{dashboardData?.pendingDeliveries || 0}</Badge>
            </div>
            <Link href="/admin/deliveries">
              <Button className="w-full">Manage Deliveries</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Orders & Subscriptions
            </CardTitle>
            <CardDescription>View and manage customer orders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Active Subscriptions</span>
              <Badge variant="outline">{dashboardData?.activeSubscriptions || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Express Shop Orders</span>
              <Badge variant="outline">{dashboardData?.expressShopOrders || 0}</Badge>
            </div>
            <Link href="/admin/orders/orders">
              <Button className="w-full">View Orders</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PauseCircle className="h-5 w-5" />
              Subscription Control
            </CardTitle>
            <CardDescription>Pause, resume, and modify subscriptions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Paused Subscriptions</span>
              <Badge variant="outline">{dashboardData?.pausedSubscriptions || 0}</Badge>
            </div>
            <div className="flex gap-2">
              <Link href="/admin/orders/subscriptions" className="flex-1">
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <PauseCircle className="h-4 w-4 mr-1" />
                  Paused
                </Button>
              </Link>
              <Link href="/admin/orders/subscriptions" className="flex-1">
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <PlayCircle className="h-4 w-4 mr-1" />
                  Active
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Sections */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest customer orders and subscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData?.recentOrders?.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentOrders.slice(0, 5).map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Order #{order.id}</p>
                      <p className="text-sm text-gray-600">{order.customer_name || `User ${order.user_id}`}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{order.total_amount} MAD</p>
                      <Badge variant={order.status === "active" ? "default" : "outline"} className="text-xs">
                        {order.status || "pending"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No recent orders</p>
            )}
            <div className="mt-4">
              <Link href="/admin/orders/orders">
                <Button variant="outline" className="w-full bg-transparent">
                  View All Orders
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Management</CardTitle>
            <CardDescription>Administrative tools and settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Link href="/admin/waitlist">
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <Mail className="h-4 w-4 mr-2" />
                  Waitlist
                </Button>
              </Link>
              <Link href="/admin/system-diagnostic">
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <Settings className="h-4 w-4 mr-2" />
                  System
                </Button>
              </Link>
              <Link href="/admin/nutrition-manager">
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Nutrition
                </Button>
              </Link>
              <Link href="/admin/email-diagnostic">
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
              </Link>
            </div>
            <div className="pt-2 border-t">
              <Link href="/admin/meals/add">
                <Button className="w-full bg-green-600 hover:bg-green-700">Add New Meal Plan</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Meal Plans</CardTitle>
          <CardDescription>Most ordered plans this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {dashboardData?.popularPlans?.map((plan: any) => (
              <div key={plan.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{plan.name}</p>
                  <p className="text-sm text-gray-600">{plan.count} orders</p>
                </div>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </div>
            )) || (
              <div className="col-span-full text-center py-8">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium">No plan data available</h3>
                <p className="mt-1 text-sm text-gray-500">Plan statistics will appear here once orders are placed.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
