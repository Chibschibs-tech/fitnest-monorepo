export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { getCartId, updateCartItemQuantity } from "@/lib/db-utils"

export async function POST(request: Request) {
  try {
    const { productId, quantity } = await request.json()

    if (!productId || !quantity) {
      return NextResponse.json({ success: false, error: "Invalid product ID or quantity" }, { status: 400 })
    }

    const cartId = getCartId()
    await updateCartItemQuantity(cartId, productId, quantity)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating cart:", error)
    return NextResponse.json({ success: false, error: "Failed to update cart" }, { status: 500 })
  }
}
