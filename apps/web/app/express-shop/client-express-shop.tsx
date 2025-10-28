"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Loader2, ShoppingCart, Plus, Filter, AlertCircle, Bug } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

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

export default function ClientExpressShop() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rawResponse, setRawResponse] = useState<any>(null)
  const [activeCategory, setActiveCategory] = useState("all")
  const [addingToCart, setAddingToCart] = useState<number | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [categories, setCategories] = useState<string[]>(["all"])

  useEffect(() => {
    // Check authentication status
    checkAuthStatus()

    // Fetch products
    fetchProducts()
  }, [retryCount])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth-direct")
      const data = await response.json()
      console.log("Auth status:", data)
      setIsAuthenticated(data.isAuthenticated)
      setDebugInfo(data)
    } catch (error) {
      console.error("Error checking auth status:", error)
      setIsAuthenticated(false)
    }
  }

  async function fetchProducts() {
    try {
      setLoading(true)
      console.log("Fetching products...")

      // First ensure products exist
      await fetch("/api/seed-products")

      // Then fetch products
      const response = await fetch("/api/products")
      console.log("Response status:", response.status)

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`)
      }

      const products = await response.json()
      console.log("Fetched products:", products)

      if (!Array.isArray(products)) {
        console.error("API did not return an array:", products)
        throw new Error("API did not return an array of products")
      }

      setProducts(products)

      // Extract unique categories
      const uniqueCategories = ["all", ...new Set(products.map((product: Product) => product.category))]
      setCategories(uniqueCategories)
    } catch (err) {
      console.error("Error fetching products:", err)
      setError(err instanceof Error ? err.message : "Failed to load products. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts =
    activeCategory === "all" ? products : products.filter((product) => product.category === activeCategory)

  const handleAddToCart = async (productId: number) => {
    if (!isAuthenticated) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to add items to your cart",
      })
      return
    }

    setAddingToCart(productId)
    try {
      console.log("Adding product to cart:", productId)

      // Use the direct cart API
      const response = await fetch("/api/cart-direct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      })

      console.log("Cart API response status:", response.status)

      const responseText = await response.text()
      console.log("Cart API response:", responseText)

      let responseData
      try {
        responseData = JSON.parse(responseText)
      } catch (e) {
        console.error("Failed to parse response as JSON:", e)
        throw new Error("Invalid response from server")
      }

      if (!response.ok) {
        throw new Error(responseData.error || responseData.details || "Failed to add item to cart")
      }

      toast({
        title: "Added to cart",
        description: "Item has been added to your cart",
      })

      // Dispatch custom event to update cart count
      window.dispatchEvent(new CustomEvent("cart:updated"))
    } catch (error) {
      console.error("Error adding item to cart:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add item to cart. Please try again.",
      })
    } finally {
      setAddingToCart(null)
    }
  }

  const handleRetry = () => {
    setError(null)
    setRawResponse(null)
    setRetryCount((prev) => prev + 1)
  }

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-green-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        {rawResponse && (
          <div className="mb-6 rounded-md bg-gray-100 p-4">
            <h3 className="mb-2 flex items-center text-sm font-medium">
              <Bug className="mr-2 h-4 w-4" /> Debug Information
            </h3>
            <pre className="max-h-60 overflow-auto text-xs">{JSON.stringify(rawResponse, null, 2)}</pre>
          </div>
        )}

        <div className="flex justify-center">
          <Button onClick={handleRetry}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold">Express Shop</h1>
        <p className="mx-auto max-w-2xl text-gray-600">
          Browse our selection of healthy snacks, protein bars, and more for quick delivery.
        </p>
      </div>

      {!isAuthenticated && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            Please{" "}
            <Link href="/login" className="font-medium underline">
              log in
            </Link>{" "}
            to add items to your cart.
          </AlertDescription>
        </Alert>
      )}

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
          <ShoppingCart className="h-16 w-16 text-gray-400" />
          <h2 className="text-2xl font-semibold">No products available</h2>
          <p className="text-gray-500">Check back soon for our new product lineup!</p>
          <Button onClick={handleRetry}>Refresh Products</Button>
        </div>
      ) : (
        <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory} className="mb-8">
          <div className="flex items-center justify-between">
            <TabsList className="overflow-x-auto">
              {categories.map((category) => (
                <TabsTrigger key={category} value={category} className="capitalize">
                  {category.replace("_", " ")}
                </TabsTrigger>
              ))}
            </TabsList>
            <Button variant="outline" size="sm" className="ml-4">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
          </div>

          {categories.map((category) => (
            <TabsContent key={category} value={category} className="mt-6">
              {filteredProducts.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center space-y-4 text-center">
                  <p className="text-lg font-medium">No products found</p>
                  <p className="text-sm text-gray-500">Try selecting a different category</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {filteredProducts.map((product) => (
                    <Card key={product.id} className="overflow-hidden">
                      <Link href={`/express-shop/${product.id}`}>
                        <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                          {product.imageUrl ? (
                            <Image
                              src={product.imageUrl || "/placeholder.svg"}
                              alt={product.name}
                              fill
                              className="object-cover transition-transform hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <ShoppingCart className="h-12 w-12 text-gray-300" />
                            </div>
                          )}
                          {product.salePrice && <Badge className="absolute right-2 top-2 bg-green-600">Sale</Badge>}
                        </div>
                      </Link>
                      <CardHeader className="p-4 pb-0">
                        <CardTitle className="line-clamp-1 text-lg">{product.name}</CardTitle>
                        <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <div className="flex items-center justify-between">
                          <div>
                            {product.salePrice ? (
                              <div className="flex items-center space-x-2">
                                <span className="text-lg font-bold text-green-600">{product.salePrice} MAD</span>
                                <span className="text-sm text-gray-500 line-through">{product.price} MAD</span>
                              </div>
                            ) : (
                              <span className="text-lg font-bold">{product.price} MAD</span>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {product.category.replace("_", " ")}
                          </Badge>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Button
                          className="w-full"
                          onClick={() => handleAddToCart(product.id)}
                          disabled={addingToCart === product.id || !isAuthenticated}
                        >
                          {addingToCart === product.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Plus className="mr-2 h-4 w-4" />
                          )}
                          Add to Cart
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}
