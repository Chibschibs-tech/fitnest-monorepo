export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"

export async function POST(request: Request) {
  try {

    // Get cart ID from cookies
    const cartId = request.headers
      .get("cookie")
      ?.split(";")
      .find((c) => c.trim().startsWith("cartId="))
      ?.split("=")[1]

    if (!cartId) {
      return NextResponse.json({ message: "No cart found" })
    }

    // Clear all items from cart
    await sql`
      DELETE FROM cart 
      WHERE id = ${cartId}
    `

    console.log(`Cart ${cartId} cleared successfully`)

    return NextResponse.json({
      success: true,
      message: "Cart cleared successfully",
      count: 0,
    })
  } catch (error) {
    console.error("Error clearing cart:", error)
    return NextResponse.json({ error: "Failed to clear cart" }, { status: 500 })
  }
}
