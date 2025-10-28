import { type NextRequest, NextResponse } from "next/server"
import { sql, db } from "@/lib/db"
import { getSessionUser } from "@/lib/simple-auth"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("session-id")?.value
    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getSessionUser(sessionId)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    console.log("Creating subscription tables...")

    // Drop existing tables if they exist to recreate with correct structure
    await sql`DROP TABLE IF EXISTS deliveries CASCADE`
    await sql`DROP TABLE IF EXISTS subscription_plan_items CASCADE`
    await sql`DROP TABLE IF EXISTS active_subscriptions CASCADE`
    await sql`DROP TABLE IF EXISTS subscription_plans CASCADE`

    // Create subscription_plans table
    await sql`
      CREATE TABLE subscription_plans (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id),
        name TEXT NOT NULL,
        description TEXT,
        billing_period TEXT NOT NULL DEFAULT 'weekly',
        billing_interval INTEGER NOT NULL DEFAULT 1,
        price DECIMAL(10,2) NOT NULL,
        trial_period_days INTEGER DEFAULT 0,
        delivery_frequency TEXT NOT NULL DEFAULT 'weekly',
        items_per_delivery INTEGER DEFAULT 1,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create subscription_plan_items table
    await sql`
      CREATE TABLE subscription_plan_items (
        id SERIAL PRIMARY KEY,
        plan_id INTEGER REFERENCES subscription_plans(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER DEFAULT 1,
        is_optional BOOLEAN DEFAULT false,
        additional_price DECIMAL(10,2) DEFAULT 0,
        delivery_week INTEGER,
        delivery_day INTEGER,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create active_subscriptions table
    await sql`
      CREATE TABLE active_subscriptions (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES users(id),
        plan_id INTEGER REFERENCES subscription_plans(id),
        status TEXT DEFAULT 'active',
        start_date DATE DEFAULT CURRENT_DATE,
        next_billing_date DATE,
        next_delivery_date DATE,
        paused_until DATE,
        billing_amount DECIMAL(10,2),
        customizations JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create deliveries table with correct column name
    await sql`
      CREATE TABLE deliveries (
        id SERIAL PRIMARY KEY,
        subscription_id INTEGER REFERENCES active_subscriptions(id),
        order_id INTEGER REFERENCES orders(id),
        status TEXT DEFAULT 'scheduled',
        scheduled_date DATE,
        delivery_window_start TIME,
        delivery_window_end TIME,
        actual_delivery_time TIMESTAMP,
        carrier TEXT,
        tracking_number TEXT,
        delivery_address JSONB,
        delivery_notes TEXT,
        admin_notes TEXT,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        customer_feedback TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create indexes for performance
    await sql`CREATE INDEX idx_subscription_plans_product_id ON subscription_plans(product_id)`
    await sql`CREATE INDEX idx_subscription_plan_items_plan_id ON subscription_plan_items(plan_id)`
    await sql`CREATE INDEX idx_subscription_plan_items_product_id ON subscription_plan_items(product_id)`
    await sql`CREATE INDEX idx_active_subscriptions_customer_id ON active_subscriptions(customer_id)`
    await sql`CREATE INDEX idx_active_subscriptions_plan_id ON active_subscriptions(plan_id)`
    await sql`CREATE INDEX idx_active_subscriptions_status ON active_subscriptions(status)`
    await sql`CREATE INDEX idx_deliveries_subscription_id ON deliveries(subscription_id)`
    await sql`CREATE INDEX idx_deliveries_order_id ON deliveries(order_id)`
    await sql`CREATE INDEX idx_deliveries_status ON deliveries(status)`

    return NextResponse.json({
      success: true,
      message: "Subscription tables created successfully",
      tables: ["subscription_plans", "subscription_plan_items", "active_subscriptions", "deliveries"],
    })
  } catch (error) {
    console.error("Create subscription tables error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
