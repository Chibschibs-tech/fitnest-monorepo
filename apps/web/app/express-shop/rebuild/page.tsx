import { Suspense } from "react"
import { sql, db } from "@/lib/db"
import Link from "next/link"
import Image from "next/image"

// Force dynamic to prevent caching
export const dynamic = "force-dynamic"

async function getProducts() {
  try {

    const products = await sql`
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
      LIMIT 20
    `

    return products
  } catch (error) {
    console.error("Error fetching products:", error)
    return []
  }
}

function ProductSkeleton() {
  return (
    <div className="border rounded-lg p-4 space-y-2 animate-pulse">
      <div className="bg-gray-200 h-40 rounded-md"></div>
      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-8 bg-gray-200 rounded w-1/4"></div>
    </div>
  )
}

function ProductGrid({ products }) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center p-8">
        <h3 className="text-xl font-semibold mb-4">No products found</h3>
        <p className="mb-4">It looks like there are no products available right now.</p>
        <Link
          href="/api/rebuild-database"
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
        >
          Rebuild Database
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div key={product.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="aspect-square relative">
            <Image
              src={product.imageUrl || `/placeholder.svg?height=300&width=300&query=product`}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
            <div className="flex items-center justify-between">
              <div>
                {product.salePrice ? (
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{(product.salePrice / 100).toFixed(2)} MAD</span>
                    <span className="text-sm text-gray-500 line-through">{(product.price / 100).toFixed(2)} MAD</span>
                  </div>
                ) : (
                  <span className="text-lg font-bold">{(product.price / 100).toFixed(2)} MAD</span>
                )}
              </div>
              <Link
                href={`/express-shop/${product.id}`}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
              >
                View
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default async function ExpressShopPage() {
  const products = await getProducts()

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Express Shop</h1>
        <p className="text-gray-600">
          Browse our selection of healthy snacks and supplements to complement your meal plans.
        </p>
      </div>

      <div className="mb-6">
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                This is the rebuilt Express Shop page using the new database schema.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <Link
            href="/api/rebuild-database"
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
          >
            Rebuild Database
          </Link>
          <Link
            href="/api/direct-db-check"
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded"
          >
            Check Database
          </Link>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        }
      >
        <ProductGrid products={products} />
      </Suspense>
    </div>
  )
}
