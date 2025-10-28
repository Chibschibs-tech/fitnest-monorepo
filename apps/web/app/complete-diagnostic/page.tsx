"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Database, Code } from "lucide-react"

export default function CompleteDiagnosticPage() {
  const [diagnosticData, setDiagnosticData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const runDiagnostic = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/complete-db-diagnostic")
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`)
      }

      const data = await response.json()
      setDiagnosticData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run diagnostic")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runDiagnostic()
  }, [])

  if (loading && !diagnosticData) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="mb-6 text-3xl font-bold">Complete Database Diagnostic</h1>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center">
            <RefreshCw className="mx-auto h-12 w-12 animate-spin text-green-600" />
            <p className="mt-4 text-lg text-gray-600">Running complete diagnostic...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Complete Database Diagnostic</h1>
        <Button onClick={runDiagnostic} disabled={loading}>
          {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          {loading ? "Running..." : "Run Diagnostic"}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {diagnosticData && (
        <>
          {/* Summary Card */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Database Summary</CardTitle>
                  <CardDescription>Cart ID: {diagnosticData.cartId || "Not set"}</CardDescription>
                </div>
                <Badge
                  variant={diagnosticData.issues.length === 0 ? "default" : "destructive"}
                  className="text-md px-3 py-1"
                >
                  {diagnosticData.issues.length === 0 ? "Healthy" : `${diagnosticData.issues.length} Issues`}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{diagnosticData.summary.totalTables}</div>
                  <div className="text-sm text-gray-600">Tables</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{diagnosticData.summary.cartStatus}</div>
                  <div className="text-sm text-gray-600">Cart Status</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{diagnosticData.summary.productsStatus}</div>
                  <div className="text-sm text-gray-600">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{diagnosticData.summary.ordersStatus}</div>
                  <div className="text-sm text-gray-600">Orders</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Issues and Recommendations */}
          {diagnosticData.issues.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <XCircle className="mr-2 h-5 w-5 text-red-500" />
                  Issues Found ({diagnosticData.issues.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="mb-2 font-medium">Issues:</h3>
                    <ul className="space-y-1">
                      {diagnosticData.issues.map((issue: string, index: number) => (
                        <li key={index} className="flex items-center text-red-600">
                          <XCircle className="mr-2 h-4 w-4" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="mb-2 font-medium">Recommendations:</h3>
                    <ul className="space-y-1">
                      {diagnosticData.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-center text-blue-600">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="tables">
            <TabsList className="mb-4">
              <TabsTrigger value="tables">
                <Database className="mr-2 h-4 w-4" />
                Tables
              </TabsTrigger>
              <TabsTrigger value="data">Data</TabsTrigger>
              <TabsTrigger value="queries">
                <Code className="mr-2 h-4 w-4" />
                Working Queries
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tables">
              <Card>
                <CardHeader>
                  <CardTitle>Table Structures</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(diagnosticData.tableStructures).map(([tableName, columns]: [string, any]) => (
                      <div key={tableName} className="border rounded-lg p-4">
                        <h3 className="mb-2 font-medium">{tableName}</h3>
                        <div className="grid gap-2 text-sm">
                          {columns.map((col: any, index: number) => (
                            <div key={index} className="flex justify-between">
                              <span className="font-mono">{col.column_name}</span>
                              <span className="text-gray-600">{col.data_type}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data">
              <Card>
                <CardHeader>
                  <CardTitle>Table Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="max-h-96 overflow-auto rounded-md bg-gray-100 p-4 text-sm">
                    {JSON.stringify(diagnosticData.tableData, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="queries">
              <Card>
                <CardHeader>
                  <CardTitle>Working Queries</CardTitle>
                  <CardDescription>Generated queries based on your actual database structure</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(diagnosticData.workingQueries).map(([queryName, query]: [string, any]) => (
                      <div key={queryName} className="border rounded-lg p-4">
                        <h3 className="mb-2 font-medium">{queryName}</h3>
                        <pre className="overflow-auto rounded-md bg-gray-100 p-3 text-sm">{query}</pre>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
