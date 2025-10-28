"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ShoppingCart, Plus, Filter, AlertCircle, Bug, RefreshCcw } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useSession } from "next-auth/react"

interface Product {
  id: number | string
  name: string
  description: string
  price: number
  salePrice?: number
  imageUrl?: string
  category?: string
  tags?: string
  stock?: number
}

interface ExpressShopContentProps {
  initialProducts?: Product[]
  initialError?: string | null
  initialDebugInfo?: any
}

export function ExpressShopContent({
  initialProducts = [],
  initialError = null,
  initialDebugInfo = null,
}: ExpressShopContentProps) {
  console.log("Rendering ExpressShopContent", {
    initialProductCount: initialProducts.length,
    initialError,
    initialDebugInfo,
  })

  const { data: session, status } = useSession()
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(initialError)
  const [debugInfo, setDebugInfo] = useState<any>(initialDebugInfo)
  const [activeCategory, setActiveCategory] = useState("all")
  const [addingToCart, setAddingToCart] = useState<number | string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [clientSideFetch, setClientSideFetch] = useState(false)
  const { toast } = useToast()

  // Add client-side debugging
  useEffect(() => {
    console.log("ExpressShopContent mounted", {
      productsLength: products.length,
      error,
      debugInfo,
      status,
    })

    // Add a visible indicator that the component has mounted
    const debugElement = document.createElement("div")
    debugElement.id = "client-debug"
    debugElement.style.position = "fixed"
    debugElement.style.bottom = "10px"
    debugElement.style.right = "10px"
    debugElement.style.padding = "5px"
    debugElement.style.background = "rgba(0,0,0,0.7)"
    debugElement.style.color = "white"
    debugElement.style.fontSize = "12px"
    debugElement.style.borderRadius = "4px"
    debugElement.style.zIndex = "9999"
    debugElement.textContent = `Client mounted: ${new Date().toISOString()}`
    document.body.appendChild(debugElement)

    return () => {
      if (document.getElementById("client-debug")) {
        document.getElementById("client-debug")?.remove()
      }
    }
  }, [])

  // Only fetch products client-side if explicitly requested
  useEffect(() => {
    if (!clientSideFetch) return

    async function fetchProducts() {
      try {
        setLoading(true)
        console.log("Fetching products client-side...")

        const response = await fetch("/api/products-simple")
        console.log("Response status:", response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.error("API error response:", errorText)
          throw new Error(`API returned status ${response.status}: ${errorText}`)
        }

        const data = await response.json()
        console.log("Products data:", data)

        if (!Array.isArray(data)) {
          console.error("API did not return an array:", data)
          throw new Error("API did not return an array of products")
        }

        setProducts(data)
        setError(null)
      } catch (err) {
        console.error("Error fetching products:", err)
        setError(err instanceof Error ? err.message : "Failed to load products. Please try again.")
        setDebugInfo((prev: any) => ({ ...prev, clientError: String(err) }))
      } finally {
        setLoading(false)
        setClientSideFetch(false)
      }
    }

    fetchProducts()
  }, [clientSideFetch, retryCount])

  // Extract unique categories from products
  const categories = ["all", ...new Set(products.map((product) => product.category).filter(Boolean))]

  const filteredProducts =
    activeCategory === "all" ? products : products.filter((product) => product.category === activeCategory)

  const handleAddToCart = async (productId: number | string) => {
    if (status !== "authenticated") {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to add items to your cart",
      })
      return
    }

    setAddingToCart(productId)
    try {
      // Use the main cart API
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || `Failed to add item to cart (${response.status})`)
      }

      const data = await response.json()
      console.log("Added to cart:", data)

      // Find the product to display in toast
      const product = products.find((p) => p.id === productId)

      // Dispatch custom event to update cart count
      window.dispatchEvent(new CustomEvent("cart:updated"))

      toast({
        title: "Added to cart",
        description: `${product?.name || "Item"} has been added to your cart`,
      })
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
    setClientSideFetch(true)
    setRetryCount((prev) => prev + 1)
  }

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-fitnest-green" />
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        {debugInfo && (
          <div className="mb-6 rounded-md bg-gray-100 p-4">
            <h3 className="mb-2 flex items-center text-sm font-medium">
              <Bug className="mr-2 h-4 w-4" /> Debug Information
            </h3>
            <pre className="max-h-60 overflow-auto text-xs">{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}

        <div className="flex justify-center gap-4">
          <Button onClick={handleRetry} className="bg-fitnest-green hover:bg-fitnest-green/90">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Link href="/express-shop/simple">
            <Button variant="outline" className="border-fitnest-green text-fitnest-green hover:bg-fitnest-green/10">
              View Simple Version
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // No products state
  if (products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
          <ShoppingCart className="h-16 w-16 text-fitnest-green/50" />
          <h2 className="text-2xl font-semibold">No products available</h2>
          <p className="text-gray-500">Check back soon for our new product lineup!</p>

          <div className="mt-4 flex gap-4">
            <Button onClick={handleRetry} className="bg-fitnest-green hover:bg-fitnest-green/90">
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Link href="/express-shop/simple">
              <Button variant="outline" className="border-fitnest-green text-fitnest-green hover:bg-fitnest-green/10">
                View Simple Version
              </Button>
            </Link>
          </div>

          {debugInfo && (
            <div className="mt-8 w-full max-w-2xl rounded-md bg-gray-100 p-4">
              <h3 className="mb-2 flex items-center text-sm font-medium">
                <Bug className="mr-2 h-4 w-4" /> Debug Information
              </h3>
              <pre className="max-h-60 overflow-auto text-xs">{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Main content with products
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold">Express Shop</h1>
        <p className="mx-auto max-w-2xl text-gray-600">
          Browse our selection of healthy snacks, protein bars, and more for quick delivery.
        </p>
      </div>

      {status !== "authenticated" && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            Please{" "}
            <Link href="/login?callbackUrl=/express-shop" className="font-medium underline">
              log in
            </Link>{" "}
            to add items to your cart.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory} className="mb-8">
        <div className="flex items-center justify-between">
          <TabsList className="overflow-x-auto">
            {categories.map((category) => (
              <TabsTrigger key={category || "uncategorized"} value={category || "uncategorized"} className="capitalize">
                {category?.replace("_", " ") || "Uncategorized"}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="border-fitnest-green text-fitnest-green hover:bg-fitnest-green/10"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-fitnest-green text-fitnest-green hover:bg-fitnest-green/10"
            >
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
          </div>
        </div>

        {categories.map((category) => (
          <TabsContent key={category || "uncategorized"} value={category || "uncategorized"} className="mt-6">
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
                        {product.salePrice && <Badge className="absolute right-2 top-2 bg-fitnest-orange">Sale</Badge>}
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
                              <span className="text-lg font-bold text-fitnest-green">{product.salePrice} MAD</span>
                              <span className="text-sm text-gray-500 line-through">{product.price} MAD</span>
                            </div>
                          ) : (
                            <span className="text-lg font-bold text-fitnest-green">{product.price} MAD</span>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {product.category?.replace("_", " ") || "Uncategorized"}
                        </Badge>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 space-y-2">
                      <Link href={`/express-shop/${product.id}`} className="w-full">
                        <Button
                          variant="outline"
                          className="w-full border-fitnest-green text-fitnest-green hover:bg-fitnest-green/10"
                        >
                          View Product
                        </Button>
                      </Link>
                      <Button
                        className="w-full bg-fitnest-green hover:bg-fitnest-green/90"
                        onClick={() => handleAddToCart(product.id)}
                        disabled={addingToCart === product.id || status !== "authenticated"}
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
    </div>
  )
}
