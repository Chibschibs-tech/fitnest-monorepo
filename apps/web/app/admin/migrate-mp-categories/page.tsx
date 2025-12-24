"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react"

export default function MigrateMPCategoriesPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message?: string
    categoriesCreated?: number
    mealPlansMigrated?: number
    error?: string
  } | null>(null)

  const runMigration = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/migrate-to-mp-categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setResult({
          success: true,
          message: data.message,
          categoriesCreated: data.categoriesCreated,
          mealPlansMigrated: data.mealPlansMigrated,
        })
      } else {
        setResult({
          success: false,
          error: data.error || "Migration failed",
        })
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>MP Categories Migration</CardTitle>
          <CardDescription>
            Run the migration to create the mp_categories table and migrate existing meal plans from audience to mp_category_id
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                {result.success ? (
                  <div className="space-y-2">
                    <p className="font-semibold">{result.message}</p>
                    {result.categoriesCreated !== undefined && (
                      <p>Categories created/verified: {result.categoriesCreated}</p>
                    )}
                    {result.mealPlansMigrated !== undefined && (
                      <p>Meal plans migrated: {result.mealPlansMigrated}</p>
                    )}
                    <p className="text-sm text-gray-600 mt-2">
                      ✅ Migration completed! You can now use MP Categories in the admin panel.
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-semibold">Migration Failed</p>
                    <p>{result.error}</p>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {!result && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This migration will:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Create the mp_categories table</li>
                  <li>Create default categories (Keto, Low Carb, Balanced, Muscle Gain, Custom)</li>
                  <li>Add mp_category_id column to meal_plans table</li>
                  <li>Migrate existing audience values to mp_category_id</li>
                </ul>
                <p className="mt-2 text-sm text-gray-600">
                  This is safe to run multiple times - it will only create what doesn't exist.
                </p>
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={runMigration}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running Migration...
              </>
            ) : result?.success ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Migration Complete
              </>
            ) : (
              "Run Migration"
            )}
          </Button>

          {result?.success && (
            <div className="mt-4 p-4 bg-green-50 rounded-md">
              <p className="text-sm text-green-800">
                <strong>Next steps:</strong>
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-green-700">
                <li>Go to <a href="/admin/products/mp-categories" className="underline font-semibold">MP Categories</a> to manage categories</li>
                <li>Go to <a href="/admin/products/meal-plans" className="underline font-semibold">Meal Plans</a> to create/edit meal plans with categories</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}





