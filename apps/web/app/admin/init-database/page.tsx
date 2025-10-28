"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Database, Loader2 } from "lucide-react"

export default function InitDatabasePage() {
  const [isInitializing, setIsInitializing] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; error?: string } | null>(null)

  const initializeDatabase = async () => {
    setIsInitializing(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/init-database", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        message: "Failed to initialize database",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsInitializing(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Database Initialization</h1>
        <p className="text-gray-600">Initialize the complete database schema for the generic e-commerce system</p>
      </div>

      <div className="grid gap-6">
        {/* Database Schema Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Schema Overview
            </CardTitle>
            <CardDescription>This will create a comprehensive, generic e-commerce database structure</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Core Tables</h3>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Products (universal catalog)</li>
                  <li>• Product Categories</li>
                  <li>• Product Variants</li>
                  <li>• Customers</li>
                  <li>• Customer Addresses</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Business Logic</h3>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Subscription Plans</li>
                  <li>• Active Subscriptions</li>
                  <li>• Orders & Order Items</li>
                  <li>• Deliveries</li>
                  <li>• Discount Codes</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Features */}
        <Card>
          <CardHeader>
            <CardTitle>Key Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium mb-2">🎯 Generic Design</h4>
                <p className="text-sm text-gray-600">
                  Adaptable to any subscription business - meal delivery, software, services, etc.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">🔄 Flexible Products</h4>
                <p className="text-sm text-gray-600">Handles simple products, variants, subscriptions, and bundles</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">📊 Complete Analytics</h4>
                <p className="text-sm text-gray-600">Customer lifetime value, order history, and business metrics</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Initialize Button */}
        <Card>
          <CardHeader>
            <CardTitle>Initialize Database</CardTitle>
            <CardDescription>This will create all tables, indexes, and insert sample data</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={initializeDatabase} disabled={isInitializing} className="w-full" size="lg">
              {isInitializing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Initializing Database...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Initialize Database Schema
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Result */}
        {result && (
          <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            {result.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={result.success ? "text-green-800" : "text-red-800"}>
              <div className="font-medium mb-1">{result.success ? "Success!" : "Error"}</div>
              <div>{result.message}</div>
              {result.error && <div className="mt-2 text-xs font-mono bg-white/50 p-2 rounded">{result.error}</div>}
            </AlertDescription>
          </Alert>
        )}

        {/* Next Steps */}
        {result?.success && (
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">✅ Database schema created successfully</p>
                <p className="text-sm">✅ Sample data inserted</p>
                <p className="text-sm">✅ Indexes created for performance</p>
                <div className="mt-4">
                  <p className="font-medium mb-2">You can now:</p>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Visit the admin dashboard to manage products</li>
                    <li>• Test the subscription system</li>
                    <li>• View customer data and orders</li>
                    <li>• Customize the schema for your specific needs</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
