"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CartFixPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadDebugInfo()
  }, [])

  const loadDebugInfo = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/cart-fix")
      const data = await response.json()
      setDebugInfo(data)
      console.log("Cart debug info:", data)
    } catch (error) {
      console.error("Error loading debug info:", error)
    } finally {
      setLoading(false)
    }
  }

  const syncCartId = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/cart-fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync_cart_id" }),
      })

      const data = await response.json()
      console.log("Sync result:", data)

      if (data.success) {
        // Update the cookie with the correct cart ID
        document.cookie = `cartId=${data.cartId}; path=/; max-age=${60 * 60 * 24 * 30}`

        // Reload debug info
        await loadDebugInfo()

        alert(`Cart ID synchronized to: ${data.cartId}`)
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error("Error syncing cart:", error)
      alert("Failed to sync cart ID")
    } finally {
      setLoading(false)
    }
  }

  if (loading && !debugInfo) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="mb-8 text-3xl font-bold">Cart Fix</h1>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Cart Fix Tool</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Cart Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          {debugInfo && (
            <div className="space-y-4">
              <div>
                <strong>Current Cart ID:</strong> {debugInfo.cartId || "None"}
              </div>
              <div>
                <strong>Cart Exists:</strong> {debugInfo.cartExists ? "Yes" : "No"}
              </div>
              <div>
                <strong>Total Cart Entries:</strong> {debugInfo.allCartData?.length || 0}
              </div>
              {debugInfo.recentCart && (
                <div>
                  <strong>Most Recent Cart:</strong>
                  <pre className="bg-gray-100 p-2 rounded text-sm mt-2">
                    {JSON.stringify(debugInfo.recentCart, null, 2)}
                  </pre>
                </div>
              )}
              <div className="bg-blue-50 p-4 rounded">
                <strong>Suggestion:</strong> {debugInfo.suggestion}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-x-4">
        <Button onClick={loadDebugInfo} disabled={loading}>
          Refresh Debug Info
        </Button>

        {debugInfo && !debugInfo.cartExists && debugInfo.recentCart && (
          <Button onClick={syncCartId} disabled={loading} variant="default">
            Fix Cart ID
          </Button>
        )}

        <Button onClick={() => (window.location.href = "/express-shop")} variant="outline">
          Go to Express Shop
        </Button>

        <Button onClick={() => (window.location.href = "/checkout")} variant="outline">
          Test Checkout
        </Button>
      </div>
    </div>
  )
}
