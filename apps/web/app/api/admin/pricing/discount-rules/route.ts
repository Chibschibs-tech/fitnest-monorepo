import { sql } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

// Discount rules are stored with:
//   discount_type       "days" | "duration"
//   discount_percentage WHOLE percent (5 = 5%)
//   stacking_behavior   "best" | "stack" | "exclusive"
const TYPE_MAP: Record<string, string> = {
  days: "days",
  days_per_week: "days",
  duration: "duration",
  duration_weeks: "duration",
}
const BEHAVIORS = ["stack", "exclusive", "best"]

export async function GET() {
  try {
    const discountRules = await sql`
      SELECT id, discount_type, condition_value, discount_percentage, stackable, stacking_behavior,
             is_active, valid_from, valid_to, created_at, updated_at
      FROM discount_rules
      ORDER BY discount_type, condition_value
    `

    return NextResponse.json({ success: true, discountRules })
  } catch (error) {
    console.error("Error fetching discount rules:", error)
    return NextResponse.json({ error: "Failed to fetch discount rules" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { condition_value, discount_percentage, stacking_behavior, valid_from, valid_to } = body

    if (!body.discount_type || condition_value === undefined || discount_percentage === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: discount_type, condition_value, discount_percentage" },
        { status: 400 },
      )
    }

    const discount_type = TYPE_MAP[String(body.discount_type).toLowerCase()]
    if (!discount_type) {
      return NextResponse.json({ error: "discount_type must be days or duration" }, { status: 400 })
    }

    if (discount_percentage < 0 || discount_percentage > 100) {
      return NextResponse.json(
        { error: "discount_percentage must be between 0 and 100 (5 = 5 percent)" },
        { status: 400 },
      )
    }

    const behavior = stacking_behavior || "best"
    if (!BEHAVIORS.includes(behavior)) {
      return NextResponse.json(
        { error: "stacking_behavior must be stack, exclusive or best" },
        { status: 400 },
      )
    }

    if (discount_type === "days" && ![5, 6, 7].includes(condition_value)) {
      return NextResponse.json({ error: "For days, condition_value must be 5, 6 or 7" }, { status: 400 })
    }

    if (discount_type === "duration" && condition_value < 2) {
      return NextResponse.json({ error: "For duration, condition_value must be 2 or more" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO discount_rules
        (discount_type, condition_value, discount_percentage, stackable, stacking_behavior,
         valid_from, valid_to, is_active, created_at, updated_at)
      VALUES
        (${discount_type}, ${condition_value}, ${discount_percentage}, ${behavior === "stack"}, ${behavior},
         ${valid_from || null}, ${valid_to || null}, true, NOW(), NOW())
      RETURNING *
    `

    return NextResponse.json({ success: true, data: result[0] }, { status: 201 })
  } catch (error) {
    console.error("Error creating discount rule:", error)
    return NextResponse.json({ error: "Failed to create discount rule" }, { status: 500 })
  }
}
