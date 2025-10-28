"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertTriangle, Database, Wrench } from "lucide-react"

export default function FixDatabasePage() {
  const [fixing, setFixing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const fixOrdersTable = async () => {
    try {
      setFixing(true)
      setError(null)
      setResult(null)

      const response = await fetch("/api/fix-orders-table", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fix database")
    } finally {
      setFixing(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Database Fix</h1>
        <p className="text-gray-600">Fix the missing 'total' column in orders table</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Orders Table Fix
          </CardTitle>
          <CardDescription>
            The diagnostic found that the orders table is missing the 'total' column required for order creation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg bg-yellow-50 p-4">
              <h3 className="font-medium text-yellow-800">What this will do:</h3>
              <ul className="mt-2 space-y-1 text-sm text-yellow-700">
                <li>• Add 'total' column to orders table (INTEGER type)</li>
                <li>• Update any existing orders with calculated totals</li>
                <li>• Ensure order creation API will work properly</li>
                <li>• Safe operation - no data will be lost</li>
              </ul>
            </div>

            <Button onClick={fixOrdersTable} disabled={fixing} className="w-full">
              {fixing ? (
                <>
                  <Wrench className="mr-2 h-4 w-4 animate-spin" />
                  Fixing Database...
                </>
              ) : (
                <>
                  <Wrench className="mr-2 h-4 w-4" />
                  Fix Orders Table
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Alert variant={result.success ? "default" : "destructive"} className="mb-6">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>{result.success ? "Success!" : "Error"}</AlertTitle>
          <AlertDescription>
            <div className="space-y-2">
              <p>{result.message}</p>
              {result.action === "added_column" && (
                <div className="mt-2 text-sm">
                  <p>
                    <strong>Before:</strong> {result.beforeColumns.join(", ")}
                  </p>
                  <p>
                    <strong>After:</strong> {result.afterColumns.join(", ")}
                  </p>
                  {result.updatedExistingOrders > 0 && (
                    <p>
                      <strong>Updated:</strong> {result.updatedExistingOrders} existing orders
                    </p>
                  )}
                </div>
              )}
              {result.action === "use_total_amount" && (
                <div className="mt-2 text-sm">
                  <p>
                    <strong>Note:</strong> {result.recommendation}
                  </p>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {result?.success && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-green-600">
              <CheckCircle className="mr-2 h-5 w-5" />
              Database Fixed!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>✅ Orders table now has the required 'total' column</p>
              <p>✅ Order creation API should work properly</p>
              <p>✅ You can now complete checkout successfully</p>

              <div className="mt-4 rounded-lg bg-green-50 p-4">
                <h3 className="font-medium text-green-800">Next Steps:</h3>
                <ol className="mt-2 space-y-1 text-sm text-green-700">
                  <li>1. Go back to Express Shop</li>
                  <li>2. Add items to cart</li>
                  <li>3. Try checkout - it should work now!</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
