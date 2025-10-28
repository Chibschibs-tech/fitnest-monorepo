import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"

// Force dynamic to prevent caching issues
export const dynamic = "force-dynamic"

export async function GET() {
  const diagnosticInfo = {
    databaseConnection: false,
    tableExists: false,
    columnNames: [],
    sampleProducts: [],
    errors: [],
  }

  try {
    // Step 1: Check database connection
    await sql`SELECT 1`
    diagnosticInfo.databaseConnection = true

    // Step 2: Check if products table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'products'
      ) as exists
    `
    diagnosticInfo.tableExists = tableCheck[0].exists

    if (diagnosticInfo.tableExists) {
      // Step 3: Get column names
      const columns = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products'
      `
      diagnosticInfo.columnNames = columns.map((col) => col.column_name)

      // Step 4: Try to fetch a few products with minimal fields
      try {
        const products = await sql`
          SELECT id, name, description, price 
          FROM products 
          LIMIT 3
        `
        diagnosticInfo.sampleProducts = products
      } catch (error) {
        diagnosticInfo.errors.push({
          step: "basic_fetch",
          message: error instanceof Error ? error.message : String(error),
        })
      }

      // Step 5: Try to fetch with the problematic column
      try {
        const productsWithSalePrice = await sql`
          SELECT id, name, saleprice 
          FROM products 
          LIMIT 1
        `
        diagnosticInfo.salepriceTest = {
          success: true,
          data: productsWithSalePrice,
        }
      } catch (error) {
        diagnosticInfo.salepriceTest = {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        }
      }
    }

    return NextResponse.json(diagnosticInfo)
  } catch (error) {
    diagnosticInfo.errors.push({
      step: "connection",
      message: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json(diagnosticInfo, { status: 500 })
  }
}
