"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Mail, Calendar, DollarSign, ShoppingBag, Edit, Trash2, Loader2, Play, Pause, X, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

interface Customer {
  id: number
  name: string
  email: string
  created_at: string
  role: string
  status?: string
  totalOrders: number
  totalSpent: number
  activeOrders: number
  orders: Array<{
    id: number
    total: number
    status: string
    created_at: string
  }>
}

export default function CustomerDetailContent({ customerId }: { customerId: string }) {
  const router = useRouter()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "customer",
  })
  const [adminNotes, setAdminNotes] = useState("")
  const [notesUpdating, setNotesUpdating] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState(false)
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [isCreateSubscriptionOpen, setIsCreateSubscriptionOpen] = useState(false)
  const [mealPlans, setMealPlans] = useState<any[]>([])
  const [planVariants, setPlanVariants] = useState<any[]>([])
  const [priceBreakdown, setPriceBreakdown] = useState<any>(null)
  const [priceLoading, setPriceLoading] = useState(false)
  const [subscriptionFormData, setSubscriptionFormData] = useState({
    meal_plan_id: "",
    plan_variant_id: "",
    meal_types: [] as string[],
    days_per_week: 5,
    duration_weeks: 4,
    start_date: new Date().toISOString().split('T')[0],
    delivery_address: "",
    delivery_city: "",
    delivery_postal_code: "",
    delivery_notes: "",
    payment_method: "cash_on_delivery",
    admin_discount_percentage: "",
    admin_override_price: "",
    admin_discount_reason: "",
    admin_notes: "",
  })

  useEffect(() => {
    fetchCustomerDetails()
    fetchSubscriptions()
  }, [customerId])

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/admin/customers/${customerId}`)
      const data = await response.json()
      
      if (response.ok && data.success) {
        setCustomer(data.customer)
        setAdminNotes(data.customer.admin_notes || "")
      } else {
        // Handle error response - extract message from error object
        const errorMessage = data.error?.message || data.error || data.message || "Failed to fetch customer details"
        setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage))
        setCustomer(null)
      }
    } catch (err) {
      console.error("Error fetching customer details:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch customer details"
      setError(errorMessage)
      setCustomer(null)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!customer) return

    setStatusUpdating(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/customers/${customerId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        fetchCustomerDetails() // Refresh customer data
      } else {
        setError(data.error || "Failed to update customer status")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update customer status")
    } finally {
      setStatusUpdating(false)
    }
  }

  const fetchSubscriptions = async () => {
    try {
      setSubscriptionsLoading(true)
      const response = await fetch(`/api/admin/customers/${customerId}/subscriptions`)
      const data = await response.json()
      
      if (response.ok && data.success) {
        setSubscriptions(data.subscriptions || [])
      } else {
        console.error("Failed to fetch subscriptions:", data.error)
      }
    } catch (err) {
      console.error("Error fetching subscriptions:", err)
    } finally {
      setSubscriptionsLoading(false)
    }
  }

  const handlePauseSubscription = async (subscriptionId: number) => {
    setActionLoading(subscriptionId)
    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}/pause`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pauseDurationDays: 14 }), // Default 14 days
      })
      const data = await response.json()
      
      if (response.ok && data.success) {
        fetchSubscriptions() // Refresh subscriptions
      } else {
        setError(data.message || "Failed to pause subscription")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to pause subscription")
    } finally {
      setActionLoading(null)
    }
  }

  const handleResumeSubscription = async (subscriptionId: number) => {
    setActionLoading(subscriptionId)
    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}/resume`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      const data = await response.json()
      
      if (response.ok && data.success) {
        fetchSubscriptions() // Refresh subscriptions
      } else {
        setError(data.message || "Failed to resume subscription")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resume subscription")
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancelSubscription = async (subscriptionId: number) => {
    if (!confirm("Are you sure you want to cancel this subscription? This action cannot be undone.")) {
      return
    }

    setActionLoading(subscriptionId)
    try {
      const response = await fetch(`/api/admin/subscriptions/${subscriptionId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "canceled" }),
      })
      const data = await response.json()
      
      if (response.ok && data.success) {
        fetchSubscriptions() // Refresh subscriptions
      } else {
        setError(data.error || "Failed to cancel subscription")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel subscription")
    } finally {
      setActionLoading(null)
    }
  }

  const handleSaveNotes = async () => {
    if (!customer) return

    setNotesUpdating(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/customers/${customerId}/notes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: adminNotes }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        fetchCustomerDetails() // Refresh customer data
      } else {
        setError(data.error || "Failed to update admin notes")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update admin notes")
    } finally {
      setNotesUpdating(false)
    }
  }

  const fetchMealPlans = async () => {
    try {
      const response = await fetch("/api/admin/products/meal-plans")
      const data = await response.json()
      if (response.ok && data.success) {
        setMealPlans(data.mealPlans || [])
      }
    } catch (err) {
      console.error("Error fetching meal plans:", err)
    }
  }

  const fetchPlanVariants = async (mealPlanId: string) => {
    if (!mealPlanId) {
      setPlanVariants([])
      return
    }
    try {
      const response = await fetch(`/api/admin/meal-plans/${mealPlanId}/variants`)
      const data = await response.json()
      if (response.ok && data.success) {
        setPlanVariants(data.variants || [])
        // Auto-select first variant if available
        if (data.variants && data.variants.length > 0) {
          setSubscriptionFormData(prev => ({
            ...prev,
            plan_variant_id: data.variants[0].id.toString(),
          }))
        }
      }
    } catch (err) {
      console.error("Error fetching plan variants:", err)
    }
  }

  useEffect(() => {
    if (subscriptionFormData.meal_plan_id) {
      fetchPlanVariants(subscriptionFormData.meal_plan_id)
    }
  }, [subscriptionFormData.meal_plan_id])

  const calculatePrice = async () => {
    if (!subscriptionFormData.meal_plan_id || !subscriptionFormData.plan_variant_id || subscriptionFormData.meal_types.length < 2) {
      setPriceBreakdown(null)
      return
    }

    setPriceLoading(true)
    try {
      const selectedPlan = mealPlans.find(p => p.id.toString() === subscriptionFormData.meal_plan_id)
      const response = await fetch("/api/calculate-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan?.name || selectedPlan?.title || "",
          meals: subscriptionFormData.meal_types,
          days: subscriptionFormData.days_per_week,
          duration: subscriptionFormData.duration_weeks,
        }),
      })
      const data = await response.json()
      if (response.ok && data.success) {
        // Apply admin discount if provided
        let finalPrice = data.totalRoundedMAD
        const discountsApplied = [...(data.discountsApplied || [])]
        
        if (subscriptionFormData.admin_discount_percentage) {
          const discountPercent = parseFloat(subscriptionFormData.admin_discount_percentage)
          const discountAmount = data.finalWeekly * subscriptionFormData.duration_weeks * (discountPercent / 100)
          finalPrice -= discountAmount
          discountsApplied.push({
            type: "admin_override",
            percentage: discountPercent,
            amount: discountAmount,
            reason: subscriptionFormData.admin_discount_reason || "Admin override",
          })
        }

        setPriceBreakdown({
          ...data,
          totalRoundedMAD: finalPrice,
          discountsApplied,
        })
      }
    } catch (err) {
      console.error("Error calculating price:", err)
    } finally {
      setPriceLoading(false)
    }
  }

  useEffect(() => {
    calculatePrice()
  }, [subscriptionFormData.meal_plan_id, subscriptionFormData.plan_variant_id, subscriptionFormData.meal_types, subscriptionFormData.days_per_week, subscriptionFormData.duration_weeks, subscriptionFormData.admin_discount_percentage])

  const handleCreateSubscription = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const payload: any = {
        plan_variant_id: Number.parseInt(subscriptionFormData.plan_variant_id),
        meal_types: subscriptionFormData.meal_types,
        days_per_week: subscriptionFormData.days_per_week,
        duration_weeks: subscriptionFormData.duration_weeks,
        start_date: subscriptionFormData.start_date,
        delivery_address: {
          address: subscriptionFormData.delivery_address,
          city: subscriptionFormData.delivery_city,
          postal_code: subscriptionFormData.delivery_postal_code,
        },
        delivery_notes: subscriptionFormData.delivery_notes,
        payment_method: subscriptionFormData.payment_method,
        admin_notes: subscriptionFormData.admin_notes,
      }

      if (subscriptionFormData.admin_discount_percentage) {
        payload.admin_discount_percentage = parseFloat(subscriptionFormData.admin_discount_percentage)
        payload.admin_discount_reason = subscriptionFormData.admin_discount_reason
      }

      if (subscriptionFormData.admin_override_price) {
        payload.admin_override_price = parseFloat(subscriptionFormData.admin_override_price)
      }

      const response = await fetch(`/api/admin/customers/${customerId}/subscriptions/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setIsCreateSubscriptionOpen(false)
        setSubscriptionFormData({
          meal_plan_id: "",
          plan_variant_id: "",
          meal_types: [],
          days_per_week: 5,
          duration_weeks: 4,
          start_date: new Date().toISOString().split('T')[0],
          delivery_address: "",
          delivery_city: "",
          delivery_postal_code: "",
          delivery_notes: "",
          payment_method: "cash_on_delivery",
          admin_discount_percentage: "",
          admin_override_price: "",
          admin_discount_reason: "",
          admin_notes: "",
        })
        setPriceBreakdown(null)
        fetchSubscriptions()
        alert("Subscription created successfully!")
      } else {
        setError(data.error || "Failed to create subscription")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create subscription")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = () => {
    if (!customer) return
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || "",
      password: "",
      role: customer.role,
    })
    setError(null)
    setIsEditModalOpen(true)
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customer) return
    
    setIsSubmitting(true)
    setError(null)

    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      }
      
      // Include phone if provided
      if (formData.phone !== undefined) {
        payload.phone = formData.phone || null
      }
      
      // Only include password if provided
      if (formData.password && formData.password.trim() !== "") {
        payload.password = formData.password
      }

      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setIsEditModalOpen(false)
        fetchCustomerDetails() // Refresh customer data
      } else {
        setError(data.error || "Failed to update customer")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update customer")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!customer) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Redirect to customers list
        router.push("/admin/customers")
      } else {
        setError(data.error || "Failed to delete customer")
        setIsDeleteDialogOpen(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete customer")
      setIsDeleteDialogOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fitnest-green"></div>
      </div>
    )
  }

  if (!customer && !loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Customer not found</h3>
          <p className="text-gray-600 mb-4">
            {error || "The customer you're looking for doesn't exist."}
          </p>
          {error && (
            <p className="text-sm text-gray-500">
              Customer ID: {customerId}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Customer Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-fitnest-green/10 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-fitnest-green" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
              <div className="flex items-center space-x-4 text-gray-600 flex-wrap">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  {customer.email}
                </div>
                {customer.phone && (
                  <div className="flex items-center">
                    <span className="text-sm">📞 {customer.phone}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Joined {new Date(customer.created_at).toLocaleDateString()}
                </div>
                {customer.last_login_at && (
                  <div className="flex items-center">
                    <span className="text-sm">
                      Last seen {new Date(customer.last_login_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant={customer.role === "customer" ? "default" : "secondary"}>{customer.role || "Customer"}</Badge>
            <div className="flex items-center gap-2">
              <Label htmlFor="status-select" className="text-sm text-gray-600 whitespace-nowrap">Status:</Label>
              <select
                id="status-select"
                value={customer.status || "active"}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={statusUpdating || customer.role === "admin"}
                className={`px-3 py-1.5 text-sm border rounded-md ${
                  customer.status === "active" ? "bg-green-50 text-green-700 border-green-200" :
                  customer.status === "inactive" ? "bg-gray-50 text-gray-700 border-gray-200" :
                  customer.status === "suspended" ? "bg-red-50 text-red-700 border-red-200" :
                  "bg-gray-50 text-gray-700 border-gray-200"
                } ${statusUpdating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
              {statusUpdating && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
            </div>
            <Button onClick={handleEdit} variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button onClick={handleDeleteClick} variant="destructive" size="sm" disabled={customer.role === "admin"}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ShoppingBag className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{customer.totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold">{customer.totalSpent.toFixed(2)} MAD</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ShoppingBag className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Orders</p>
                <p className="text-2xl font-bold">{customer.activeOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent>
              {customer.orders.length > 0 ? (
                <div className="space-y-4">
                  {customer.orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Order #{order.id}</p>
                        <p className="text-sm text-gray-600">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{Number(order.total).toFixed(2)} MAD</p>
                        <Badge variant={order.status === "completed" ? "default" : "secondary"}>{order.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No orders found for this customer.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Customer Subscriptions</CardTitle>
                <Button onClick={() => {
                  setIsCreateSubscriptionOpen(true)
                  fetchMealPlans()
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Subscription
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {subscriptionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : subscriptions.length === 0 ? (
                <p className="text-gray-600">No subscriptions found for this customer.</p>
              ) : (
                <div className="space-y-4">
                  {subscriptions.map((subscription) => (
                    <div
                      key={subscription.id}
                      className="border rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">
                              {subscription.meal_plan_title || subscription.plan_variant_label || "Unknown Plan"}
                            </h3>
                            <Badge
                              variant={
                                subscription.status === "active" ? "default" :
                                subscription.status === "paused" ? "secondary" :
                                subscription.status === "canceled" ? "destructive" :
                                "secondary"
                              }
                            >
                              {subscription.status === "active" ? "Active" :
                               subscription.status === "paused" ? "Paused" :
                               subscription.status === "canceled" ? "Canceled" :
                               subscription.status === "expired" ? "Expired" :
                               subscription.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Plan:</span> {subscription.plan_variant_label || "N/A"}
                            </div>
                            <div>
                              <span className="font-medium">Price:</span> {Number(subscription.weekly_base_price_mad || 0).toFixed(2)} MAD/week
                            </div>
                            <div>
                              <span className="font-medium">Started:</span> {subscription.starts_at ? new Date(subscription.starts_at).toLocaleDateString() : "N/A"}
                            </div>
                            <div>
                              <span className="font-medium">Renews:</span> {subscription.renews_at ? new Date(subscription.renews_at).toLocaleDateString() : "N/A"}
                            </div>
                            {subscription.days_per_week && (
                              <div>
                                <span className="font-medium">Days/Week:</span> {subscription.days_per_week}
                              </div>
                            )}
                            {subscription.meals_per_day && (
                              <div>
                                <span className="font-medium">Meals/Day:</span> {subscription.meals_per_day}
                              </div>
                            )}
                          </div>
                          {subscription.notes && (
                            <div className="mt-2 text-sm text-gray-500">
                              <span className="font-medium">Notes:</span> {subscription.notes}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {subscription.status === "active" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePauseSubscription(subscription.id)}
                              disabled={actionLoading === subscription.id}
                            >
                              {actionLoading === subscription.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Pause className="h-4 w-4 mr-1" />
                                  Pause
                                </>
                              )}
                            </Button>
                          )}
                          {subscription.status === "paused" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResumeSubscription(subscription.id)}
                              disabled={actionLoading === subscription.id}
                            >
                              {actionLoading === subscription.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Play className="h-4 w-4 mr-1" />
                                  Resume
                                </>
                              )}
                            </Button>
                          )}
                          {(subscription.status === "active" || subscription.status === "paused") && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleCancelSubscription(subscription.id)}
                              disabled={actionLoading === subscription.id}
                            >
                              {actionLoading === subscription.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <X className="h-4 w-4 mr-1" />
                                  Cancel
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Full Name</label>
                  <p className="text-lg">{customer.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-lg">{customer.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <p className="text-lg">{customer.phone || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Customer Since</label>
                  <p className="text-lg">{new Date(customer.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Last Login</label>
                  <p className="text-lg">
                    {customer.last_login_at 
                      ? new Date(customer.last_login_at).toLocaleString()
                      : "Never"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Account Status</label>
                  <div className="mt-1">
                    <Badge 
                      variant={
                        customer.status === "active" ? "default" :
                        customer.status === "inactive" ? "secondary" :
                        customer.status === "suspended" ? "destructive" : "default"
                      }
                    >
                      {customer.status === "active" ? "Active" :
                       customer.status === "inactive" ? "Inactive" :
                       customer.status === "suspended" ? "Suspended" : "Active"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Notes Card */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-notes">Internal Notes (Admin Only)</Label>
                <textarea
                  id="admin-notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this customer (internal use only)..."
                  className="w-full min-h-[120px] px-3 py-2 border rounded-md resize-y"
                  rows={5}
                />
                <p className="text-xs text-gray-500">
                  These notes are only visible to admins and will not be shown to the customer.
                </p>
              </div>
              <Button 
                onClick={handleSaveNotes} 
                disabled={notesUpdating}
                size="sm"
              >
                {notesUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Notes"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Meal Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Meal preferences will be displayed here when available.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Customer Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsEditModalOpen(false)
          setError(null)
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update customer information. Leave password empty to keep current password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+212 6XX XXX XXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">New Password</Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Leave empty to keep current password"
              />
              <p className="text-xs text-gray-500">Leave empty to keep the current password</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role *</Label>
              <select
                id="edit-role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="customer">Customer</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Customer"
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
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{customer?.name}"? This action cannot be undone.
              {customer && customer.totalOrders > 0 && (
                <span className="block mt-2 text-red-600 font-medium">
                  Warning: This customer has {customer.totalOrders} order(s).
                </span>
              )}
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

      {/* Create Subscription Dialog */}
      <Dialog open={isCreateSubscriptionOpen} onOpenChange={setIsCreateSubscriptionOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Subscription</DialogTitle>
            <DialogDescription>
              Create a subscription for {customer?.name || "this customer"}. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubscription} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Meal Plan Selection */}
            <div className="space-y-2">
              <Label htmlFor="meal_plan">Meal Plan *</Label>
              <Select
                value={subscriptionFormData.meal_plan_id}
                onValueChange={(value) => {
                  setSubscriptionFormData(prev => ({
                    ...prev,
                    meal_plan_id: value,
                    plan_variant_id: "",
                    meal_types: [],
                  }))
                }}
              >
                <SelectTrigger id="meal_plan">
                  <SelectValue placeholder="Select a meal plan" />
                </SelectTrigger>
                <SelectContent>
                  {mealPlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id.toString()}>
                      {plan.name || plan.title} - {Number(plan.price_per_week || 0).toFixed(2)} MAD/week
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Plan Variant Selection */}
            {subscriptionFormData.meal_plan_id && (
              <div className="space-y-2">
                <Label htmlFor="plan_variant">Plan Variant *</Label>
                <Select
                  value={subscriptionFormData.plan_variant_id}
                  onValueChange={(value) => {
                    setSubscriptionFormData(prev => ({ ...prev, plan_variant_id: value }))
                  }}
                >
                  <SelectTrigger id="plan_variant">
                    <SelectValue placeholder="Select a plan variant" />
                  </SelectTrigger>
                  <SelectContent>
                    {planVariants.map((variant) => (
                      <SelectItem key={variant.id} value={variant.id.toString()}>
                        {variant.label} - {variant.days_per_week} days/week, {variant.meals_per_day} meals/day - {Number(variant.weekly_base_price_mad || 0).toFixed(2)} MAD/week
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Meal Types */}
            {subscriptionFormData.plan_variant_id && (
              <div className="space-y-2">
                <Label>Meal Types * (Select at least 2)</Label>
                <div className="flex gap-4">
                  {["Breakfast", "Lunch", "Dinner"].map((mealType) => (
                    <div key={mealType} className="flex items-center space-x-2">
                      <Checkbox
                        id={`meal_${mealType}`}
                        checked={subscriptionFormData.meal_types.includes(mealType)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSubscriptionFormData(prev => ({
                              ...prev,
                              meal_types: [...prev.meal_types, mealType],
                            }))
                          } else {
                            setSubscriptionFormData(prev => ({
                              ...prev,
                              meal_types: prev.meal_types.filter(m => m !== mealType),
                            }))
                          }
                        }}
                      />
                      <Label htmlFor={`meal_${mealType}`} className="font-normal cursor-pointer">
                        {mealType}
                      </Label>
                    </div>
                  ))}
                </div>
                {subscriptionFormData.meal_types.length < 2 && (
                  <p className="text-sm text-red-500">Please select at least 2 meal types</p>
                )}
              </div>
            )}

            {/* Days Per Week & Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="days_per_week">Days Per Week *</Label>
                <Input
                  id="days_per_week"
                  type="number"
                  min="1"
                  max="7"
                  value={subscriptionFormData.days_per_week}
                  onChange={(e) => {
                    setSubscriptionFormData(prev => ({
                      ...prev,
                      days_per_week: Number.parseInt(e.target.value) || 1,
                    }))
                  }}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration_weeks">Duration (Weeks) *</Label>
                <Input
                  id="duration_weeks"
                  type="number"
                  min="1"
                  value={subscriptionFormData.duration_weeks}
                  onChange={(e) => {
                    setSubscriptionFormData(prev => ({
                      ...prev,
                      duration_weeks: Number.parseInt(e.target.value) || 1,
                    }))
                  }}
                  required
                />
              </div>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                value={subscriptionFormData.start_date}
                onChange={(e) => {
                  setSubscriptionFormData(prev => ({ ...prev, start_date: e.target.value }))
                }}
                required
              />
            </div>

            {/* Delivery Address */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold">Delivery Address</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="delivery_address">Address *</Label>
                  <Input
                    id="delivery_address"
                    value={subscriptionFormData.delivery_address}
                    onChange={(e) => {
                      setSubscriptionFormData(prev => ({ ...prev, delivery_address: e.target.value }))
                    }}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delivery_city">City *</Label>
                  <Input
                    id="delivery_city"
                    value={subscriptionFormData.delivery_city}
                    onChange={(e) => {
                      setSubscriptionFormData(prev => ({ ...prev, delivery_city: e.target.value }))
                    }}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery_postal_code">Postal Code</Label>
                <Input
                  id="delivery_postal_code"
                  value={subscriptionFormData.delivery_postal_code}
                  onChange={(e) => {
                    setSubscriptionFormData(prev => ({ ...prev, delivery_postal_code: e.target.value }))
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery_notes">Delivery Notes</Label>
                <Textarea
                  id="delivery_notes"
                  value={subscriptionFormData.delivery_notes}
                  onChange={(e) => {
                    setSubscriptionFormData(prev => ({ ...prev, delivery_notes: e.target.value }))
                  }}
                  rows={2}
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-2 border-t pt-4">
              <Label htmlFor="payment_method">Payment Method *</Label>
              <Select
                value={subscriptionFormData.payment_method}
                onValueChange={(value) => {
                  setSubscriptionFormData(prev => ({ ...prev, payment_method: value }))
                }}
              >
                <SelectTrigger id="payment_method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash_on_delivery">Cash on Delivery</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price Calculation */}
            {priceBreakdown && (
              <div className="border-t pt-4 space-y-2">
                <h3 className="font-semibold">Price Breakdown</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Base Weekly Price:</span>
                    <span>{priceBreakdown.grossWeekly?.toFixed(2) || "0.00"} MAD</span>
                  </div>
                  {priceBreakdown.discountsApplied && priceBreakdown.discountsApplied.length > 0 && (
                    <div>
                      <div className="font-medium mb-1">Discounts Applied:</div>
                      {priceBreakdown.discountsApplied.map((discount: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-green-600">
                          <span>{discount.type === "admin_override" ? "Admin Override" : discount.type}: {discount.percentage}%</span>
                          <span>-{discount.amount?.toFixed(2) || "0.00"} MAD</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Total ({priceBreakdown.durationWeeks} weeks):</span>
                    <span>{priceBreakdown.totalRoundedMAD?.toFixed(2) || "0.00"} MAD</span>
                  </div>
                </div>
              </div>
            )}

            {/* Admin Override */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold">Admin Override (Optional)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="admin_discount_percentage">Discount Percentage (%)</Label>
                  <Input
                    id="admin_discount_percentage"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={subscriptionFormData.admin_discount_percentage}
                    onChange={(e) => {
                      setSubscriptionFormData(prev => ({ ...prev, admin_discount_percentage: e.target.value }))
                    }}
                    placeholder="e.g., 10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin_override_price">Override Final Price (MAD)</Label>
                  <Input
                    id="admin_override_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={subscriptionFormData.admin_override_price}
                    onChange={(e) => {
                      setSubscriptionFormData(prev => ({ ...prev, admin_override_price: e.target.value }))
                    }}
                    placeholder="e.g., 500.00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin_discount_reason">Discount Reason</Label>
                <Input
                  id="admin_discount_reason"
                  value={subscriptionFormData.admin_discount_reason}
                  onChange={(e) => {
                    setSubscriptionFormData(prev => ({ ...prev, admin_discount_reason: e.target.value }))
                  }}
                  placeholder="Reason for discount/override"
                />
              </div>
            </div>

            {/* Admin Notes */}
            <div className="space-y-2 border-t pt-4">
              <Label htmlFor="admin_notes">Admin Notes</Label>
              <Textarea
                id="admin_notes"
                value={subscriptionFormData.admin_notes}
                onChange={(e) => {
                  setSubscriptionFormData(prev => ({ ...prev, admin_notes: e.target.value }))
                }}
                rows={3}
                placeholder="Internal notes about this subscription..."
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateSubscriptionOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || subscriptionFormData.meal_types.length < 2}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Subscription"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
