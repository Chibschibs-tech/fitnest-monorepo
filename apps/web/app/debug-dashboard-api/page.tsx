"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DebugDashboardPage() {
  const [debugData, setDebugData] = useState(null)
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchDebugData = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/debug-dashboard")
      const data = await response.json()
      setDebugData(data)
    } catch (error) {
      console.error("Error fetching debug data:", error)
    }
    setLoading(false)
  }

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/user/dashboard")
      const data = await response.json()
      setDashboardData(data)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    }
    setLoading(false)
  }

  const createTestData = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/create-test-data", { method: "POST" })
      const result = await response.json()
      alert(result.message || "Test data created!")
      // Refresh data
      fetchDebugData()
      fetchDashboardData()
    } catch (error) {
      console.error("Error creating test data:", error)
      alert("Error creating test data")
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchDebugData()
    fetchDashboardData()
  }, [])

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard Debug</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
            <CardDescription>System and database information</CardDescription>
            <Button onClick={fetchDebugData} disabled={loading}>
              Refresh Debug Data
            </Button>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(debugData, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dashboard API Response</CardTitle>
            <CardDescription>What the dashboard API returns</CardDescription>
            <div className="flex gap-2">
              <Button onClick={fetchDashboardData} disabled={loading}>
                Refresh Dashboard Data
              </Button>
              <Button onClick={createTestData} disabled={loading} variant="outline">
                Create Test Data
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(dashboardData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>

      {debugData?.userData && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>User Data Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Current User ID: {debugData.userData.userId}</h3>
                <p>Orders for this user: {debugData.userData.userOrders?.length || 0}</p>
              </div>

              <div>
                <h3 className="font-semibold">Orders by User ID:</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {debugData.userData.allOrdersByUser?.map((item, index) => (
                    <div key={index} className="bg-gray-100 p-2 rounded">
                      User {item.user_id}: {item.count} orders
                    </div>
                  ))}
                </div>
              </div>

              {debugData.userData.userOrders?.length > 0 && (
                <div>
                  <h3 className="font-semibold">User's Orders:</h3>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                    {JSON.stringify(debugData.userData.userOrders, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
