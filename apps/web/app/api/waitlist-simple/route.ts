export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"


export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Log the submission for debugging
    console.log("Waitlist submission received:", {
      ...body,
      timestamp: new Date().toISOString(),
    })

    // Extract data from the form
    const { firstName, lastName, email, phone, mealPlan, city, notifications } = body

    // Insert into waitlist table
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
        ${firstName || ""},
        ${lastName || ""},
        ${email || ""},
        ${phone || null},
        ${mealPlan || null},
        ${city || null},
        ${notifications || false},
        (SELECT COALESCE(MAX(position), 0) + 1 FROM waitlist),
        'waiting',
        NOW()
      )
      RETURNING id, position
    `

    console.log("Waitlist submission saved to database:", {
      id: result[0]?.id,
      position: result[0]?.position,
      email,
      timestamp: new Date().toISOString(),
    })

    // Always return success
    return NextResponse.json({
      success: true,
      message: "Thank you for your interest! Your request has been registered. We will contact you by email very soon.",
      debug: {
        saved: true,
        id: result[0]?.id,
        position: result[0]?.position,
      },
    })
  } catch (error) {
    console.error("Error processing waitlist submission:", error)

    // Log the error details
    console.error({
      message: "Failed to save waitlist submission",
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    })

    // Still return success to the user
    return NextResponse.json({
      success: true,
      message: "Thank you for your interest! Your request has been registered. We will contact you by email very soon.",
      debug: {
        saved: false,
        error: error.message,
      },
    })
  }
}
