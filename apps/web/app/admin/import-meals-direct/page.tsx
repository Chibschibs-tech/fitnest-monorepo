"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Upload } from "lucide-react"

export default function ImportMealsDirectPage() {
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleImport = async () => {
    setImporting(true)
    setResult(null)
    setError(null)

    try {
      const response = await fetch("/api/import-meals-direct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (data.success) {
        setResult(data)
      } else {
        setError(data.error || "Import failed")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error")
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Import Meals Direct</h1>
          <p className="text-gray-600">Import meals directly from CSV with grams kept as grams</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Direct CSV Import
            </CardTitle>
            <CardDescription>
              Imports meals exactly as they are in the CSV with USDA nutrition calculations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleImport}
              disabled={importing}
              className="w-full bg-fitnest-green hover:bg-fitnest-green/90"
            >
              {importing ? "Importing..." : "Import Meals Now"}
            </Button>

            {result && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <p className="font-semibold">Import Successful!</p>
                  <p className="text-sm mt-1">{result.message}</p>
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <p className="font-semibold">Import Failed</p>
                  <p className="text-sm mt-1">{error}</p>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>What This Does</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Fetches CSV from Vercel Blob storage</li>
              <li>• Keeps all measurements in grams (no conversion)</li>
              <li>• Creates 3 meal variations per CSV row (muscle-gain, weight-loss, stay-fit)</li>
              <li>• Calculates nutrition using USDA API</li>
              <li>• Stores ingredients exactly as specified in CSV</li>
              <li>• Assigns appropriate meal images</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
