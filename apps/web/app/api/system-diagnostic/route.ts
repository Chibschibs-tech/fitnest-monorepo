export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { testDatabaseConnection, checkProductsTable, checkCartTable, checkAuthentication } from "@/lib/diagnostic-utils"

export async function GET() {
  try {
    // Run all diagnostics in parallel
    const [dbConnection, productsTable, cartTable, authStatus] = await Promise.all([
      testDatabaseConnection(),
      checkProductsTable(),
      checkCartTable(),
      checkAuthentication(),
    ])

    // Determine overall system status
    const systemStatus = {
      healthy: dbConnection.success && productsTable.success && (productsTable.hasData || false) && cartTable.success,
      issues: [],
    }

    // Collect issues
    if (!dbConnection.success) {
      systemStatus.issues.push("Database connection failed")
    }

    if (!productsTable.success) {
      systemStatus.issues.push("Products table does not exist")
    } else if (productsTable.hasData === false) {
      systemStatus.issues.push("Products table is empty")
    }

    if (!cartTable.success || !cartTable.exists) {
      systemStatus.issues.push("Cart table does not exist")
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      systemStatus,
      diagnostics: {
        database: dbConnection,
        products: productsTable,
        cart: cartTable,
        authentication: authStatus,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Diagnostic failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
