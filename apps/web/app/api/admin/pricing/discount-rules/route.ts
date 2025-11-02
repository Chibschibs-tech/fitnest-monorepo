import { sql } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const discountRules = await sql`
      SELECT id, discount_type, condition_value, discount_percentage, stackable, is_active, valid_from, valid_to, created_at, updated_at 
      FROM discount_rules 
      ORDER BY discount_type, condition_value
    `
    
    return NextResponse.json({
      success: true,
      discountRules: discountRules
    })
  } catch (error) {
    console.error("Error fetching discount rules:", error)
    return NextResponse.json(
      { error: "Failed to fetch discount rules" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { discount_type, condition_value, discount_percentage, stackable, valid_from, valid_to } = body

    if (!discount_type || condition_value === undefined || discount_percentage === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: discount_type, condition_value, discount_percentage" },
        { status: 400 }
      )
    }

    if (discount_percentage < 0 || discount_percentage > 1) {
      return NextResponse.json(
        { error: "discount_percentage must be between 0 and 1 (0.03 = 3%)" },
        { status: 400 }
      )
    }

    if (discount_type === "days_per_week" && ![5, 6, 7].includes(condition_value)) {
      return NextResponse.json(
        { error: "For days_per_week, condition_value must be 5, 6, or 7" },
        { status: 400 }
      )
    }

    if (discount_type === "duration_weeks" && condition_value < 2) {
      return NextResponse.json(
        { error: "For duration_weeks, condition_value must be >= 2" },
        { status: 400 }
      )
    }

    const result = await sql`
      INSERT INTO discount_rules 
        (discount_type, condition_value, discount_percentage, stackable, valid_from, valid_to, is_active, created_at, updated_at)
      VALUES 
        (${discount_type}, ${condition_value}, ${discount_percentage}, ${stackable || true}, ${valid_from || null}, ${valid_to || null}, true, NOW(), NOW())
      RETURNING *
    `

    return NextResponse.json(
      { success: true, data: result[0] },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating discount rule:", error)
    return NextResponse.json(
      { error: "Failed to create discount rule" },
      { status: 500 }
    )
  }
}
