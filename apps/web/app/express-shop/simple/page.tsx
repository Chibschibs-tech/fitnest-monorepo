import { sql, db } from "@/lib/db"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart } from "lucide-react"

// Force dynamic rendering
export const dynamic = "force-dynamic"

export default async function SimpleExpressShop() {
  // Fetch products directly in the page
  let products = []
  let error = null

  try {

    // Simple query to get products
    const result = await sql`
      SELECT 
        id, 
        name, 
        description, 
        price, 
        COALESCE(sale_price, saleprice) as "salePrice", 
        COALESCE(image_url, imageurl) as "imageUrl", 
        category,
        stock
      FROM products
      LIMIT 100
    `

    products = result
    console.log(`Found ${products.length} products`)
  } catch (err) {
    console.error("Error fetching products:", err)
    error = err instanceof Error ? err.message : String(err)
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold">Express Shop (Simple View)</h1>
        <p className="mx-auto max-w-2xl text-gray-600">This is a simplified view to troubleshoot loading issues.</p>
      </div>

      {error ? (
        <div className="rounded-md bg-red-50 p-4 text-red-800">
          <h3 className="text-lg font-medium">Error loading products</h3>
          <p>{error}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
          <ShoppingCart className="h-16 w-16 text-gray-400" />
          <h2 className="text-2xl font-semibold">No products available</h2>
          <p className="text-gray-500">Check back soon for our new product lineup!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ShoppingCart className="h-12 w-12 text-gray-300" />
                  </div>
                )}
                {product.salePrice && <Badge className="absolute right-2 top-2 bg-green-600">Sale</Badge>}
              </div>
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
                    {product.category?.replace("_", " ") || "Uncategorized"}
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Link href={`/express-shop/${product.id}`} className="w-full">
                  <Button className="w-full bg-green-600 hover:bg-green-700">View Details</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
