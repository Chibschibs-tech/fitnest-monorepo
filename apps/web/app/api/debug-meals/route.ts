import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {

    const meals = await sql`SELECT id, name, category FROM meals ORDER BY id DESC LIMIT 10`
    const count = await sql`SELECT COUNT(*) as count FROM meals`

    return NextResponse.json({
      success: true,
      totalMeals: count[0].count,
      recentMeals: meals,
    })
  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
