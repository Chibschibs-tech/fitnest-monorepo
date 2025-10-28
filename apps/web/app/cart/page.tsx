import { CartContent } from "./cart-content"
import { sql, db } from "@/lib/db"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export default async function Cart() {
  const cookieStore = cookies()
  const cartId = cookieStore.get("cartId")?.value

  if (!cartId) {
    // If no cart ID, return empty cart
    return <CartContent cartItems={[]} summary={{ subtotal: 0, discount: 0, total: 0 }} />
  }

  try {

    // Get cart items with product details using the cart table
    const cartItems = await sql`
      SELECT 
        c.id as cart_id,
        c.product_id,
        c.quantity,
        p.name,
        p.price,
        p.saleprice,
        p.imageurl
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.id = ${cartId}
    `

    // Format cart items
    const formattedCartItems = cartItems.map((item) => ({
      id: `${item.cart_id}-${item.product_id}`,
      productId: item.product_id,
      quantity: item.quantity,
      name: item.name,
      price: Number(item.price) / 100, // Convert from cents to MAD
      salePrice: item.saleprice ? Number(item.saleprice) / 100 : null,
      imageUrl: item.imageurl,
    }))

    // Calculate totals
    let subtotal = 0
    let discount = 0

    for (const item of formattedCartItems) {
      const itemPrice = item.salePrice || item.price
      subtotal += itemPrice * item.quantity

      if (item.salePrice) {
        discount += (item.price - item.salePrice) * item.quantity
      }
    }

    const total = subtotal

    return <CartContent cartItems={formattedCartItems} summary={{ subtotal, discount, total }} />
  } catch (error) {
    console.error("Error fetching cart:", error)
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="mb-8 text-3xl font-bold">Your Cart</h1>
        <div className="rounded-lg bg-red-50 p-6 text-red-800">
          <h2 className="text-xl font-medium">Something went wrong</h2>
          <p className="mt-2">
            {error instanceof Error ? error.message : "An error occurred while fetching your cart."}
          </p>
          <p className="mt-4">Please try again later or contact support if the problem persists.</p>
        </div>
      </div>
    )
  }
}
