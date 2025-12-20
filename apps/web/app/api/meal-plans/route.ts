import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const mealPlans = await sql`
      SELECT 
        mp.id,
        mp.title as name,
        mp.summary as description,
        COALESCE(mpc.name, mp.audience) as category,
        mp.published as is_active
      FROM meal_plans mp
      LEFT JOIN mp_categories mpc ON mp.mp_category_id = mpc.id
      WHERE mp.published = true
      ORDER BY mp.created_at ASC
    `

    return NextResponse.json({
      success: true,
      mealPlans: mealPlans.map((plan: any) => ({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        category: plan.category || 'balanced',
        is_active: plan.is_active,
      })),
    })
  } catch (error) {
    console.error("Error fetching meal plans:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch meal plans",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
