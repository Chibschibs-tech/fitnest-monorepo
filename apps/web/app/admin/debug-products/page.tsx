"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Loader2, Database, Package } from "lucide-react"

interface Product {
  id: number
  name: string
  description?: string
  price: number
  category?: string
  tags?: string
  stock?: number
  isactive?: boolean
}

interface TableColumn {
  column_name: string
  data_type: string
  is_nullable: string
  column_default?: string
}

interface DebugData {
  totalProducts: number
  products: Product[]
  tableStructure: TableColumn[]
  testProductResult: any
}

export default function DebugProductsPage() {
  const [data, setData] = useState<DebugData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/debug-products")
      const result = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Products Debug Information
            </CardTitle>
            <CardDescription>Debug information about your products table and data</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={loadData} disabled={isLoading} className="mb-4">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Refresh Data"
              )}
            </Button>

            {error && (
              <Alert className="border-red-200 bg-red-50 mb-4">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {data && (
              <div className="space-y-6">
                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-blue-600" />
                        <div>
                          <div className="text-2xl font-bold">{data.totalProducts}</div>
                          <div className="text-sm text-gray-600">Total Products</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-green-600" />
                        <div>
                          <div className="text-2xl font-bold">{data.tableStructure.length}</div>
                          <div className="text-sm text-gray-600">Table Columns</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-purple-600" />
                        <div>
                          <div className="text-2xl font-bold">{data.testProductResult?.id ? "✓" : "✗"}</div>
                          <div className="text-sm text-gray-600">Test Insert</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Table Structure */}
                <Card>
                  <CardHeader>
                    <CardTitle>Table Structure</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-300 px-4 py-2 text-left">Column</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Nullable</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Default</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.tableStructure.map((col) => (
                            <tr key={col.column_name}>
                              <td className="border border-gray-300 px-4 py-2 font-mono text-sm">{col.column_name}</td>
                              <td className="border border-gray-300 px-4 py-2 text-sm">{col.data_type}</td>
                              <td className="border border-gray-300 px-4 py-2 text-sm">{col.is_nullable}</td>
                              <td className="border border-gray-300 px-4 py-2 text-sm font-mono">
                                {col.column_default || "NULL"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Test Product Result */}
                <Card>
                  <CardHeader>
                    <CardTitle>Test Product Creation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
                      {JSON.stringify(data.testProductResult, null, 2)}
                    </pre>
                  </CardContent>
                </Card>

                {/* Products List */}
                <Card>
                  <CardHeader>
                    <CardTitle>Existing Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {data.products.length === 0 ? (
                      <Alert>
                        <AlertDescription>No products found in the database.</AlertDescription>
                      </Alert>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">Price</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">Category</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">Active</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.products.map((product) => (
                              <tr key={product.id}>
                                <td className="border border-gray-300 px-4 py-2">{product.id}</td>
                                <td className="border border-gray-300 px-4 py-2">{product.name}</td>
                                <td className="border border-gray-300 px-4 py-2">{product.price}</td>
                                <td className="border border-gray-300 px-4 py-2">{product.category || "N/A"}</td>
                                <td className="border border-gray-300 px-4 py-2">{product.isactive ? "✓" : "✗"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
