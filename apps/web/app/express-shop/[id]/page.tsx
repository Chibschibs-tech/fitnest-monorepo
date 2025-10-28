import { sql, db } from "@/lib/db"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, ArrowLeft, Star } from "lucide-react"
import { AddToCart } from "./add-to-cart"

// Force dynamic rendering
export const dynamic = "force-dynamic"

export default async function ProductDetail({ params }: { params: { id: string } }) {
  const { id } = params

  // Fetch product details
  let product = null
  let error = null

  try {

    // Query with the correct column names
    const result = await sql`
      SELECT 
        id, 
        name, 
        description, 
        price, 
        saleprice as "salePrice", 
        imageurl as "imageUrl", 
        category,
        tags,
        stock,
        isactive as "isActive"
      FROM products
      WHERE id = ${id} AND isactive = true
    `

    if (result.length > 0) {
      product = result[0]
    }
  } catch (err) {
    console.error("Error fetching product:", err)
    error = err instanceof Error ? err.message : String(err)
  }

  // If there's an error, show a simple error message
  if (error) {
    return (
      <div className="container mx-auto p-8">
        <div className="mb-8 rounded-md border border-red-200 bg-red-50 p-4">
          <h2 className="font-medium text-red-800">Error Loading Product</h2>
          <p className="mt-2 text-red-700">{error}</p>
          <div className="mt-4">
            <Link href="/express-shop">
              <Button variant="outline">Back to Shop</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // If product not found, show 404
  if (!product) {
    notFound()
  }

  // Format tags if they exist
  const tags = product.tags ? product.tags.split(",").map((tag) => tag.trim()) : []

  return (
    <div className="container mx-auto px-4 py-12">
      <Link href="/express-shop" className="mb-8 flex items-center text-gray-600 hover:text-gray-900">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Shop
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ShoppingCart className="h-24 w-24 text-gray-300" />
            </div>
          )}
          {product.salePrice && <Badge className="absolute right-4 top-4 bg-green-600 px-3 py-1 text-base">Sale</Badge>}
        </div>

        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>

          <div className="mt-2 flex items-center">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-5 w-5 fill-current text-yellow-400" />
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600">5.0 (24 reviews)</span>
          </div>

          <div className="mt-4">
            {product.salePrice ? (
              <div className="flex items-center space-x-2">
                <span className="text-3xl font-bold text-green-600">{product.salePrice} MAD</span>
                <span className="text-xl text-gray-500 line-through">{product.price} MAD</span>
                <Badge className="ml-2 bg-green-600">
                  {Math.round(((product.price - product.salePrice) / product.price) * 100)}% OFF
                </Badge>
              </div>
            ) : (
              <span className="text-3xl font-bold">{product.price} MAD</span>
            )}
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-medium">Description</h2>
            <p className="mt-2 text-gray-600">{product.description}</p>
          </div>

          {tags.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-medium">Tags</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="capitalize">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <h2 className="text-lg font-medium">Availability</h2>
            <p className="mt-2 text-gray-600">
              {product.stock > 0 ? `In Stock (${product.stock} available)` : "Out of Stock"}
            </p>
          </div>

          <div className="mt-8">
            <AddToCart productId={product.id} stock={product.stock} name={product.name} />
          </div>
        </div>
      </div>
    </div>
  )
}
