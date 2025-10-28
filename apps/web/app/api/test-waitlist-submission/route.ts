export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"


export async function GET() {
  try {
    // Create a test submission
    const testData = {
      firstName: "TEST",
      lastName: "SUBMISSION",
      email: `test-${Date.now()}@example.com`,
      phone: "123-456-7890",
      mealPlan: "weight-loss",
      city: "Test City",
      notifications: true,
    }

    // Insert the test submission
    const result = await sql`
      INSERT INTO waitlist (
        first_name, 
        last_name, 
        email, 
        phone, 
        preferred_meal_plan, 
        city, 
        wants_notifications,
        position,
        status,
        created_at
      ) VALUES (
        ${testData.firstName},
        ${testData.lastName},
        ${testData.email},
        ${testData.phone},
        ${testData.mealPlan},
        ${testData.city},
        ${testData.notifications},
        (SELECT COALESCE(MAX(position), 0) + 1 FROM waitlist),
        'waiting',
        NOW()
      )
      RETURNING id, position
    `

    // Get the latest waitlist entries
    const latestEntries = await sql`
      SELECT * FROM waitlist
      ORDER BY created_at DESC
      LIMIT 5
    `

    return NextResponse.json({
      success: true,
      message: "Test submission created successfully",
      testData,
      insertedId: result[0]?.id,
      position: result[0]?.position,
      latestEntries,
    })
  } catch (error) {
    console.error("Test submission error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
