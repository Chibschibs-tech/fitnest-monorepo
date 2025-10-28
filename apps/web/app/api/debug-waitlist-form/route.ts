export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"

export async function GET() {
  // This endpoint will help us understand the current form configuration
  return NextResponse.json({
    currentWaitlistEndpoints: ["/api/waitlist", "/api/waitlist-email", "/api/waitlist-simple"],
    formLocation: "/waitlist",
    expectedFormFields: ["name", "email", "phone", "mealPlanPreference", "city", "notifications"],
    databaseExpectedFields: [
      "first_name",
      "last_name",
      "email",
      "phone",
      "preferred_meal_plan",
      "city",
      "wants_notifications",
    ],
    possibleIssues: [
      "Form submitting to wrong endpoint",
      "Field name mismatch between form and database",
      "Database connection issues during event",
      "Form validation preventing submissions",
      "Submissions going to different table",
      "JavaScript errors preventing form submission",
    ],
  })
}

export async function POST(request: Request) {
  // Test endpoint to simulate a form submission
  try {
    const body = await request.json()

    return NextResponse.json({
      received: body,
      timestamp: new Date().toISOString(),
      message: "Test submission received - this would normally be processed",
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to process test submission",
        details: error.message,
      },
      { status: 400 },
    )
  }
}
