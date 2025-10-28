"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, AlertTriangle, RefreshCw, Database, Shield, Play, RotateCcw } from "lucide-react"

export default function MigrationControlPage() {
  const [migrationPlan, setMigrationPlan] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [executionStatus, setExecutionStatus] = useState<any>(null)
  const [currentPhase, setCurrentPhase] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const loadMigrationPlan = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/migration-plan")
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`)
      }

      const data = await response.json()
      setMigrationPlan(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load migration plan")
    } finally {
      setLoading(false)
    }
  }

  const executePhase = async (phase: string) => {
    try {
      setCurrentPhase(phase)
      setError(null)

      const response = await fetch("/api/execute-migration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phase, confirm: true }),
      })

      if (!response.ok) {
        throw new Error(`Migration phase failed: ${response.status}`)
      }

      const result = await response.json()
      setExecutionStatus((prev) => ({ ...prev, [phase]: result }))

      // Update progress
      const phases = ["backup", "migrate", "verify"]
      const completedPhases = phases.filter((p) => executionStatus?.[p]?.status === "completed").length
      setProgress((completedPhases / phases.length) * 100)
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to execute ${phase}`)
    } finally {
      setCurrentPhase(null)
    }
  }

  useEffect(() => {
    loadMigrationPlan()
  }, [])

  if (loading && !migrationPlan) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="mb-6 text-3xl font-bold">Database Migration Control</h1>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center">
            <RefreshCw className="mx-auto h-12 w-12 animate-spin text-green-600" />
            <p className="mt-4 text-lg text-gray-600">Analyzing database for migration plan...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Database Migration Control</h1>
          <p className="text-gray-600">Comprehensive database schema migration for Fitnest.ma</p>
        </div>
        <Button onClick={loadMigrationPlan} disabled={loading} variant="outline">
          {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh Analysis
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {migrationPlan && (
        <>
          {/* Migration Overview */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Database className="mr-2 h-5 w-5" />
                    Migration Overview
                  </CardTitle>
                  <CardDescription>
                    {migrationPlan.migrationSteps.length} steps • {migrationPlan.estimatedTotalTime} estimated
                  </CardDescription>
                </div>
                <Badge
                  variant={migrationPlan.riskAssessment.level === "LOW" ? "default" : "destructive"}
                  className="text-md px-3 py-1"
                >
                  {migrationPlan.riskAssessment.level} RISK
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{migrationPlan.migrationSteps.length}</div>
                  <div className="text-sm text-gray-600">Migration Steps</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{migrationPlan.issues.length}</div>
                  <div className="text-sm text-gray-600">Issues to Fix</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{migrationPlan.dataBackupNeeded.length}</div>
                  <div className="text-sm text-gray-600">Tables to Backup</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {migrationPlan.riskAssessment.estimatedDowntime}
                  </div>
                  <div className="text-sm text-gray-600">Estimated Downtime</div>
                </div>
              </div>

              {progress > 0 && (
                <div className="mt-4">
                  <div className="mb-2 flex justify-between text-sm">
                    <span>Migration Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Risk Assessment */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Risk Assessment & Safety
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="mb-2 font-medium">Safety Measures</h3>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center text-green-600">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Full data backup before migration
                    </li>
                    <li className="flex items-center text-green-600">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Complete rollback capability
                    </li>
                    <li className="flex items-center text-green-600">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Step-by-step verification
                    </li>
                    <li className="flex items-center text-green-600">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      No data loss risk
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="mb-2 font-medium">Critical Tables</h3>
                  {migrationPlan.riskAssessment.criticalTables.map((table: any, index: number) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="font-mono">{table.table}</span>
                      <Badge variant="outline">{table.rowCount} rows</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Migration Execution */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Play className="mr-2 h-5 w-5" />
                Migration Execution
              </CardTitle>
              <CardDescription>
                Execute migration phases in order. Each phase must complete successfully before proceeding.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Phase 1: Backup */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        executionStatus?.backup?.status === "completed"
                          ? "bg-green-100 text-green-600"
                          : currentPhase === "backup"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {executionStatus?.backup?.status === "completed" ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : currentPhase === "backup" ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        "1"
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">Phase 1: Data Backup</h3>
                      <p className="text-sm text-gray-600">Create safety backups of all existing data</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => executePhase("backup")}
                    disabled={currentPhase !== null || executionStatus?.backup?.status === "completed"}
                    variant={executionStatus?.backup?.status === "completed" ? "outline" : "default"}
                  >
                    {currentPhase === "backup" ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Backing up...
                      </>
                    ) : executionStatus?.backup?.status === "completed" ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Completed
                      </>
                    ) : (
                      "Start Backup"
                    )}
                  </Button>
                </div>

                {/* Phase 2: Migration */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        executionStatus?.migrate?.status === "completed"
                          ? "bg-green-100 text-green-600"
                          : currentPhase === "migrate"
                            ? "bg-blue-100 text-blue-600"
                            : executionStatus?.backup?.status === "completed"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {executionStatus?.migrate?.status === "completed" ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : currentPhase === "migrate" ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        "2"
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">Phase 2: Schema Migration</h3>
                      <p className="text-sm text-gray-600">Apply database schema changes and fixes</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => executePhase("migrate")}
                    disabled={
                      currentPhase !== null ||
                      executionStatus?.backup?.status !== "completed" ||
                      executionStatus?.migrate?.status === "completed"
                    }
                    variant={executionStatus?.migrate?.status === "completed" ? "outline" : "default"}
                  >
                    {currentPhase === "migrate" ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Migrating...
                      </>
                    ) : executionStatus?.migrate?.status === "completed" ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Completed
                      </>
                    ) : (
                      "Start Migration"
                    )}
                  </Button>
                </div>

                {/* Phase 3: Verification */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        executionStatus?.verify?.status === "completed"
                          ? "bg-green-100 text-green-600"
                          : currentPhase === "verify"
                            ? "bg-blue-100 text-blue-600"
                            : executionStatus?.migrate?.status === "completed"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {executionStatus?.verify?.status === "completed" ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : currentPhase === "verify" ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        "3"
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">Phase 3: Verification</h3>
                      <p className="text-sm text-gray-600">Verify migration success and data integrity</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => executePhase("verify")}
                    disabled={
                      currentPhase !== null ||
                      executionStatus?.migrate?.status !== "completed" ||
                      executionStatus?.verify?.status === "completed"
                    }
                    variant={executionStatus?.verify?.status === "completed" ? "outline" : "default"}
                  >
                    {currentPhase === "verify" ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : executionStatus?.verify?.status === "completed" ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Completed
                      </>
                    ) : (
                      "Start Verification"
                    )}
                  </Button>
                </div>

                {/* Emergency Rollback */}
                <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600">
                      <RotateCcw className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-medium text-red-800">Emergency Rollback</h3>
                      <p className="text-sm text-red-600">Revert all changes if something goes wrong</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => executePhase("rollback")}
                    disabled={currentPhase !== null}
                    variant="destructive"
                  >
                    {currentPhase === "rollback" ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Rolling back...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Rollback
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Execution Results */}
          {executionStatus && Object.keys(executionStatus).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Execution Results</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={Object.keys(executionStatus)[0]}>
                  <TabsList>
                    {Object.keys(executionStatus).map((phase) => (
                      <TabsTrigger key={phase} value={phase} className="capitalize">
                        {phase}
                        {executionStatus[phase].status === "completed" && (
                          <CheckCircle className="ml-2 h-4 w-4 text-green-600" />
                        )}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {Object.entries(executionStatus).map(([phase, result]: [string, any]) => (
                    <TabsContent key={phase} value={phase}>
                      <div className="space-y-4">
                        <Alert variant={result.status === "completed" ? "default" : "destructive"}>
                          <AlertTitle className="capitalize">{phase} Phase</AlertTitle>
                          <AlertDescription>{result.message}</AlertDescription>
                        </Alert>
                        <div className="space-y-2">
                          {result.results?.map((step: any, index: number) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <span className="font-mono">{step.step || step.check}</span>
                              <Badge variant={step.status === "success" ? "default" : "destructive"}>
                                {step.status}
                                {step.count !== undefined && ` (${step.count})`}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Success Message */}
          {executionStatus?.verify?.status === "completed" && (
            <Alert className="mt-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Migration Completed Successfully! 🎉</AlertTitle>
              <AlertDescription className="text-green-700">
                <div className="mt-2 space-y-1">
                  <p>✅ Database schema has been standardized</p>
                  <p>✅ All missing columns and tables have been added</p>
                  <p>✅ Cart and checkout systems should now work perfectly</p>
                  <p>✅ Meal plan integration is properly configured</p>
                  <p className="mt-3 font-medium">Your Fitnest.ma application is now ready for production!</p>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  )
}
