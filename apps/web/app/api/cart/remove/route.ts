export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { getCartId, removeFromCart } from "@/lib/db-utils"

export async function POST(request: Request) {
  try {
    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json({ success: false, error: "Invalid product ID" }, { status: 400 })
    }

    const cartId = getCartId()
    await removeFromCart(cartId, productId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing from cart:", error)
    return NextResponse.json({ success: false, error: "Failed to remove from cart" }, { status: 500 })
  }
}
