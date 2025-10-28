export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"

export async function GET() {
  try {

    // Check what tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%cart%'
      ORDER BY table_name
    `

    // Check cart table structure if it exists
    let cartColumns = []
    try {
      cartColumns = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'cart' 
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `
    } catch (e) {
      // Cart table doesn't exist
    }

    // Check cart_items table structure if it exists
    let cartItemsColumns = []
    try {
      cartItemsColumns = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'cart_items' 
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `
    } catch (e) {
      // Cart_items table doesn't exist
    }

    // Check products table structure
    const productColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `

    return NextResponse.json({
      tables,
      cartColumns,
      cartItemsColumns,
      productColumns,
    })
  } catch (error) {
    console.error("Error checking tables:", error)
    return NextResponse.json(
      {
        error: "Failed to check tables",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
