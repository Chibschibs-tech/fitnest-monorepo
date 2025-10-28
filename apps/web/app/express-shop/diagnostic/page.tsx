import { sql, db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function ExpressShopDiagnostic() {
  let diagnosticData = null
  let error = null

  try {

    // Test database connection
    const connectionTest = await sql`SELECT 1 as connection_test`

    // Get all tables
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `

    // Check if products table exists
    const productsTableExists = tables.some((t) => t.table_name === "products")

    let productsColumns = []
    let productCount = 0
    let sampleProducts = []

    if (productsTableExists) {
      // Get columns for products table
      productsColumns = await sql`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'products'
        ORDER BY ordinal_position
      `

      // Count products
      const countResult = await sql`SELECT COUNT(*) as count FROM products`
      productCount = Number.parseInt(countResult[0].count)

      // Get sample products
      if (productCount > 0) {
        sampleProducts = await sql`SELECT * FROM products LIMIT 3`
      }
    }

    diagnosticData = {
      connectionTest: connectionTest[0],
      tables: tables.map((t) => t.table_name),
      productsTable: {
        exists: productsTableExists,
        columns: productsColumns,
        recordCount: productCount,
        sampleProducts,
      },
      timestamp: new Date().toISOString(),
    }
  } catch (err) {
    console.error("Database diagnostic error:", err)
    error = err instanceof Error ? err.message : String(err)
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-2xl font-bold">Express Shop Diagnostic</h1>

      {error ? (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-800">
          <h2 className="mb-2 font-semibold">Database Connection Error</h2>
          <p className="mb-4">{error}</p>
          <p className="text-sm">
            Please check your DATABASE_URL environment variable and ensure your Neon database is properly configured.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-lg bg-green-50 p-4 text-green-800">
            <h2 className="mb-2 font-semibold">Database Connection</h2>
            <p>✅ Successfully connected to database</p>
          </div>

          <div className="rounded-lg border p-4">
            <h2 className="mb-2 font-semibold">Database Tables</h2>
            {diagnosticData?.tables.length === 0 ? (
              <p>No tables found in database</p>
            ) : (
              <ul className="list-inside list-disc">
                {diagnosticData?.tables.map((table) => (
                  <li key={table}>{table}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-lg border p-4">
            <h2 className="mb-2 font-semibold">Products Table</h2>
            {!diagnosticData?.productsTable.exists ? (
              <div>
                <p className="mb-4 text-amber-600">❌ Products table does not exist</p>
                <Link href="/api/products">
                  <Button>Create Products Table</Button>
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-green-600">✅ Products table exists</p>
                <p className="mt-2">Total products: {diagnosticData.productsTable.recordCount}</p>

                <h3 className="mt-4 mb-2 font-medium">Columns:</h3>
                <ul className="mb-4 list-inside list-disc">
                  {diagnosticData.productsTable.columns.map((col) => (
                    <li key={col.column_name}>
                      {col.column_name} ({col.data_type})
                    </li>
                  ))}
                </ul>

                {diagnosticData.productsTable.recordCount === 0 ? (
                  <div>
                    <p className="mb-4 text-amber-600">❌ No products found</p>
                    <Link href="/api/products">
                      <Button>Seed Products</Button>
                    </Link>
                  </div>
                ) : (
                  <div>
                    <h3 className="mt-4 mb-2 font-medium">Sample Products:</h3>
                    <pre className="max-h-60 overflow-auto rounded bg-gray-100 p-2 text-xs">
                      {JSON.stringify(diagnosticData.productsTable.sampleProducts, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex space-x-4">
            <Link href="/express-shop">
              <Button>Go to Express Shop</Button>
            </Link>
            <Link href="/api/products">
              <Button variant="outline">Fetch Products API</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
