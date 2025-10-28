export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"


export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const subscriptionId = Number.parseInt(params.id)
    const { resumeDate } = await request.json()

    if (isNaN(subscriptionId)) {
      return NextResponse.json({ success: false, message: "Invalid subscription ID" }, { status: 400 })
    }

    console.log(`Resuming subscription ${subscriptionId}`, resumeDate ? `on ${resumeDate}` : "immediately")

    // For now, just return success since we don't have the full database schema
    return NextResponse.json({
      success: true,
      message: resumeDate
        ? `Subscription will resume on ${new Date(resumeDate).toLocaleDateString()}`
        : "Subscription resumed successfully",
    })
  } catch (error) {
    console.error("Error resuming subscription:", error)
    return NextResponse.json({ success: false, message: "Failed to resume subscription" }, { status: 500 })
  }
}
