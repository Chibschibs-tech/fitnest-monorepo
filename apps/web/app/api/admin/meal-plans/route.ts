import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSessionUser } from '@/lib/simple-auth'
import { sql } from '@/lib/db'
import { createErrorResponse } from '@/lib/error-handler'

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const cookieStore = cookies()
    const sessionId = cookieStore.get("session-id")?.value
    if (!sessionId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    const user = await getSessionUser(sessionId)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const mealPlans = await sql`
      SELECT * 
      FROM meal_plans 
      ORDER BY display_order ASC, id ASC
    `
    return NextResponse.json(mealPlans || [])
  } catch (error) {
    return createErrorResponse(error, "Failed to fetch meal plans", 500)
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const sessionId = cookieStore.get("session-id")?.value
    if (!sessionId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    const user = await getSessionUser(sessionId)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, display_order, is_active } = body
    
    const result = await sql`
      INSERT INTO meal_plans (name, description, display_order, is_active, created_at)
      VALUES (${name}, ${description || null}, ${display_order || 0}, ${is_active ?? true}, NOW())
      RETURNING *
    `
    
    return NextResponse.json(result[0] || result)
  } catch (error) {
    return createErrorResponse(error, "Failed to create meal plan", 500)
  }
}
