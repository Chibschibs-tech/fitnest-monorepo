"use client"

import { useState, useEffect } from "react"
import { X, ShoppingCart, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

interface CartPreviewProps {
  product: {
    name: string
    price: number
    salePrice?: number
    imageUrl?: string
  }
  quantity: number
  onClose: () => void
}

export default function CartPreview({ product, quantity, onClose }: CartPreviewProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Auto-hide after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Allow animation to complete
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={`fixed top-20 right-4 z-50 w-80 transform rounded-lg border bg-white p-4 shadow-lg transition-all duration-300 ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="flex items-center text-sm font-medium">
          <ShoppingCart className="mr-2 h-4 w-4" /> Added to Cart
        </h3>
        <button onClick={() => setIsVisible(false)} className="text-gray-400 hover:text-gray-600">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center space-x-3 py-2">
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-gray-100">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl || "/placeholder.svg"}
              alt={product.name}
              width={64}
              height={64}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-gray-400" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium">{product.name}</h4>
          <div className="mt-1 flex items-center">
            {product.salePrice ? (
              <>
                <span className="text-sm font-medium text-green-600">{product.salePrice} MAD</span>
                <span className="ml-2 text-xs text-gray-500 line-through">{product.price} MAD</span>
              </>
            ) : (
              <span className="text-sm font-medium">{product.price} MAD</span>
            )}
            <span className="ml-2 text-xs text-gray-500">× {quantity}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex space-x-2">
        <Link href="/shopping-cart" className="flex-1">
          <Button variant="default" className="w-full" size="sm">
            View Cart <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </Link>
        <Button variant="outline" size="sm" onClick={() => setIsVisible(false)}>
          Continue Shopping
        </Button>
      </div>
    </div>
  )
}
