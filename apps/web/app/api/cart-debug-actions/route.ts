export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = cookies()
    const cartId = cookieStore.get("cartId")?.value

    // Check cart structure
    const cartItems = await sql`
      SELECT * FROM cart_items 
      WHERE cart_id = ${cartId || "no-cart-id"}
      LIMIT 5
    `

    // Check table structure
    const tableInfo = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'cart_items'
    `

    return NextResponse.json({
      status: "success",
      cartId,
      cartItems,
      tableStructure: tableInfo,
      apiEndpoints: {
        put: "/api/cart (PUT method)",
        delete: "/api/cart (DELETE method)",
      },
    })
  } catch (error) {
    return NextResponse.json({
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
