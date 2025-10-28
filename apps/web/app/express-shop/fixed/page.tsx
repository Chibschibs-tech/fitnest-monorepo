import { sql, db } from "@/lib/db"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, AlertCircle } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function FixedExpressShop() {
  let products = []
  let error = null
  const debugInfo = { timestamp: new Date().toISOString() }

  try {
    // Connect directly to the database
    debugInfo.dbConnected = true

    // Check if products table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'products'
      ) as exists
    `
    debugInfo.tableExists = tableExists[0].exists

    if (!tableExists[0].exists) {
      // Create the products table with camelCase column names
      await sql`
        CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT NOT NULL,
          price DECIMAL(10, 2) NOT NULL,
          saleprice DECIMAL(10, 2),
          category TEXT,
          imageurl TEXT,
          stock INTEGER NOT NULL DEFAULT 0,
          isactive BOOLEAN DEFAULT true
        )
      `
      debugInfo.tableCreated = true

      // Seed with sample data
      const sampleProducts = [
        {
          id: "protein-bar-1",
          name: "Protein Bar - Chocolate",
          description: "Delicious chocolate protein bar with 20g of protein.",
          price: 25.99,
          saleprice: null,
          category: "protein_bars",
          imageurl: "/protein-bar.png",
          stock: 100,
        },
        {
          id: "protein-bar-2",
          name: "Protein Bar - Berry",
          description: "Delicious berry protein bar with 18g of protein.",
          price: 25.99,
          saleprice: 19.99,
          category: "protein_bars",
          imageurl: "/berry-protein-bar.png",
          stock: 75,
        },
        {
          id: "granola-1",
          name: "Honey Almond Granola",
          description: "Crunchy granola with honey and almonds.",
          price: 45.99,
          saleprice: null,
          category: "granola",
          imageurl: "/honey-almond-granola.png",
          stock: 50,
        },
      ]

      for (const product of sampleProducts) {
        await sql`
          INSERT INTO products (id, name, description, price, saleprice, category, imageurl, stock)
          VALUES (${product.id}, ${product.name}, ${product.description}, ${product.price}, 
                  ${product.saleprice}, ${product.category}, ${product.imageurl}, ${product.stock})
          ON CONFLICT (id) DO NOTHING
        `
      }
      debugInfo.productsSeedded = true
    }

    // Get column information to adapt our query
    const columns = await sql`
      SELECT column_name
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'products'
    `
    const columnNames = columns.map((c) => c.column_name)
    debugInfo.columns = columnNames

    // Use raw SQL query with the correct column names
    // This is the key fix - we're using the exact column names from your database
    const result = await q(`
      SELECT 
        id, 
        name, 
        description, 
        price,
        ${columnNames.includes("saleprice") ? 'saleprice as "salePrice",' : ""}
        ${columnNames.includes("imageurl") ? 'imageurl as "imageUrl",' : ""}
        ${columnNames.includes("category") ? "category," : ""}
        ${columnNames.includes("stock") ? "stock" : "NULL as stock"}
      FROM products
      ${columnNames.includes("isactive") ? "WHERE isactive = true" : ""}
      LIMIT 100
    `)

    products = result.rows
    debugInfo.productCount = products.length
  } catch (err) {
    console.error("Error in fixed Express Shop:", err)
    error = err instanceof Error ? err.message : String(err)
    debugInfo.error = error
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Express Shop (Fixed Version)</h1>
        <p className="text-gray-600">Browse our selection of healthy snacks and protein bars.</p>
      </div>

      {/* Debug information (hidden in production) */}
      <div className="mb-6 rounded-md border border-gray-200 bg-gray-50 p-4">
        <h2 className="mb-2 text-sm font-medium">Debug Information</h2>
        <pre className="overflow-auto text-xs">{JSON.stringify(debugInfo, null, 2)}</pre>
      </div>

      {error ? (
        <div className="mb-8 rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
          <div className="flex items-center">
            <AlertCircle className="mr-2 h-5 w-5" />
            <h2 className="font-medium">Error</h2>
          </div>
          <p className="mt-2">{error}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ShoppingCart className="mb-4 h-16 w-16 text-gray-400" />
          <h2 className="mb-2 text-xl font-medium">No products available</h2>
          <p className="mb-6 text-gray-500">Check back soon for our new product lineup!</p>
          <Link href="/api/products-simple" className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700">
            Seed Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
                  <div className="flex h-full items-center justify-center bg-gray-100 text-gray-500">
                    <ShoppingCart className="h-12 w-12 text-gray-300" />
                  </div>
                )}
                {product.salePrice && (
                  <div className="absolute right-2 top-2 rounded-full bg-green-600 px-2 py-1 text-xs font-medium text-white">
                    Sale
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="mb-1 text-lg font-medium">{product.name}</h3>
                <p className="mb-4 text-sm text-gray-600 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between">
                  <div>
                    {product.salePrice ? (
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-green-600">{product.salePrice} MAD</span>
                        <span className="text-sm text-gray-500 line-through">{product.price} MAD</span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold">{product.price} MAD</span>
                    )}
                  </div>
                  <Link
                    href={`/express-shop/${product.id}`}
                    className="rounded-md bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-4">
        <Link href="/express-shop" className="rounded-md bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300">
          Back to Main Shop
        </Link>
        <Link href="/api/schema-check" className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Check Schema
        </Link>
        <Link href="/api/products-simple" className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700">
          Refresh Products
        </Link>
      </div>
    </div>
  )
}
