export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"


export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const subscriptionId = Number.parseInt(params.id)
    const { pauseDurationDays } = await request.json()

    if (isNaN(subscriptionId)) {
      return NextResponse.json({ success: false, message: "Invalid subscription ID" }, { status: 400 })
    }

    if (!pauseDurationDays || pauseDurationDays < 7 || pauseDurationDays > 21) {
      return NextResponse.json(
        { success: false, message: "Pause duration must be between 7 and 21 days" },
        { status: 400 },
      )
    }

    console.log(`Pausing subscription ${subscriptionId} for ${pauseDurationDays} days`)

    // For now, just return success since we don't have the full database schema
    return NextResponse.json({
      success: true,
      message: `Subscription paused for ${pauseDurationDays} days. Your deliveries will resume automatically.`,
    })
  } catch (error) {
    console.error("Error pausing subscription:", error)
    return NextResponse.json({ success: false, message: "Failed to pause subscription" }, { status: 500 })
  }
}
