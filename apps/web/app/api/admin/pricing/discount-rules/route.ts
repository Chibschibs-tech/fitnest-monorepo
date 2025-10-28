export const dynamic = "force-dynamic";
export const revalidate = 0;

import { type NextRequest, NextResponse } from "next/server"
import { sql, db } from "@/lib/db"
import { z } from "zod"


const DiscountRuleSchema = z.object({
  discount_type: z.enum(["duration_weeks", "days_per_week", "special_offer"]),
  condition_value: z.number().min(1, "Condition value must be positive"),
  discount_percentage: z.number().min(0).max(1, "Discount must be between 0 and 1"),
  stackable: z.boolean().optional().default(true),
  is_active: z.boolean().optional().default(true),
  valid_from: z.string().optional(),
  valid_to: z.string().optional(),
})

export async function GET() {
  try {
    const discountRules = await sql`
      SELECT id, discount_type, condition_value, discount_percentage, stackable, is_active, 
             valid_from, valid_to, created_at, updated_at
      FROM discount_rules
      ORDER BY discount_type, condition_value
    `

    return NextResponse.json({ discountRules })
  } catch (error) {
    console.error("Error fetching discount rules:", error)
    return NextResponse.json({ error: "Failed to fetch discount rules" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = DiscountRuleSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input", details: validation.error.errors }, { status: 400 })
    }

    const { discount_type, condition_value, discount_percentage, stackable, is_active, valid_from, valid_to } =
      validation.data

    const result = await sql`
      INSERT INTO discount_rules (discount_type, condition_value, discount_percentage, stackable, is_active, valid_from, valid_to)
      VALUES (${discount_type}, ${condition_value}, ${discount_percentage}, ${stackable}, ${is_active}, 
              ${valid_from || null}, ${valid_to || null})
      RETURNING id, discount_type, condition_value, discount_percentage, stackable, is_active, 
                valid_from, valid_to, created_at, updated_at
    `

    return NextResponse.json({ discountRule: result[0] }, { status: 201 })
  } catch (error) {
    console.error("Error creating discount rule:", error)
    return NextResponse.json({ error: "Failed to create discount rule" }, { status: 500 })
  }
}
