import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const cookieStore = cookies()
    const cartId = cookieStore.get("cartId")?.value

    if (!cartId) {
      return NextResponse.json({ count: 0 })
    }


    // Get cart count using the cart table
    const result = await sql`
      SELECT COALESCE(SUM(quantity), 0) as count 
      FROM cart 
      WHERE id = ${cartId}
    `

    const count = Number(result[0]?.count) || 0

    return NextResponse.json({ count })
  } catch (error) {
    console.error("Error getting cart count:", error)
    return NextResponse.json({ count: 0 })
  }
}
