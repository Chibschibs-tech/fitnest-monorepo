import { NextResponse } from "next/server"
import { getPlanEntryPrices } from "@/lib/plan-pricing"

export const dynamic = "force-dynamic"

/**
 * Public entry ("à partir de") prices for the homepage plan cards.
 * Same engine as /plans and checkout, so the homepage can never show a
 * number the customer will not actually pay.
 */
const PLAN_KEYS = ["Weight Loss", "Stay Fit", "Muscle Gain"]

export async function GET() {
  try {
    const prices = await getPlanEntryPrices(PLAN_KEYS)
    return NextResponse.json({ success: true, prices })
  } catch (error) {
    console.error("plan-entry-prices error:", error)
    // Never take the homepage down over pricing; it falls back to defaults.
    return NextResponse.json({ success: false, prices: {} })
  }
}
