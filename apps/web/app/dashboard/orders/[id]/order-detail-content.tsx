"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { DashboardLayout } from "../../dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { LoadingSpinner } from "@/components/loading-spinner"
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Package,
  Truck,
  MapPin,
  Calendar,
  User,
  Phone,
} from "lucide-react"

interface OrderDetailContentProps {
  orderId: string
}

export function OrderDetailContent({ orderId }: OrderDetailContentProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [order, setOrder] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOrderDetails() {
      try {
        const response = await fetch(`/api/orders/${orderId}`)

        if (!response.ok) {
          throw new Error("Failed to load order details")
        }

        const data = await response.json()
        setOrder(data.order || null)
      } catch (error) {
        console.error("Error loading order details:", error)
        setError("Failed to load order details. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrderDetails()
  }, [orderId])

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Format time for display
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-MA", {
      style: "currency",
      currency: "MAD",
      minimumFractionDigits: 2,
    }).format(price)
  }

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
        return <Package className="h-5 w-5 text-gray-600" />
    }
  }

  // Get status text and color
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "delivered":
        return { text: "Delivered", color: "bg-green-100 text-green-800" }
      case "processing":
        return { text: "Processing", color: "bg-blue-100 text-blue-800" }
      case "pending":
        return { text: "Pending", color: "bg-yellow-100 text-yellow-800" }
      case "cancelled":
        return { text: "Cancelled", color: "bg-red-100 text-red-800" }
      default:
        return { text: status, color: "bg-gray-100 text-gray-800" }
    }
  }

  // Mock data for demonstration
  const mockOrder = {
    id: orderId,
    date: "2023-06-01T14:30:00",
    status: "delivered",
    type: "mixed",
    customer: {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+212 612345678",
    },
    shipping: {
      address: "123 Main St, Apt 4B",
      city: "Casablanca",
      postalCode: "20000",
      deliveryDate: "2023-06-03T09:00:00",
    },
    payment: {
      method: "Cash on Delivery",
      status: "Paid",
    },
    items: [
      {
        id: 1,
        type: "product",
        name: "Protein Bar Pack",
        quantity: 2,
        price: 59.99,
        imageUrl: "/protein-bar-pack.png",
      },
      {
        id: 2,
        type: "product",
        name: "Energy Drink",
        quantity: 3,
        price: 12.99,
        imageUrl: "/vibrant-energy-drink.png",
      },
      {
        id: 3,
        type: "meal_plan",
        name: "Weight Loss Plan (5 days)",
        details: "3 meals per day, 5 days per week",
        price: 349,
        imageUrl: "/vibrant-weight-loss-meal.png",
      },
    ],
    subtotal: 462.95,
    shipping: 0,
    total: 462.95,
  }

  // Use mock data for now, replace with actual data when available
  const orderData = order || mockOrder

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="mb-6">
          <Link href="/dashboard/orders" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <XCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-lg font-medium text-red-800">Error Loading Order</h3>
          <p className="text-red-700">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4 bg-red-600 hover:bg-red-700">
            Try Again
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const statusInfo = getStatusInfo(orderData.status)

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Link href="/dashboard/orders" className="inline-flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Link>
      </div>

      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Order #{orderData.id}</h1>
          <p className="text-gray-600">Placed on {formatDate(orderData.date)}</p>
        </div>
        <div className={`rounded-full px-4 py-1 text-sm font-medium ${statusInfo.color}`}>{statusInfo.text}</div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>Items included in this order</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orderData.items.map((item: any) => (
                  <div key={item.id} className="flex items-start space-x-4 rounded-lg border p-4">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      {item.type === "meal_plan" ? (
                        <p className="text-sm text-gray-600">{item.details}</p>
                      ) : (
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {item.type === "product" ? formatPrice(item.price * item.quantity) : formatPrice(item.price)}
                      </p>
                      {item.type === "product" && (
                        <p className="text-sm text-gray-500">{formatPrice(item.price)} each</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center text-gray-500">
                    <MapPin className="mr-2 h-4 w-4" />
                    <span>Delivery Address</span>
                  </div>
                  <p className="font-medium">{orderData.customer.name}</p>
                  <p>{orderData.shipping.address}</p>
                  <p>
                    {orderData.shipping.city}, {orderData.shipping.postalCode}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-500">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Delivery Date</span>
                  </div>
                  <p className="font-medium">{formatDate(orderData.shipping.deliveryDate)}</p>
                  <p>{formatTime(orderData.shipping.deliveryDate)}</p>
                  <div className="mt-2 flex items-center">
                    <Truck className="mr-2 h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">Free Shipping</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center text-gray-500">
                    <User className="mr-2 h-4 w-4" />
                    <span>Contact Information</span>
                  </div>
                  <p className="font-medium">{orderData.customer.name}</p>
                  <p>{orderData.customer.email}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-500">
                    <Phone className="mr-2 h-4 w-4" />
                    <span>Phone Number</span>
                  </div>
                  <p className="font-medium">{orderData.customer.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatPrice(orderData.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>{orderData.shipping === 0 ? "Free" : formatPrice(orderData.shipping)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>{formatPrice(orderData.total)}</span>
                  </div>
                </div>

                <div className="rounded-md bg-gray-50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Payment Method</span>
                    <span className="text-sm">{orderData.payment.method}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-sm font-medium">Payment Status</span>
                    <span className="text-sm">{orderData.payment.status}</span>
                  </div>
                </div>

                <div className="rounded-md bg-gray-50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Order Type</span>
                    <span className="text-sm capitalize">{orderData.type.replace("_", " ")}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-sm font-medium">Order Status</span>
                    <div className="flex items-center">
                      {getStatusIcon(orderData.status)}
                      <span className="ml-1 text-sm">{statusInfo.text}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Button className="w-full bg-green-600 hover:bg-green-700">Download Invoice</Button>
                <Button variant="outline" className="w-full">
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <p>If you have any questions or issues with your order, our customer support team is here to help.</p>
                <div className="rounded-md bg-gray-50 p-3">
                  <p className="font-medium">Contact Information:</p>
                  <p className="mt-1">Email: support@fitnest.ma</p>
                  <p>Phone: +212 522 123 456</p>
                  <p>Hours: 9AM - 6PM, Monday to Friday</p>
                </div>
                <Button variant="link" className="h-auto p-0 text-green-600">
                  View our Return Policy
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
