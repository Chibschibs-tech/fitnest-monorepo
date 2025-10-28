export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"

export async function GET() {
  try {
    // Initialize the Neon SQL client

    // Simple query with minimal fields
    const productData = await sql`
      SELECT id, name, price
      FROM products
      LIMIT 10
    `

    return NextResponse.json(productData || [])
  } catch (error) {
    console.error("Error in basic products API:", error)
    // Return empty array on error
    return NextResponse.json([])
  }
}
