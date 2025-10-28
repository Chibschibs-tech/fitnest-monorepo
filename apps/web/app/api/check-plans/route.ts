import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Check if meal_plans table exists and get available plans
    const plans = await sql`
      SELECT id, name, description, weekly_price 
      FROM meal_plans 
      ORDER BY id
      LIMIT 10
    `

    // Check orders table structure to see plan_id requirements
    const ordersColumns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'orders' AND table_schema = 'public'
      ORDER BY ordinal_position
    `

    return NextResponse.json({
      availablePlans: plans,
      ordersTableStructure: ordersColumns,
      planIdColumn: ordersColumns.find((col: any) => col.column_name === "plan_id"),
      message: "Plan information retrieved",
    })
  } catch (error) {
    console.error("Error checking plans:", error)
    return NextResponse.json(
      {
        error: "Failed to check plans",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
