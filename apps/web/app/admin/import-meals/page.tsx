"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, AlertCircle, Upload, Database } from "lucide-react"

export default function ImportMealsPage() {
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleImport = async () => {
    setImporting(true)
    setProgress(0)
    setResult(null)
    setError(null)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 2000)

      const response = await fetch("/api/import-meals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      clearInterval(progressInterval)
      setProgress(100)

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
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Import Meals from CSV</h1>
          <p className="text-gray-600">Import meal data from the CSV file with USDA nutrition calculations</p>
        </div>

        <div className="grid gap-6">
          {/* Import Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Meal Import Process
              </CardTitle>
              <CardDescription>
                This will fetch the CSV file, calculate nutrition using USDA API, and import all meals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {importing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing meals...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}

              <Button
                onClick={handleImport}
                disabled={importing}
                className="w-full bg-fitnest-green hover:bg-fitnest-green/90"
              >
                {importing ? "Importing Meals..." : "Start Import"}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="space-y-2">
                  <p className="font-semibold">Import Successful!</p>
                  <ul className="text-sm space-y-1">
                    <li>• CSV meals found: {result.csvMeals}</li>
                    <li>• Total variations processed: {result.totalProcessed}</li>
                    <li>• Successfully imported: {result.message}</li>
                  </ul>
                </div>
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

          {/* Process Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                What This Process Does
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-semibold">Data Processing:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Fetches CSV from Vercel Blob</li>
                    <li>• Parses meal data for 3 plan types</li>
                    <li>• Converts ingredients to customer-friendly format</li>
                    <li>• Calculates nutrition using USDA API</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Database Updates:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Creates meals table if needed</li>
                    <li>• Clears existing imported meals</li>
                    <li>• Inserts new meals with full metadata</li>
                    <li>• Assigns appropriate images</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CSV Structure Info */}
          <Card>
            <CardHeader>
              <CardTitle>Expected CSV Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg text-sm font-mono">
                <div className="space-y-1">
                  <div>
                    meals,Muscle gain 2200–2500 kcal/day,Weight loss 1200–1500 kcal/day,Stay fit 1600–1900 kcal/day
                  </div>
                  <div className="text-gray-600">Chia seed breakfast pudding,"Chia seeds: 40 grams..."</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
