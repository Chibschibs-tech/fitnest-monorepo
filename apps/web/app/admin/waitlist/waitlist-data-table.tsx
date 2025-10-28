"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Users, Download, Mail } from "lucide-react"

interface WaitlistEntry {
  id: number
  email: string
  name?: string
  created_at: string
  status: string
}

export function WaitlistDataTable() {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchWaitlist()
  }, [])

  const fetchWaitlist = async () => {
    try {
      const response = await fetch("/api/admin/waitlist")
      if (response.ok) {
        const data = await response.json()
        setWaitlist(data.waitlist || [])
      }
    } catch (error) {
      console.error("Error fetching waitlist:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch("/api/admin/waitlist/export")
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "waitlist-export.csv"
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        setMessage("Waitlist exported successfully")
        setTimeout(() => setMessage(null), 5000)
      }
    } catch (error) {
      console.error("Error exporting waitlist:", error)
      setMessage("Error exporting waitlist")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Loading waitlist...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32 animate-pulse rounded-md bg-muted" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href="/admin" className="flex items-center text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Admin Dashboard
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Waitlist Management</h1>
        <p className="text-gray-600">Manage customer waitlist and export data</p>
      </div>

      {message && (
        <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Waitlist Entries ({waitlist.length})</CardTitle>
              <CardDescription>Customers waiting for meal plan availability</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleExport} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {waitlist.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium">No waitlist entries</h3>
              <p className="mt-1 text-sm text-gray-500">Customer waitlist entries will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header */}
              <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg text-sm font-medium text-gray-600">
                <div>Email</div>
                <div>Name</div>
                <div>Joined Date</div>
                <div>Status</div>
              </div>

              {/* Waitlist entries */}
              {waitlist.map((entry) => (
                <div key={entry.id} className="grid grid-cols-4 gap-4 p-4 border rounded-lg text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{entry.email}</span>
                  </div>
                  <div>{entry.name || "N/A"}</div>
                  <div>{formatDate(entry.created_at)}</div>
                  <div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      {entry.status || "Waiting"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
