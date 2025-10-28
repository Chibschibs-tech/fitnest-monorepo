export const dynamic = "force-dynamic";
export const revalidate = 0;

import { sql, db } from "@/lib/db"
import { NextResponse } from "next/server"


export async function POST() {
  try {
    // Add pause-related columns to orders table
    await sql`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS pause_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS paused_at TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS pause_duration_days INTEGER NULL,
      ADD COLUMN IF NOT EXISTS original_end_date DATE NULL,
      ADD COLUMN IF NOT EXISTS extended_end_date DATE NULL,
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'
    `

    // Create deliveries table
    await sql`
      CREATE TABLE IF NOT EXISTS deliveries (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        scheduled_date DATE NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        delivered_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_deliveries_order_id ON deliveries(order_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_deliveries_scheduled_date ON deliveries(scheduled_date)`
    await sql`CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status)`
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`

    // Update existing orders to have active status
    await sql`UPDATE orders SET status = 'active' WHERE status IS NULL`

    return NextResponse.json({
      success: true,
      message: "Delivery schema initialized successfully",
    })
  } catch (error) {
    console.error("Error initializing delivery schema:", error)
    return NextResponse.json({ success: false, message: "Failed to initialize delivery schema" }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Check if schema exists
    const tablesResult = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('orders', 'deliveries')
    `

    const columnsResult = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'orders' 
      AND column_name IN ('pause_count', 'paused_at', 'status')
    `

    return NextResponse.json({
      success: true,
      tables: tablesResult,
      columns: columnsResult,
      schemaExists: tablesResult.length === 2 && columnsResult.length === 3,
    })
  } catch (error) {
    console.error("Error checking delivery schema:", error)
    return NextResponse.json({ success: false, message: "Failed to check delivery schema" }, { status: 500 })
  }
}
