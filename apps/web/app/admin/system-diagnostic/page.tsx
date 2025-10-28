"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Database, ShoppingCart, User } from "lucide-react"

export default function SystemDiagnosticPage() {
  const [diagnosticData, setDiagnosticData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  const runDiagnostic = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/system-diagnostic")
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

  const handleRunDiagnostic = () => {
    runDiagnostic()
  }

  const handleFixIssue = async (issue: string) => {
    try {
      setLoading(true)

      let endpoint = ""
      if (issue === "products") {
        endpoint = "/api/seed-products"
      } else if (issue === "cart") {
        endpoint = "/api/ensure-cart-table"
      }

      if (endpoint) {
        const response = await fetch(endpoint)
        if (!response.ok) {
          throw new Error(`Fix API returned status ${response.status}`)
        }
      }

      // Re-run diagnostic
      await runDiagnostic()
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to fix ${issue}`)
      setLoading(false)
    }
  }

  if (loading && !diagnosticData) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="mb-6 text-3xl font-bold">System Diagnostic</h1>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center">
            <RefreshCw className="mx-auto h-12 w-12 animate-spin text-green-600" />
            <p className="mt-4 text-lg text-gray-600">Running system diagnostic...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">System Diagnostic</h1>
        <Button onClick={handleRunDiagnostic} disabled={loading}>
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
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>System Status</CardTitle>
                  <CardDescription>Last checked: {new Date(diagnosticData.timestamp).toLocaleString()}</CardDescription>
                </div>
                <Badge
                  variant={diagnosticData.systemStatus.healthy ? "default" : "destructive"}
                  className="text-md px-3 py-1"
                >
                  {diagnosticData.systemStatus.healthy ? "Healthy" : "Issues Detected"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {diagnosticData.systemStatus.issues.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Issues Detected:</h3>
                  <ul className="space-y-2">
                    {diagnosticData.systemStatus.issues.map((issue: string, index: number) => (
                      <li key={index} className="flex items-center text-red-600">
                        <XCircle className="mr-2 h-5 w-5" />
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  All systems operational
                </div>
              )}
            </CardContent>
            {diagnosticData.systemStatus.issues.length > 0 && (
              <CardFooter>
                <div className="flex flex-wrap gap-2">
                  {!diagnosticData.diagnostics.products.hasData && (
                    <Button onClick={() => handleFixIssue("products")} disabled={loading}>
                      Seed Products
                    </Button>
                  )}
                  {!diagnosticData.diagnostics.cart.exists && (
                    <Button onClick={() => handleFixIssue("cart")} disabled={loading}>
                      Create Cart Table
                    </Button>
                  )}
                </div>
              </CardFooter>
            )}
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="database">
                <Database className="mr-2 h-4 w-4" />
                Database
              </TabsTrigger>
              <TabsTrigger value="products">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Products
              </TabsTrigger>
              <TabsTrigger value="cart">Cart</TabsTrigger>
              <TabsTrigger value="auth">
                <User className="mr-2 h-4 w-4" />
                Authentication
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>System Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Database Connection:</span>
                        {diagnosticData.diagnostics.database.success ? (
                          <Badge variant="outline" className="bg-green-50 text-green-600">
                            Connected
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-600">
                            Failed
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-medium">Products Table:</span>
                        {diagnosticData.diagnostics.products.success ? (
                          diagnosticData.diagnostics.products.hasData ? (
                            <Badge variant="outline" className="bg-green-50 text-green-600">
                              {diagnosticData.diagnostics.products.count} Products
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-600">
                              Empty
                            </Badge>
                          )
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-600">
                            Missing
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-medium">Cart Table:</span>
                        {diagnosticData.diagnostics.cart.exists ? (
                          <Badge variant="outline" className="bg-green-50 text-green-600">
                            Ready
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-600">
                            Missing
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-medium">Authentication:</span>
                        {diagnosticData.diagnostics.authentication.isAuthenticated ? (
                          <Badge variant="outline" className="bg-green-50 text-green-600">
                            Authenticated
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-600">
                            Not Authenticated
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium">Recommendations:</h3>
                      <ul className="space-y-2">
                        {!diagnosticData.diagnostics.products.success && (
                          <li className="flex items-center text-amber-600">
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Create products table by running the seed-products API
                          </li>
                        )}
                        {diagnosticData.diagnostics.products.success &&
                          !diagnosticData.diagnostics.products.hasData && (
                            <li className="flex items-center text-amber-600">
                              <AlertTriangle className="mr-2 h-4 w-4" />
                              Populate products table by running the seed-products API
                            </li>
                          )}
                        {!diagnosticData.diagnostics.cart.exists && (
                          <li className="flex items-center text-amber-600">
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Create cart table by running the ensure-cart-table API
                          </li>
                        )}
                        {!diagnosticData.diagnostics.authentication.isAuthenticated && (
                          <li className="flex items-center text-amber-600">
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Log in to test authenticated features
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="database">
              <Card>
                <CardHeader>
                  <CardTitle>Database Diagnostic</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="mb-2 font-medium">Connection Status:</h3>
                      {diagnosticData.diagnostics.database.success ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="mr-2 h-5 w-5" />
                          Database connection successful
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600">
                          <XCircle className="mr-2 h-5 w-5" />
                          Database connection failed: {diagnosticData.diagnostics.database.error}
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div>
                      <h3 className="mb-2 font-medium">Connection Details:</h3>
                      <pre className="max-h-60 overflow-auto rounded-md bg-gray-100 p-4 text-sm">
                        {JSON.stringify(diagnosticData.diagnostics.database, null, 2)}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products">
              <Card>
                <CardHeader>
                  <CardTitle>Products Diagnostic</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="mb-2 font-medium">Products Table Status:</h3>
                      {diagnosticData.diagnostics.products.success ? (
                        diagnosticData.diagnostics.products.hasData ? (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="mr-2 h-5 w-5" />
                            Products table exists with {diagnosticData.diagnostics.products.count} products
                          </div>
                        ) : (
                          <div className="flex items-center text-yellow-600">
                            <AlertTriangle className="mr-2 h-5 w-5" />
                            Products table exists but is empty
                          </div>
                        )
                      ) : (
                        <div className="flex items-center text-red-600">
                          <XCircle className="mr-2 h-5 w-5" />
                          Products table does not exist
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div>
                      <h3 className="mb-2 font-medium">Recommendation:</h3>
                      {diagnosticData.diagnostics.products.recommendation && (
                        <p>{diagnosticData.diagnostics.products.recommendation}</p>
                      )}
                      {!diagnosticData.diagnostics.products.success || !diagnosticData.diagnostics.products.hasData ? (
                        <Button onClick={() => handleFixIssue("products")} className="mt-2" disabled={loading}>
                          {loading ? "Seeding..." : "Seed Products"}
                        </Button>
                      ) : (
                        <p className="text-green-600">No action needed</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cart">
              <Card>
                <CardHeader>
                  <CardTitle>Cart Diagnostic</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="mb-2 font-medium">Cart Table Status:</h3>
                      {diagnosticData.diagnostics.cart.exists ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="mr-2 h-5 w-5" />
                          Cart table exists
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600">
                          <XCircle className="mr-2 h-5 w-5" />
                          Cart table does not exist
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div>
                      <h3 className="mb-2 font-medium">Recommendation:</h3>
                      {diagnosticData.diagnostics.cart.recommendation && (
                        <p>{diagnosticData.diagnostics.cart.recommendation}</p>
                      )}
                      {!diagnosticData.diagnostics.cart.exists ? (
                        <Button onClick={() => handleFixIssue("cart")} className="mt-2" disabled={loading}>
                          {loading ? "Creating..." : "Create Cart Table"}
                        </Button>
                      ) : (
                        <p className="text-green-600">No action needed</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="auth">
              <Card>
                <CardHeader>
                  <CardTitle>Authentication Diagnostic</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="mb-2 font-medium">Authentication Status:</h3>
                      {diagnosticData.diagnostics.authentication.isAuthenticated ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="mr-2 h-5 w-5" />
                          Authenticated as {diagnosticData.diagnostics.authentication.user?.name || "User"}
                        </div>
                      ) : (
                        <div className="flex items-center text-yellow-600">
                          <AlertTriangle className="mr-2 h-5 w-5" />
                          Not authenticated
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div>
                      <h3 className="mb-2 font-medium">User Details:</h3>
                      {diagnosticData.diagnostics.authentication.isAuthenticated ? (
                        <pre className="max-h-60 overflow-auto rounded-md bg-gray-100 p-4 text-sm">
                          {JSON.stringify(diagnosticData.diagnostics.authentication.user, null, 2)}
                        </pre>
                      ) : (
                        <p>No user is currently authenticated</p>
                      )}
                    </div>

                    <div>
                      <h3 className="mb-2 font-medium">Recommendation:</h3>
                      {!diagnosticData.diagnostics.authentication.isAuthenticated ? (
                        <div>
                          <p>Log in to test authenticated features</p>
                          <Button asChild className="mt-2">
                            <a href="/login">Go to Login</a>
                          </Button>
                        </div>
                      ) : (
                        <p className="text-green-600">No action needed</p>
                      )}
                    </div>
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
