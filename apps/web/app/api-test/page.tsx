"use client"

import { useState, useEffect } from "react"

export default function ApiTestPage() {
  const [testResult, setTestResult] = useState<string | null>(null)
  const [cartResult, setCartResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const testApi = async () => {
    try {
      const response = await fetch("/api/test")
      const data = await response.json()
      setTestResult(JSON.stringify(data, null, 2))
    } catch (err) {
      setError(`Error testing API: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  const testCartApi = async () => {
    try {
      const response = await fetch("/api/cart")
      const data = await response.json()
      setCartResult(JSON.stringify(data, null, 2))
    } catch (err) {
      setError(`Error testing cart API: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  useEffect(() => {
    testApi()
    testCartApi()
  }, [])

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold">API Test Page</h1>

      <div className="mb-6">
        <h2 className="mb-2 text-xl font-semibold">Test API Result:</h2>
        <pre className="rounded bg-gray-100 p-4">{testResult || "Loading..."}</pre>
      </div>

      <div className="mb-6">
        <h2 className="mb-2 text-xl font-semibold">Cart API Result:</h2>
        <pre className="rounded bg-gray-100 p-4">{cartResult || "Loading..."}</pre>
      </div>

      {error && (
        <div className="rounded bg-red-100 p-4 text-red-700">
          <h2 className="mb-2 text-xl font-semibold">Error:</h2>
          <p>{error}</p>
        </div>
      )}

      <div className="mt-6">
        <button onClick={testApi} className="mr-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Test API Again
        </button>
        <button onClick={testCartApi} className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700">
          Test Cart API Again
        </button>
      </div>
    </div>
  )
}
