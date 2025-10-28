"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react"

export default function CreateSubscriptionTablesPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    tables?: string[]
    error?: string
  } | null>(null)

  const createTables = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/create-subscription-tables", {
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
        message: "Failed to create tables",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create Subscription Tables</CardTitle>
            <CardDescription>
              This will create the necessary database tables for the subscription system.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription>
                <div className="font-semibold text-orange-800">Important:</div>
                <div className="text-orange-700">
                  This will drop and recreate existing subscription tables to ensure correct structure. Any existing
                  subscription data will be lost.
                </div>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <h3 className="font-semibold">Tables to be created:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>
                  <strong>subscription_plans</strong> - Defines available subscription plans (Stay Fit, Weight Loss,
                  etc.)
                </li>
                <li>
                  <strong>subscription_plan_items</strong> - Links products (meals) to subscription plans
                </li>
                <li>
                  <strong>active_subscriptions</strong> - Tracks customer subscriptions and their status
                </li>
                <li>
                  <strong>deliveries</strong> - Manages delivery scheduling and tracking
                </li>
              </ul>
            </div>

            <Button onClick={createTables} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Tables...
                </>
              ) : (
                "Create Subscription Tables"
              )}
            </Button>

            {result && (
              <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                <div className="flex items-center">
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className="ml-2">
                    <div className="font-semibold">{result.message}</div>
                    {result.tables && (
                      <div className="mt-2">
                        <div className="text-sm">Successfully created tables:</div>
                        <ul className="list-disc list-inside text-sm">
                          {result.tables.map((table) => (
                            <li key={table}>{table}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.error && <div className="mt-2 text-sm text-red-600">Error: {result.error}</div>}
                  </AlertDescription>
                </div>
              </Alert>
            )}

            {result?.success && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900">Next Steps:</h4>
                <ol className="list-decimal list-inside text-sm text-blue-800 mt-2 space-y-1">
                  <li>Visit "Initialize Subscription Plans" to populate with your meal plan data</li>
                  <li>Go to "Subscription Plans" to manage and view your plans</li>
                  <li>Test the subscription system with your existing order flow</li>
                </ol>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
