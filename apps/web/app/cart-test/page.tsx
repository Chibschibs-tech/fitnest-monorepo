"use client"

import type React from "react"

import { useState } from "react"

export default function CartTestPage() {
  const [productId, setProductId] = useState(1)
  const [quantity, setQuantity] = useState(1)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)
    setError(null)

    try {
      const response = await fetch("/api/cart-direct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity,
        }),
      })

      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))

      if (!response.ok) {
        setError(`Error: ${response.status} ${response.statusText}`)
      }
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold">Cart Test Page</h1>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div>
          <label htmlFor="productId" className="block text-sm font-medium text-gray-700">
            Product ID
          </label>
          <input
            type="number"
            id="productId"
            value={productId}
            onChange={(e) => setProductId(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            min="1"
            required
          />
        </div>

        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
            Quantity
          </label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            min="1"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-blue-400"
        >
          {isLoading ? "Adding to Cart..." : "Add to Cart"}
        </button>
      </form>

      {result && (
        <div className="mb-6">
          <h2 className="mb-2 text-xl font-semibold">Result:</h2>
          <pre className="rounded bg-gray-100 p-4">{result}</pre>
        </div>
      )}

      {error && (
        <div className="rounded bg-red-100 p-4 text-red-700">
          <h2 className="mb-2 text-xl font-semibold">Error:</h2>
          <p>{error}</p>
        </div>
      )}

      <div className="mt-6">
        <a href="/test" className="text-blue-600 hover:underline">
          Go to Test Page
        </a>
      </div>
    </div>
  )
}
