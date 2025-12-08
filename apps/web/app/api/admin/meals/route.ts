import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { createErrorResponse } from '@/lib/error-handler'

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const planId = searchParams.get('plan_id')
    
    let meals
    
    if (planId) {
      meals = await sql`
        SELECT m.*, mp.name as plan_name
        FROM meals m
        LEFT JOIN meal_plans mp ON m.plan_id = mp.id
        WHERE m.plan_id = ${planId}
        ORDER BY m.created_at DESC
      `
    } else {
      meals = await sql`
        SELECT m.*, mp.name as plan_name
        FROM meals m
        LEFT JOIN meal_plans mp ON m.plan_id = mp.id
        ORDER BY m.created_at DESC
      `
    }
    
    return NextResponse.json(meals || [])
  } catch (error) {
    return createErrorResponse(error, "Failed to fetch meals", 500)
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, plan_id, meal_type, calories, protein, carbs, fat, image_url } = body
    
    const result = await sql`
      INSERT INTO meals (name, description, plan_id, meal_type, calories, protein, carbs, fat, image_url, created_at)
      VALUES (
        ${name}, 
        ${description || null}, 
        ${plan_id || null}, 
        ${meal_type || null}, 
        ${calories || null}, 
        ${protein || null}, 
        ${carbs || null}, 
        ${fat || null}, 
        ${image_url || null}, 
        NOW()
      )
      RETURNING *
    `
    
    return NextResponse.json(result[0] || result)
  } catch (error) {
    return createErrorResponse(error, "Failed to create meal", 500)
  }
}
