"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Search, Eye, Mail, Calendar, Plus, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Customer {
  id: number
  name: string
  email: string
  phone?: string
  role: string
  status?: string
  last_login_at?: string
  created_at: string
  orderCount: number
}

export default function CustomersContent() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newCustomerFormData, setNewCustomerFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "customer",
  })

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await fetch("/api/admin/customers")
      const data = await response.json()

      if (response.ok && data.success) {
        setCustomers(data.customers || [])
        setError("")
      } else {
        // Handle error response - extract message from error object
        const errorMessage = data.error?.message || 
                           (typeof data.error === 'string' ? data.error : null) ||
                           data.message || 
                           "Failed to fetch customers"
        setError(errorMessage)
      }
    } catch (err) {
      console.error("Error:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch customers"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreate = () => {
    setNewCustomerFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "customer",
    })
    setError("")
    setIsCreateModalOpen(true)
  }

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const payload = {
        name: newCustomerFormData.name,
        email: newCustomerFormData.email,
        phone: newCustomerFormData.phone || undefined,
        role: newCustomerFormData.role,
        ...(newCustomerFormData.password && { password: newCustomerFormData.password }),
      }

      const response = await fetch("/api/admin/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setIsCreateModalOpen(false)
        setNewCustomerFormData({ name: "", email: "", phone: "", password: "", role: "customer" })
        fetchCustomers() // Refresh list
        
        // If password was generated, show it to admin
        if (data.generatedPassword) {
          alert(`Customer created successfully!\n\nTemporary password: ${data.generatedPassword}\n\nPlease save this password and share it with the customer.`)
        } else {
          alert("Customer created successfully!")
        }
      } else {
        setError(data.error || "Failed to create customer")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create customer")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading customers...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600">Manage customer accounts and information</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
          <Button onClick={fetchCustomers} variant="outline">
            Refresh Data
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{customers.filter((c) => c.orderCount > 0).length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {
                customers.filter((c) => {
                  const created = new Date(c.created_at)
                  const now = new Date()
                  return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
                }).length
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search customers by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers List */}
      <Card>
        <CardHeader>
          <CardTitle>Customer List ({filteredCustomers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? "No customers found matching your search." : "No customers found."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-semibold">{customer.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Mail className="h-3 w-3" />
                        <span>{customer.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>Joined {new Date(customer.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Badge variant={customer.orderCount > 0 ? "default" : "secondary"}>
                      {customer.orderCount} orders
                    </Badge>
                    <Link href={`/admin/customers/${customer.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Customer Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateModalOpen(false)
          setError("")
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>
              Create a new customer account. Leave password empty to generate a temporary password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitCreate} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="newName">Full Name *</Label>
              <Input
                id="newName"
                value={newCustomerFormData.name}
                onChange={(e) => setNewCustomerFormData({ ...newCustomerFormData, name: e.target.value })}
                required
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newEmail">Email *</Label>
              <Input
                id="newEmail"
                type="email"
                value={newCustomerFormData.email}
                onChange={(e) => setNewCustomerFormData({ ...newCustomerFormData, email: e.target.value })}
                required
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPhone">Phone (optional)</Label>
              <Input
                id="newPhone"
                type="tel"
                value={newCustomerFormData.phone}
                onChange={(e) => setNewCustomerFormData({ ...newCustomerFormData, phone: e.target.value })}
                placeholder="+212 6XX XXX XXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Password (optional)</Label>
              <Input
                id="newPassword"
                type="password"
                value={newCustomerFormData.password}
                onChange={(e) => setNewCustomerFormData({ ...newCustomerFormData, password: e.target.value })}
                placeholder="Leave empty to generate temporary password"
              />
              <p className="text-xs text-gray-500">If left empty, a temporary password will be generated</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newRole">Role *</Label>
              <select
                id="newRole"
                value={newCustomerFormData.role}
                onChange={(e) => setNewCustomerFormData({ ...newCustomerFormData, role: e.target.value })}
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
                onClick={() => setIsCreateModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Customer"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
