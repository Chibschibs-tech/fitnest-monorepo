import { sql, db } from "@/lib/db"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Plus } from "lucide-react"

// Force dynamic rendering
export const dynamic = "force-dynamic"

export default async function ExpressShop() {
  console.log("Rendering Express Shop page")

  // Fetch products server-side
  let products = []
  let error = null

  try {
    console.log("Connecting to database")

    // Simple query to get products with the correct column names
    console.log("Fetching products")
    const result = await sql`
      SELECT 
        id, 
        name, 
        description, 
        price, 
        saleprice as "salePrice", 
        imageurl as "imageUrl", 
        category,
        stock
      FROM products
      WHERE isactive = true
      ORDER BY id ASC
      LIMIT 100
    `

    products = result
    console.log(`Found ${products.length} products`)
  } catch (err) {
    console.error("Error fetching products:", err)
    error = err instanceof Error ? err.message : String(err)
  }

  // If there's an error, show a simple error message
  if (error) {
    return (
      <div className="container mx-auto p-8">
        <div className="mb-8 rounded-md border border-red-200 bg-red-50 p-4">
          <h2 className="font-medium text-red-800">Error Loading Products</h2>
          <p className="mt-2 text-red-700">{error}</p>
          <div className="mt-4">
            <Link href="/api/rebuild-database">
              <Button className="bg-green-600 hover:bg-green-700">Rebuild Database</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // If no products, show a message
  if (products.length === 0) {
    return (
      <div className="container mx-auto p-8">
        <div className="mb-8 rounded-md border border-amber-200 bg-amber-50 p-4">
          <h2 className="font-medium text-amber-800">No Products Found</h2>
          <p className="mt-2 text-amber-700">
            No products were found in the database. Please rebuild the database or add products.
          </p>
          <div className="mt-4">
            <Link href="/api/rebuild-database">
              <Button className="bg-green-600 hover:bg-green-700">Rebuild Database</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Group products by category
  const productsByCategory = products.reduce((acc, product) => {
    const category = product.category || "Uncategorized"
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(product)
    return acc
  }, {})

  // Get unique categories
  const categories = Object.keys(productsByCategory)

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold">Express Shop</h1>
        <p className="mx-auto max-w-2xl text-gray-600">
          Browse our selection of healthy snacks, protein bars, and more for quick delivery.
        </p>
      </div>

      {categories.map((category) => (
        <div key={category} className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold capitalize">{category.replace("_", " ")}</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {productsByCategory[category].map((product) => (
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
                      {product.stock > 0 ? "In Stock" : "Out of Stock"}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Link href={`/express-shop/${product.id}`} className="w-full">
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      <Plus className="mr-2 h-4 w-4" />
                      View Product
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
