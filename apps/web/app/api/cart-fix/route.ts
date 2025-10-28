export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"

export async function GET(request: Request) {
  try {

    // Get cart ID from cookie
    const cartId = request.headers
      .get("cookie")
      ?.split(";")
      .find((c) => c.trim().startsWith("cartId="))
      ?.split("=")[1]

    console.log("=== CART FIX DEBUG ===")
    console.log("Cart ID from cookie:", cartId)

    // Check all cart data
    const allCartData = await sql`SELECT * FROM cart ORDER BY created_at DESC LIMIT 10`
    console.log("All cart data:", allCartData)

    // If we have a cart ID, check if it exists
    let cartExists = false
    if (cartId) {
      const existingCart = await sql`SELECT * FROM cart WHERE id = ${cartId}`
      cartExists = existingCart.length > 0
      console.log("Cart exists for this ID:", cartExists)
    }

    // Find the most recent cart entry (likely the user's cart)
    const recentCart = allCartData.length > 0 ? allCartData[0] : null

    return NextResponse.json({
      cartId,
      cartExists,
      allCartData,
      recentCart,
      suggestion: cartExists
        ? "Cart ID matches - should work"
        : recentCart
          ? `Update cookie to use cart ID: ${recentCart.id}`
          : "No cart data found - add items first",
      message: "Check console for debug info",
    })
  } catch (error) {
    console.error("Cart fix debug error:", error)
    return NextResponse.json({
      error: "Debug failed",
      details: error instanceof Error ? error.message : String(error),
    })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    console.log("=== CART FIX ACTION ===")

    if (body.action === "sync_cart_id") {
      // Find the most recent cart entry
      const recentCart = await sql`
        SELECT * FROM cart ORDER BY created_at DESC LIMIT 1
      `

      if (recentCart.length > 0) {
        const correctCartId = recentCart[0].id
        console.log("Setting cart ID to:", correctCartId)

        return NextResponse.json({
          success: true,
          cartId: correctCartId,
          message: "Cart ID synchronized",
        })
      } else {
        return NextResponse.json(
          {
            error: "No cart data found",
          },
          { status: 404 },
        )
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Cart fix error:", error)
    return NextResponse.json({
      error: "Fix failed",
      details: error instanceof Error ? error.message : String(error),
    })
  }
}
