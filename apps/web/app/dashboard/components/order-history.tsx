"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, XCircle, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function OrderHistory() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Sample data - in a real app, this would come from an API
  const orders = [
    {
      id: "#4532",
      date: "April 22, 2023",
      plan: "Weight Loss",
      amount: 349,
      status: "delivered",
    },
    {
      id: "#4498",
      date: "April 15, 2023",
      plan: "Weight Loss",
      amount: 349,
      status: "delivered",
    },
    {
      id: "#4465",
      date: "April 8, 2023",
      plan: "Weight Loss",
      amount: 349,
      status: "delivered",
    },
    {
      id: "#4432",
      date: "April 1, 2023",
      plan: "Weight Loss",
      amount: 349,
      status: "delivered",
    },
    {
      id: "#4399",
      date: "March 25, 2023",
      plan: "Balanced Nutrition",
      amount: 399,
      status: "delivered",
    },
    {
      id: "#4366",
      date: "March 18, 2023",
      plan: "Balanced Nutrition",
      amount: 399,
      status: "cancelled",
    },
  ]

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.plan.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between md:flex-row md:items-center">
        <h2 className="text-2xl font-bold tracking-tight">Order History</h2>
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search orders..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Orders</CardTitle>
          <CardDescription>View your past orders and their details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-5 border-b px-4 py-3 font-medium">
              <div>Order ID</div>
              <div>Date</div>
              <div>Plan</div>
              <div>Amount</div>
              <div>Status</div>
            </div>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <div key={order.id} className="grid grid-cols-5 items-center px-4 py-3 border-b last:border-0">
                  <div>{order.id}</div>
                  <div>{order.date}</div>
                  <div>{order.plan}</div>
                  <div>{order.amount} MAD</div>
                  <div>
                    {order.status === "delivered" ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Delivered
                      </Badge>
                    ) : order.status === "processing" ? (
                      <Badge className="bg-blue-100 text-blue-800">
                        <Clock className="mr-1 h-3 w-3" />
                        Processing
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800">
                        <XCircle className="mr-1 h-3 w-3" />
                        Cancelled
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">No orders found matching your criteria.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
