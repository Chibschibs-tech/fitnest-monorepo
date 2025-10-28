"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function EmailTestSimple() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleTest = async () => {
    if (!email || !name) {
      alert("Please enter both email and name")
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/test-email-simple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: "Network error", details: error })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Test Email System</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
          <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
          <Button onClick={handleTest} disabled={loading} className="w-full">
            {loading ? "Sending..." : "Send Test Email"}
          </Button>

          {result && (
            <div className={`p-4 rounded ${result.success ? "bg-green-100" : "bg-red-100"}`}>
              <pre className="text-sm overflow-auto">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
