export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { db, orders } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { guestInfo, mealPlan } = await request.json()

    // Validate input
    if (!guestInfo || !mealPlan) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Create a guest order
    // For guest orders, we'll use a special userId of -1 to indicate it's a guest
    // In a real application, you might want to create a proper guest user record
    const guestOrder = await db
      .insert(orders)
      .values({
        userId: -1, // Special ID for guest users
        planId: 1, // Default plan ID, in a real app you'd map this from the selection
        totalAmount: mealPlan.totalPrice,
        deliveryAddress: guestInfo.address,
        deliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        status: "pending",
        // You might want to add additional columns to store guest information
        // such as name, email, phone, etc.
      })
      .returning()

    // In a real application, you would also:
    // 1. Send a confirmation email to the guest
    // 2. Store the guest information in a separate table
    // 3. Create a unique order tracking code

    return NextResponse.json(guestOrder[0], { status: 201 })
  } catch (error) {
    console.error("Error creating guest order:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}
