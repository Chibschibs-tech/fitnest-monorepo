import { sql, db } from "@/lib/db"
import Image from "next/image"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function MinimalExpressShop() {
  let products = []
  let error = null

  try {

    // Check if products table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'products'
      ) as exists
    `

    if (!tableExists[0].exists) {
      return (
        <div className="container mx-auto p-6">
          <h1 className="mb-6 text-2xl font-bold">Express Shop</h1>
          <div className="rounded-lg bg-amber-50 p-4 text-amber-800">
            <p>Products table does not exist. Please initialize the database first.</p>
            <Link href="/api/schema-check" className="mt-4 inline-block rounded bg-amber-600 px-4 py-2 text-white">
              Check Schema
            </Link>
          </div>
        </div>
      )
    }

    // Get column information
    const columns = await sql`
      SELECT column_name
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'products'
    `

    const columnNames = columns.map((c) => c.column_name)

    // Build query based on available columns
    let query = `
      SELECT 
        id, 
        name, 
        description, 
        price
    `

    if (columnNames.includes("saleprice")) {
      query += `, saleprice as "salePrice"`
    }

    if (columnNames.includes("imageurl")) {
      query += `, imageurl as "imageUrl"`
    }

    if (columnNames.includes("category")) {
      query += `, category`
    }

    query += ` FROM products`

    if (columnNames.includes("isactive")) {
      query += ` WHERE isactive = true`
    }

    query += ` LIMIT 12`

    const result = await q(query)
    products = result.rows
  } catch (err) {
    console.error("Error fetching products:", err)
    error = err instanceof Error ? err.message : String(err)
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-2xl font-bold">Express Shop - Minimal Version</h1>

      {error ? (
        <div className="rounded-lg bg-red-50 p-4 text-red-800">
          <h2 className="mb-2 font-semibold">Error</h2>
          <p>{error}</p>
          <Link href="/api/schema-check" className="mt-4 inline-block rounded bg-red-600 px-4 py-2 text-white">
            Check Schema
          </Link>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-lg bg-amber-50 p-4 text-amber-800">
          <p>No products found. Please seed the database first.</p>
          <Link href="/api/products-simple" className="mt-4 inline-block rounded bg-amber-600 px-4 py-2 text-white">
            Seed Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <div key={product.id} className="overflow-hidden rounded-lg border bg-white shadow-sm">
              <div className="relative h-48 w-full bg-gray-200">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gray-100 text-gray-500">No image</div>
                )}
              </div>
              <div className="p-4">
                <h3 className="mb-2 text-lg font-medium">{product.name}</h3>
                <p className="mb-4 text-sm text-gray-600">{product.description}</p>
                <div className="flex items-center justify-between">
                  <div>
                    {product.salePrice ? (
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">{product.salePrice} MAD</span>
                        <span className="text-sm text-gray-500 line-through">{product.price} MAD</span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold">{product.price} MAD</span>
                    )}
                  </div>
                  <Link
                    href={`/express-shop/${product.id}`}
                    className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 flex space-x-4">
        <Link href="/express-shop" className="rounded bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300">
          Back to Main Shop
        </Link>
        <Link href="/api/schema-check" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Check Schema
        </Link>
        <Link href="/api/products-simple" className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700">
          Refresh Products
        </Link>
      </div>
    </div>
  )
}
