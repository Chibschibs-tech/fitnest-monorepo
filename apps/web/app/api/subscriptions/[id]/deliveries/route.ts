export const dynamic = "force-dynamic"
export const revalidate = 0

import { NextResponse } from "next/server"

// Real deliveries do not exist yet (slice 7). Until they do, this route
// returns an honest empty schedule — never fabricated data (D-027).
// The former "real data" branch read orders.selected_days/selected_weeks,
// columns that do not exist in production; it was dead code, not a fallback.
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const subscriptionId = Number.parseInt(params.id)

  if (isNaN(subscriptionId)) {
    return NextResponse.json({ error: "Invalid subscription ID" }, { status: 400 })
  }

  return NextResponse.json({
    deliveries: [],
    totalDeliveries: 0,
    completedDeliveries: 0,
    pendingDeliveries: 0,
    nextDeliveryDate: null,
    canPause: false,
    pauseEligibleDate: null,
  })
}
