"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Check, AlertTriangle, Database, Package } from "lucide-react"

export default function InitDeliverySchemaPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [schemaStatus, setSchemaStatus] = useState<any>(null)
  const [deliveryStats, setDeliveryStats] = useState<any>(null)

  const checkSchema = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/init-delivery-schema")
      const result = await response.json()

      if (response.ok) {
        setSchemaStatus(result)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("Failed to check schema status")
    } finally {
      setLoading(false)
    }
  }

  const initializeSchema = async () => {
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const response = await fetch("/api/init-delivery-schema", {
        method: "POST",
      })
      const result = await response.json()

      if (response.ok) {
        setMessage(result.message)
        await checkSchema() // Refresh schema status
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("Failed to initialize schema")
    } finally {
      setLoading(false)
    }
  }

  const generateDeliveries = async () => {
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const response = await fetch("/api/admin/generate-deliveries", {
        method: "POST",
      })
      const result = await response.json()

      if (response.ok) {
        setMessage(result.message)
        await getDeliveryStats() // Refresh stats
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("Failed to generate deliveries")
    } finally {
      setLoading(false)
    }
  }

  const getDeliveryStats = async () => {
    try {
      const response = await fetch("/api/admin/generate-deliveries")
      const result = await response.json()

      if (response.ok) {
        setDeliveryStats(result.stats)
      }
    } catch (err) {
      console.error("Failed to get delivery stats:", err)
    }
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Initialize Delivery Schema</h1>
        <p className="text-gray-600 mt-2">
          Set up the database schema for delivery tracking and pause/resume functionality.
        </p>
      </div>

      {message && (
        <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
          <Check className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5" />
              Database Schema
            </CardTitle>
            <CardDescription>Initialize the database tables and columns needed for delivery tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button onClick={checkSchema} disabled={loading}>
                  {loading ? "Checking..." : "Check Schema Status"}
                </Button>
                <Button onClick={initializeSchema} disabled={loading}>
                  {loading ? "Initializing..." : "Initialize Schema"}
                </Button>
              </div>

              {schemaStatus && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Schema Status</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Schema Exists:</span>{" "}
                      <span className={schemaStatus.schemaExists ? "text-green-600" : "text-red-600"}>
                        {schemaStatus.schemaExists ? "Yes" : "No"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Tables:</span> {schemaStatus.tables?.length || 0}
                    </div>
                    <div>
                      <span className="font-medium">Columns:</span> {schemaStatus.columns?.length || 0}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Generate Deliveries
            </CardTitle>
            <CardDescription>
              Create delivery schedules for existing orders that don't have deliveries yet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button onClick={getDeliveryStats} disabled={loading}>
                  {loading ? "Loading..." : "Get Statistics"}
                </Button>
                <Button onClick={generateDeliveries} disabled={loading}>
                  {loading ? "Generating..." : "Generate Test Deliveries"}
                </Button>
              </div>

              {deliveryStats && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Delivery Statistics</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Total Orders:</span> {deliveryStats.total_orders}
                    </div>
                    <div>
                      <span className="font-medium">Orders with Deliveries:</span>{" "}
                      {deliveryStats.orders_with_deliveries}
                    </div>
                    <div>
                      <span className="font-medium">Total Deliveries:</span> {deliveryStats.total_deliveries}
                    </div>
                    <div>
                      <span className="font-medium">Pending Deliveries:</span> {deliveryStats.pending_deliveries}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
