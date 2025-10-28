import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/simple-auth"
import { sql, db } from "@/lib/db"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"


export async function GET() {
  try {
    // Get session ID from cookies
    const cookieStore = cookies()
    const sessionId = cookieStore.get("session-id")?.value

    if (!sessionId) {
      return NextResponse.json({ error: "No session found" }, { status: 401 })
    }

    // Use the existing session authentication system
    const user = await getSessionUser(sessionId)

    if (!user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    if (user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Get all waitlist submissions
    const submissions = await sql`
      SELECT * FROM waitlist 
      ORDER BY created_at DESC
    `

    // Convert to CSV
    const headers = ["ID", "Name", "Email", "Phone", "Meal Plan", "City", "Notifications", "Submitted At"]
    const csvRows = [headers.join(",")]

    submissions.forEach((submission: any) => {
      const row = [
        submission.id,
        `"${submission.name}"`,
        `"${submission.email}"`,
        `"${submission.phone || ""}"`,
        `"${submission.meal_plan_preference || ""}"`,
        `"${submission.city || ""}"`,
        submission.notifications ? "Yes" : "No",
        `"${new Date(submission.created_at).toLocaleString()}"`,
      ]
      csvRows.push(row.join(","))
    })

    const csvContent = csvRows.join("\n")

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="waitlist-submissions.csv"',
      },
    })
  } catch (error) {
    console.error("Error exporting waitlist submissions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
