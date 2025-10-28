"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestWaitlistEmail() {
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runTest = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-waitlist-email")
      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      setTestResult({ success: false, error: "Failed to run test" })
    } finally {
      setLoading(false)
    }
  }

  const testWaitlistForm = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/waitlist-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: "Test",
          lastName: "User",
          email: "test@example.com",
          phone: "123456789",
          mealPlan: "Weight Loss",
          city: "Casablanca",
          notifications: true,
        }),
      })
      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      setTestResult({ success: false, error: "Failed to test waitlist form" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Email Configuration Test</CardTitle>
          <CardDescription>Test the email functionality for the waitlist form</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={runTest} disabled={loading}>
              {loading ? "Testing..." : "Test Email Config"}
            </Button>
            <Button onClick={testWaitlistForm} disabled={loading} variant="outline">
              {loading ? "Testing..." : "Test Waitlist Form"}
            </Button>
          </div>

          {testResult && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Test Result:</h3>
              <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
