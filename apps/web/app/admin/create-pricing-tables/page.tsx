"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2, Database } from "lucide-react"

export default function CreatePricingTablesPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const createTables = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/admin/create-pricing-tables", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || "Failed to create tables")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const checkTables = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/admin/create-pricing-tables")
      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || "Failed to check tables")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-6 w-6" />
              Initialize Pricing Tables
            </CardTitle>
            <CardDescription>Create and seed the pricing tables for the dynamic pricing engine</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">This will create the following tables if they don't exist:</p>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                <li>
                  <strong>meal_type_prices</strong> - Base prices for each meal type per plan (9 entries)
                </li>
                <li>
                  <strong>discount_rules</strong> - Discount rules for days per week and duration (7 entries)
                </li>
              </ul>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {result && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  {result.message || "Tables checked successfully"}
                  {result.mealPricesCount !== undefined && (
                    <div className="mt-2 space-y-1 text-sm">
                      <div>Meal prices: {result.mealPricesCount}</div>
                      <div>Discount rules: {result.discountRulesCount}</div>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-4">
              <Button onClick={createTables} disabled={loading} className="flex-1">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create & Seed Tables
              </Button>
              <Button onClick={checkTables} disabled={loading} variant="outline" className="flex-1 bg-transparent">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Check Status
              </Button>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 mb-2">Next steps:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                <li>Create and seed the tables using the button above</li>
                <li>Go to Pricing Management to view and edit prices</li>
                <li>Test the pricing API with the Price Simulator</li>
                <li>Run automated tests to verify calculations</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
