"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function DebugPage() {
  const [status, setStatus] = useState<string>("Loading...")
  const [error, setError] = useState<string | null>(null)
  const [envCheck, setEnvCheck] = useState<string>("Checking...")

  useEffect(() => {
    // Check if we can render a basic page
    try {
      setStatus("Client-side rendering works")

      // Check if we can make a basic fetch request
      fetch("/api/health")
        .then((res) => res.json())
        .then((data) => {
          setEnvCheck(`API routes work: ${JSON.stringify(data)}`)
        })
        .catch((err) => {
          setEnvCheck(`API fetch error: ${err.message}`)
        })
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`)
    }
  }, [])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">System Diagnostic</h1>

      <div className="mb-4 p-4 border rounded">
        <h2 className="font-semibold">Rendering Status:</h2>
        <p className={error ? "text-red-500" : "text-green-500"}>{status}</p>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      <div className="mb-4 p-4 border rounded">
        <h2 className="font-semibold">API Check:</h2>
        <p>{envCheck}</p>
      </div>

      <div className="mt-6">
        <Link href="/" className="text-blue-500 hover:underline">
          Return to Home
        </Link>
      </div>
    </div>
  )
}
