"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Users, Database } from "lucide-react"

export default function InitCustomerSystemPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const initializeSystem = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/init-customer-system", {
        method: "POST",
      })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        message: "Failed to initialize customer system",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Initialize Customer System</h1>
        <p className="text-muted-foreground">Set up the customer management system and migrate existing users</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Customer Database
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Creates a dedicated customers table with detailed customer information, order statistics, and customer
              lifecycle management.
            </p>
            <ul className="text-sm space-y-1">
              <li>• Customer profiles with contact details</li>
              <li>• Order history and spending tracking</li>
              <li>• Customer status management</li>
              <li>• Acquisition source tracking</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Migration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Automatically migrates existing users to the customer system while preserving all existing data and
              relationships.
            </p>
            <ul className="text-sm space-y-1">
              <li>• Preserves existing user accounts</li>
              <li>• Creates customer profiles</li>
              <li>• Links orders to customers</li>
              <li>• No data loss</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {result && (
        <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          {result.success ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={result.success ? "text-green-700" : "text-red-700"}>
            {result.message}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Initialize Customer System</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This will create the customer management system and migrate existing users. This operation is safe and won't
            affect existing data.
          </p>
          <Button onClick={initializeSystem} disabled={loading} className="w-full">
            {loading ? "Initializing..." : "Initialize Customer System"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
