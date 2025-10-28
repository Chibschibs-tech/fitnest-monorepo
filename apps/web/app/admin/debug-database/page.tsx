"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Database, Trash2, RefreshCw } from "lucide-react"
import Link from "next/link"

interface TableInfo {
  structure: Array<{
    column_name: string
    data_type: string
    is_nullable: string
    column_default: string | null
  }>
  rowCount: number
  sampleData: Array<Record<string, any>>
  error?: string
}

interface DiagnosticData {
  timestamp: string
  tables: Record<string, TableInfo>
}

export default function DatabaseDiagnosticPage() {
  const [diagnostic, setDiagnostic] = useState<DiagnosticData | null>(null)
  const [loading, setLoading] = useState(false)
  const [cleaningData, setCleaningData] = useState(false)
  const [message, setMessage] = useState("")

  const runDiagnostic = async () => {
    try {
      setLoading(true)
      setMessage("")
      const response = await fetch("/api/admin/debug-database")
      const data = await response.json()

      if (data.success) {
        setDiagnostic(data.diagnostic)
        setMessage("Database diagnostic completed successfully")
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const cleanSampleData = async () => {
    try {
      setCleaningData(true)
      setMessage("")
      const response = await fetch("/api/admin/clean-sample-data", {
        method: "POST",
      })
      const data = await response.json()

      if (data.success) {
        setMessage(
          `Sample data cleaned successfully! Deleted: ${data.deletedRecords.users} users, ${data.deletedRecords.orders} orders, ${data.deletedRecords.waitlist} waitlist entries`,
        )
        // Re-run diagnostic to show updated data
        setTimeout(() => runDiagnostic(), 1000)
      } else {
        setMessage(`Error cleaning data: ${data.error}`)
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setCleaningData(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Database Diagnostic</h1>
            <p className="text-gray-600">Debug and analyze database structure and content</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={cleanSampleData} disabled={cleaningData} variant="destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            {cleaningData ? "Cleaning..." : "Clean Sample Data"}
          </Button>
          <Button onClick={runDiagnostic} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Running..." : "Run Diagnostic"}
          </Button>
        </div>
      </div>

      {message && (
        <Alert variant={message.includes("Error") ? "destructive" : "default"}>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {diagnostic && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Database Tables ({Object.keys(diagnostic.tables).length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Object.keys(diagnostic.tables).map((tableName) => (
                  <Badge key={tableName} variant="outline">
                    {tableName}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {Object.entries(diagnostic.tables).map(([tableName, tableInfo]) => (
            <Card key={tableName}>
              <CardHeader>
                <CardTitle>
                  {tableName.charAt(0).toUpperCase() + tableName.slice(1)} Table ({tableInfo.rowCount} records)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tableInfo.error ? (
                  <Alert variant="destructive">
                    <AlertDescription>Error: {tableInfo.error}</AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Structure:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        {tableInfo.structure.map((column) => (
                          <div key={column.column_name} className="p-2 bg-gray-50 rounded">
                            <div className="font-medium">{column.column_name}</div>
                            <div className="text-gray-600">({column.data_type})</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {tableInfo.sampleData.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Sample Data:</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm border border-gray-200">
                            <thead>
                              <tr className="bg-gray-50">
                                {Object.keys(tableInfo.sampleData[0]).map((key) => (
                                  <th key={key} className="px-2 py-1 text-left border-b font-medium">
                                    {key}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {tableInfo.sampleData.map((row, index) => (
                                <tr key={index} className="border-b">
                                  {Object.values(row).map((value, cellIndex) => (
                                    <td key={cellIndex} className="px-2 py-1 border-r">
                                      {value === null
                                        ? "NULL"
                                        : typeof value === "string" && value.length > 50
                                          ? `${value.substring(0, 50)}...`
                                          : String(value)}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-gray-500">
                Diagnostic completed at: {new Date(diagnostic.timestamp).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
