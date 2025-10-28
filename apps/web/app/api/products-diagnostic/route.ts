import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"

// Force dynamic to prevent caching issues
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const diagnosticInfo: any = {}

    // Check database connection
    try {
      await sql`SELECT 1`
      diagnosticInfo.connection = "success"
    } catch (error) {
      diagnosticInfo.connection = "failed"
      diagnosticInfo.connectionError = String(error)
      return NextResponse.json(diagnosticInfo)
    }

    // Check if products table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'products'
      ) as exists
    `
    diagnosticInfo.productsTableExists = tableCheck[0].exists

    if (!diagnosticInfo.productsTableExists) {
      return NextResponse.json(diagnosticInfo)
    }

    // Get column information
    const columnInfo = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'products'
    `
    diagnosticInfo.columns = columnInfo

    // Count products
    const countResult = await sql`SELECT COUNT(*) FROM products`
    diagnosticInfo.productCount = Number.parseInt(countResult[0].count)

    // Get sample product if any exist
    if (diagnosticInfo.productCount > 0) {
      const sampleProduct = await sql`
        SELECT * FROM products LIMIT 1
      `
      diagnosticInfo.sampleProduct = sampleProduct[0]
    }

    return NextResponse.json(diagnosticInfo)
  } catch (error) {
    console.error("Diagnostic error:", error)
    return NextResponse.json({
      success: false,
      error: "Diagnostic failed",
      details: error instanceof Error ? error.message : String(error),
    })
  }
}
