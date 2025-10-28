export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getSessionUser } from "@/lib/simple-auth"
import { sql, db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const cookieStore = cookies()
    const sessionId = cookieStore.get("session-id")?.value

    if (!sessionId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const user = await getSessionUser(sessionId)

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    let userOrders

    if (userId && user.role === "admin") {
      userOrders = await sql`SELECT * FROM orders WHERE user_id = ${userId}`
    } else {
      userOrders = await sql`SELECT * FROM orders WHERE user_id = ${user.id}`
    }

    return NextResponse.json(userOrders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const sessionId = cookieStore.get("session-id")?.value

    if (!sessionId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const user = await getSessionUser(sessionId)

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { planId, totalAmount, deliveryAddress, deliveryDate } = await request.json()

    if (!planId || !totalAmount || !deliveryAddress || !deliveryDate) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }


    const newOrder = await sql`
      INSERT INTO orders (user_id, plan_id, total_amount, delivery_address, delivery_date, status)
      VALUES (${user.id}, ${planId}, ${totalAmount}, ${deliveryAddress}, ${deliveryDate}, 'pending')
      RETURNING *
    `

    return NextResponse.json(newOrder[0], { status: 201 })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}
