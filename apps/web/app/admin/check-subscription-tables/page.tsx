"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2, Database, Table, RefreshCw } from "lucide-react"

interface TableInfo {
  structure: Array<{
    column_name: string
    data_type: string
    is_nullable: string
    column_default: string | null
  }>
  count: number
  error?: string
}

interface CheckResult {
  success: boolean
  existingTables: string[]
  missingTables: string[]
  productsStructure: Array<{
    column_name: string
    data_type: string
    is_nullable: string
    column_default: string | null
  }>
  sampleProducts: Array<{
    id: number
    name: string
    price: string
    product_type: string
  }>
  subscriptionTablesInfo: Record<string, TableInfo>
  error?: string
}

export default function CheckSubscriptionTablesPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [result, setResult] = useState<CheckResult | null>(null)

  const checkTables = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/check-subscription-tables")
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        existingTables: [],
        missingTables: [],
        productsStructure: [],
        sampleProducts: [],
        subscriptionTablesInfo: {},
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkTables()
  }, [])

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Checking database tables...</span>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="container mx-auto py-8">
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription>Failed to check database tables</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Database Tables Status</h1>
          <Button onClick={checkTables} disabled={isLoading} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Tables Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5" />
              Tables Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-green-700 mb-3">Existing Tables ({result.existingTables.length})</h3>
                {result.existingTables.length > 0 ? (
                  <div className="space-y-2">
                    {result.existingTables.map((table) => (
                      <div key={table} className="flex items-center">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                        <Badge variant="outline" className="border-green-200 text-green-700">
                          {table}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No tables found</p>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-red-700 mb-3">Missing Tables ({result.missingTables.length})</h3>
                {result.missingTables.length > 0 ? (
                  <div className="space-y-2">
                    {result.missingTables.map((table) => (
                      <div key={table} className="flex items-center">
                        <XCircle className="mr-2 h-4 w-4 text-red-600" />
                        <Badge variant="outline" className="border-red-200 text-red-700">
                          {table}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    <span>All required tables exist!</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        {result.existingTables.includes("products") && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Table className="mr-2 h-5 w-5" />
                Products Table Structure
              </CardTitle>
              <CardDescription>Current structure and sample data from your products table</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Table Structure ({result.productsStructure.length} columns)</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {result.productsStructure.map((column) => (
                      <div
                        key={column.column_name}
                        className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded"
                      >
                        <span className="font-mono font-medium">{column.column_name}</span>
                        <div className="text-right">
                          <div className="text-gray-600">{column.data_type}</div>
                          <div className="text-xs text-gray-500">
                            {column.is_nullable === "YES" ? "nullable" : "required"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Sample Products ({result.sampleProducts.length})</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {result.sampleProducts.map((product) => (
                      <div key={product.id} className="text-sm border rounded p-3">
                        <div className="font-semibold truncate">{product.name}</div>
                        <div className="text-gray-600 text-xs mt-1">
                          <div>ID: {product.id}</div>
                          <div>Price: {product.price}</div>
                          <div>Type: {product.product_type || "N/A"}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subscription Tables */}
        {Object.keys(result.subscriptionTablesInfo).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Subscription Tables</CardTitle>
              <CardDescription>Structure and data counts for subscription-related tables</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(result.subscriptionTablesInfo).map(([tableName, info]) => (
                  <div key={tableName} className="border rounded p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold">{tableName}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{info.count} rows</Badge>
                        {info.error && <Badge variant="destructive">Error</Badge>}
                      </div>
                    </div>
                    {info.error ? (
                      <div className="text-sm text-red-600">Error: {info.error}</div>
                    ) : (
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                        {info.structure.map((column) => (
                          <div key={column.column_name} className="text-xs font-mono bg-gray-50 p-2 rounded">
                            <div className="font-semibold">{column.column_name}</div>
                            <div className="text-gray-600">{column.data_type}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {result.error && (
          <Alert className="border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription>Error: {result.error}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        {result.missingTables.length > 0 && (
          <div className="flex justify-center">
            <Button onClick={() => (window.location.href = "/admin/create-subscription-tables")}>
              Create Missing Tables
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
