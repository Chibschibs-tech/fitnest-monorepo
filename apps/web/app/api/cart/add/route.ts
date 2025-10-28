export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { getCartId, addToCart } from "@/lib/db-utils"

export async function POST(request: Request) {
  try {
    const { productId, quantity } = await request.json()

    if (!productId || !quantity || quantity < 1) {
      return NextResponse.json({ success: false, error: "Invalid product ID or quantity" }, { status: 400 })
    }

    const cartId = getCartId()
    await addToCart(cartId, productId, quantity)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error adding to cart:", error)
    return NextResponse.json({ success: false, error: "Failed to add to cart" }, { status: 500 })
  }
}
