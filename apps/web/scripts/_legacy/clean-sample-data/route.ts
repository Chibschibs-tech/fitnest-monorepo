import { type NextRequest, NextResponse } from "next/server"
import { sql, db } from "@/lib/db"
import { getSessionUser } from "@/lib/simple-auth"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("session-id")?.value
    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getSessionUser(sessionId)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    console.log("Starting sample data cleanup...")

    // First, delete orders that reference users we want to delete
    const deletedOrders = await sql`
      DELETE FROM orders 
      WHERE user_id IN (
        SELECT id FROM users 
        WHERE email LIKE '%@example.com' 
        OR email LIKE 'test-%'
        OR name = 'TEST'
        OR name LIKE 'Test %'
      )
    `

    console.log(`Deleted ${deletedOrders.length} sample orders`)

    // Then delete sample users
    const deletedUsers = await sql`
      DELETE FROM users 
      WHERE email LIKE '%@example.com' 
      OR email LIKE 'test-%'
      OR name = 'TEST'
      OR name LIKE 'Test %'
    `

    console.log(`Deleted ${deletedUsers.length} sample users`)

    // Clean up waitlist sample data
    const deletedWaitlist = await sql`
      DELETE FROM waitlist 
      WHERE email LIKE '%@example.com' 
      OR email LIKE 'test-%'
      OR first_name = 'TEST'
      OR last_name = 'SUBMISSION'
    `

    console.log(`Deleted ${deletedWaitlist.length} sample waitlist entries`)

    return NextResponse.json({
      success: true,
      message: "Sample data cleaned successfully",
      deleted: {
        orders: deletedOrders.length,
        users: deletedUsers.length,
        waitlist: deletedWaitlist.length,
      },
    })
  } catch (error) {
    console.error("Error cleaning sample data:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to clean sample data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
