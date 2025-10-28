"use client"

import { useState, useEffect } from "react"
import { ProductDetailContent } from "./product-detail-content"
import { Loader2 } from "lucide-react"

interface Product {
  id: number
  name: string
  description: string
  price: number
  salePrice?: number
  imageUrl?: string
  category: string
  tags?: string
  nutritionalInfo?: any
  stock: number
}

export default function ClientProductDetail({ id }: { id: string }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProductData() {
      try {
        setLoading(true)
        // Fetch product details
        const productResponse = await fetch(`/api/products/${id}`)
        if (!productResponse.ok) {
          throw new Error("Failed to fetch product details")
        }
        const productData = await productResponse.json()
        setProduct(productData)

        // Fetch related products
        const relatedResponse = await fetch(`/api/products?category=${productData.category}`)
        if (!relatedResponse.ok) {
          throw new Error("Failed to fetch related products")
        }
        const relatedData = await relatedResponse.json()
        setRelatedProducts(relatedData)
      } catch (err) {
        console.error("Error fetching product data:", err)
        setError("Failed to load product details. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchProductData()
  }, [id])

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-12">
        <Loader2 className="h-12 w-12 animate-spin text-green-600" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="rounded-md bg-red-50 p-4 text-red-700">{error || "Product not found"}</div>
      </div>
    )
  }

  return <ProductDetailContent product={product} relatedProducts={relatedProducts} />
}
