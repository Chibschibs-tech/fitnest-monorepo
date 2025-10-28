export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    console.log("Testing database connection...")
    console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL)

    // Test basic connection
    const result = await sql`SELECT NOW() as current_time`
    console.log("Database connection test result:", result)

    // Test if meals table exists
    const tableCheck = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'meals'
    `
    console.log("Meals table exists:", tableCheck)

    // Count meals in the table
    const mealCount = await sql`SELECT COUNT(*) as count FROM meals`
    console.log("Total meals in database:", mealCount)

    // Get first few meals
    const sampleMeals = await sql`SELECT id, name, meal_type, is_active FROM meals LIMIT 3`
    console.log("Sample meals:", sampleMeals)

    return NextResponse.json({
      success: true,
      connection: result,
      tableExists: tableCheck.length > 0,
      mealCount: mealCount[0]?.count || 0,
      sampleMeals,
    })
  } catch (error) {
    console.error("Database test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
