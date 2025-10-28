import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getSessionUser } from "@/lib/simple-auth"
import { sql } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST() {
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

    // Create sample customers
    await sql`
      INSERT INTO users (name, email, password, role, created_at) VALUES
      ('Ahmed Hassan', 'ahmed@example.com', 'hashed_password', 'user', NOW() - INTERVAL '30 days'),
      ('Fatima Zahra', 'fatima@example.com', 'hashed_password', 'user', NOW() - INTERVAL '25 days'),
      ('Omar Benali', 'omar@example.com', 'hashed_password', 'user', NOW() - INTERVAL '20 days'),
      ('Aicha Alami', 'aicha@example.com', 'hashed_password', 'user', NOW() - INTERVAL '15 days'),
      ('Youssef Tazi', 'youssef@example.com', 'hashed_password', 'user', NOW() - INTERVAL '10 days')
      ON CONFLICT (email) DO NOTHING
    `

    // Get user IDs
    const users = await sql`SELECT id, email FROM users WHERE role = 'user' LIMIT 5`

    // Create sample orders
    for (const customer of users) {
      await sql`
        INSERT INTO orders (user_id, total_amount, status, created_at) VALUES
        (${customer.id}, ${Math.floor(Math.random() * 2000) + 500}, 'active', NOW() - INTERVAL '${Math.floor(Math.random() * 30)} days'),
        (${customer.id}, ${Math.floor(Math.random() * 1500) + 300}, 'completed', NOW() - INTERVAL '${Math.floor(Math.random() * 60)} days')
        ON CONFLICT DO NOTHING
      `
    }

    // Create sample meals if they don't exist
    await sql`
      INSERT INTO meals (name, description, calories, protein, carbs, fat, price, category, is_available) VALUES
      ('Grilled Chicken & Vegetables', 'Lean protein with seasonal vegetables', 450, 35, 25, 15, 45, 'Protein', true),
      ('Salmon Quinoa Bowl', 'Fresh salmon with quinoa and avocado', 520, 30, 40, 20, 55, 'Balanced', true),
      ('Turkey Meatballs', 'Homemade turkey meatballs with marinara', 380, 28, 20, 18, 40, 'Protein', true),
      ('Vegetable Stir Fry', 'Mixed vegetables with tofu', 320, 15, 35, 12, 35, 'Vegetarian', true),
      ('Beef & Broccoli', 'Lean beef with steamed broccoli', 420, 32, 18, 22, 50, 'Protein', true)
      ON CONFLICT (name) DO NOTHING
    `

    // Add some waitlist entries
    await sql`
      INSERT INTO waitlist (name, email, phone, meal_plan_preference, city, created_at) VALUES
      ('Sara Bennani', 'sara@example.com', '+212600000001', 'Weight Loss', 'Casablanca', NOW() - INTERVAL '5 days'),
      ('Karim Alaoui', 'karim@example.com', '+212600000002', 'Muscle Gain', 'Rabat', NOW() - INTERVAL '3 days'),
      ('Nadia Tazi', 'nadia@example.com', '+212600000003', 'Keto', 'Marrakech', NOW() - INTERVAL '1 day')
      ON CONFLICT (email) DO NOTHING
    `

    return NextResponse.json({
      success: true,
      message: "Sample data created successfully",
    })
  } catch (error) {
    console.error("Error creating sample data:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create sample data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
