"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Play } from "lucide-react"

interface TestCase {
  name: string
  description: string
  input: {
    plan: string
    meals: string[]
    days: number
    duration: number
  }
  expectedTotal?: number
  shouldFail?: boolean
}

const testCases: TestCase[] = [
  {
    name: "Minimum Case",
    description: "1 meal, 3 days, 1 week - no discounts",
    input: {
      plan: "Weight Loss",
      meals: ["Breakfast"],
      days: 3,
      duration: 1,
    },
    expectedTotal: 135, // 45 * 3 * 1 = 135 MAD
  },
  {
    name: "Combined Discounts",
    description: "2 meals, 5 days, 4 weeks - should apply 3% + 10%",
    input: {
      plan: "Weight Loss",
      meals: ["Breakfast", "Lunch"],
      days: 5,
      duration: 4,
    },
    expectedTotal: 1746, // Corrected: (45+55)*5*0.97*0.90*4 = 1746 MAD
  },
  {
    name: "Maximum Discounts",
    description: "3 meals, 7 days, 12 weeks - should apply 7% + 20%",
    input: {
      plan: "Muscle Gain",
      meals: ["Breakfast", "Lunch", "Dinner"],
      days: 7,
      duration: 12,
    },
  },
  {
    name: "Invalid Meal",
    description: "Non-existent meal type - should return 400",
    input: {
      plan: "Weight Loss",
      meals: ["NonExistentMeal"],
      days: 5,
      duration: 4,
    },
    shouldFail: true,
  },
  {
    name: "Invalid Plan",
    description: "Non-existent plan - should return 400",
    input: {
      plan: "NonExistentPlan",
      meals: ["Breakfast"],
      days: 5,
      duration: 4,
    },
    shouldFail: true,
  },
]

export default function PricingTestPage() {
  const [testResults, setTestResults] = useState<Record<string, any>>({})
  const [isRunning, setIsRunning] = useState(false)
  const [currentTest, setCurrentTest] = useState<string | null>(null)

  const runSingleTest = async (testCase: TestCase) => {
    setCurrentTest(testCase.name)

    try {
      const response = await fetch("/api/calculate-price", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testCase.input),
      })

      const data = await response.json()

      if (testCase.shouldFail) {
        // Test should fail
        if (response.ok) {
          return {
            passed: false,
            error: "Expected test to fail but it succeeded",
            response: data,
          }
        } else {
          return {
            passed: true,
            message: `Correctly failed with: ${data.error}`,
            response: data,
          }
        }
      } else {
        // Test should succeed
        if (!response.ok) {
          return {
            passed: false,
            error: data.error || "Request failed",
            response: data,
          }
        }

        const result: any = {
          passed: true,
          response: data,
        }

        // Check expected total if provided
        if (testCase.expectedTotal) {
          const actualTotal = data.totalRoundedMAD
          const tolerance = 1 // 1 MAD tolerance

          if (Math.abs(actualTotal - testCase.expectedTotal) > tolerance) {
            result.passed = false
            result.error = `Expected total ${testCase.expectedTotal} MAD, got ${actualTotal} MAD`
          } else {
            result.message = `✅ Total matches expected: ${actualTotal} MAD`
          }
        }

        return result
      }
    } catch (error) {
      return {
        passed: false,
        error: error instanceof Error ? error.message : "Unknown error",
        response: null,
      }
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setTestResults({})

    for (const testCase of testCases) {
      const result = await runSingleTest(testCase)
      setTestResults((prev) => ({
        ...prev,
        [testCase.name]: result,
      }))

      // Small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    setIsRunning(false)
    setCurrentTest(null)
  }

  const runSingleTestHandler = async (testCase: TestCase) => {
    setIsRunning(true)
    const result = await runSingleTest(testCase)
    setTestResults((prev) => ({
      ...prev,
      [testCase.name]: result,
    }))
    setIsRunning(false)
    setCurrentTest(null)
  }

  const passedTests = Object.values(testResults).filter((r) => r.passed).length
  const totalTests = Object.keys(testResults).length

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pricing API Tests</h1>
          <p className="text-gray-600 mt-2">Automated tests for the dynamic pricing calculation API</p>
        </div>

        <div className="mb-6">
          <Button onClick={runAllTests} disabled={isRunning} className="mr-4">
            <Play className="h-4 w-4 mr-2" />
            {isRunning ? "Running Tests..." : "Run All Tests"}
          </Button>

          {totalTests > 0 && (
            <div className="inline-flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                Results: {passedTests}/{totalTests} passed
              </span>
              {passedTests === totalTests && totalTests > 0 && <CheckCircle className="h-4 w-4 text-green-600" />}
            </div>
          )}
        </div>

        {currentTest && (
          <Alert className="mb-6">
            <Play className="h-4 w-4" />
            <AlertDescription>
              Running test: <strong>{currentTest}</strong>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6">
          {testCases.map((testCase) => {
            const result = testResults[testCase.name]

            return (
              <Card key={testCase.name}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {result &&
                          (result.passed ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-600" />
                          ))}
                        {testCase.name}
                      </CardTitle>
                      <CardDescription>{testCase.description}</CardDescription>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => runSingleTestHandler(testCase)}
                      disabled={isRunning}
                    >
                      Run Test
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Input:</h4>
                      <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                        {JSON.stringify(testCase.input, null, 2)}
                      </pre>
                    </div>

                    {testCase.expectedTotal && (
                      <div>
                        <h4 className="font-semibold mb-2">Expected Total:</h4>
                        <p className="text-sm text-gray-600">{testCase.expectedTotal} MAD</p>
                      </div>
                    )}

                    {result && (
                      <div>
                        <h4 className="font-semibold mb-2">Result:</h4>
                        {result.passed ? (
                          <Alert>
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>
                              <strong>✅ PASSED</strong>
                              {result.message && <div className="mt-1">{result.message}</div>}
                            </AlertDescription>
                          </Alert>
                        ) : (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              <strong>❌ FAILED</strong>
                              <div className="mt-1">{result.error}</div>
                            </AlertDescription>
                          </Alert>
                        )}

                        {result.response && (
                          <div className="mt-4">
                            <h5 className="font-medium mb-2">API Response:</h5>
                            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto max-h-64">
                              {JSON.stringify(result.response, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
