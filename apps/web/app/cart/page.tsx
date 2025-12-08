import { CartContent } from "./cart-content"
import { sql } from "@/lib/db"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export default async function Cart() {
  const cookieStore = cookies()
  const cartId = cookieStore.get("cartId")?.value

  if (!cartId) {
    return <CartContent cartItems={[]} summary={{ subtotal: 0, discount: 0, total: 0 }} />
  }

  try {
    // Fetch cart items from the new unified cart_items table
    const cartItems = await sql`
      SELECT 
        ci.id,
        ci.item_type,
        ci.quantity,
        ci.unit_price,
        ci.total_price,
        ci.plan_name,
        ci.meal_types,
        ci.days_per_week,
        ci.duration_weeks,
        ci.product_id,
        p.name as product_name,
        p.imageurl as product_image
      FROM cart_items ci
      LEFT JOIN products p ON ci.product_id = p.id AND ci.item_type = 'product'
      WHERE ci.cart_id = ${cartId}
      ORDER BY ci.created_at DESC
    `

    // Format items based on type
    const formattedCartItems = cartItems.map((item: any) => {
      if (item.item_type === 'product') {
        return {
          id: item.id,
          item_type: 'product' as const,
          product_id: item.product_id,
          product_name: item.product_name,
          product_image: item.product_image,
          quantity: item.quantity,
          unit_price: Number(item.unit_price),
          total_price: Number(item.total_price),
        }
      } else {
        return {
          id: item.id,
          item_type: 'subscription' as const,
          plan_name: item.plan_name,
          meal_types: item.meal_types || [],
          days_per_week: item.days_per_week,
          duration_weeks: item.duration_weeks,
          quantity: item.quantity,
          unit_price: Number(item.unit_price),
          total_price: Number(item.total_price),
        }
      }
    })

    // Calculate totals
    const subtotal = formattedCartItems.reduce((sum, item) => sum + item.total_price, 0)
    const discount = 0 // Can be calculated from sale prices or discounts
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
