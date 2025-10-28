export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"


export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("=== TEST WAITLIST SUBMISSION ===")
    console.log("Received data:", body)
    console.log("Timestamp:", new Date().toISOString())

    // Try to insert into the waitlist table to test if it works
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
        status
      ) VALUES (
        'TEST',
        'SUBMISSION',
        ${body.email || "test@example.com"},
        ${body.phone || "N/A"},
        ${body.mealPlanPreference || null},
        ${body.city || "Test City"},
        ${body.notifications || false},
        (SELECT COALESCE(MAX(position), 0) + 1 FROM waitlist),
        'waiting'
      )
      RETURNING *
    `

    console.log("Successfully inserted test submission:", result[0])

    return NextResponse.json({
      success: true,
      message: "Test submission successful",
      insertedData: result[0],
      originalData: body,
    })
  } catch (error) {
    console.error("Test submission failed:", error)
    const body = await request.json()
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        originalData: body,
      },
      { status: 500 },
    )
  }
}
