import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/simple-auth"
import { sql, db } from "@/lib/db"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"


export async function GET() {
  try {
    // Check authentication
    const cookieStore = cookies()
    const sessionId = cookieStore.get("session-id")?.value

    if (!sessionId) {
      return NextResponse.json({ error: "No session found" }, { status: 401 })
    }

    const user = await getSessionUser(sessionId)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Check ALL tables that might contain waitlist data
    const allTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `

    // Check the main waitlist table
    let waitlistData = []
    try {
      waitlistData = await sql`
        SELECT *, 
               DATE(created_at) as submission_date,
               COUNT(*) OVER() as total_count
        FROM waitlist 
        ORDER BY created_at DESC
      `
    } catch (error) {
      console.log("Error getting waitlist data:", error.message)
    }

    // Check for waitlist_entries table
    let waitlistEntriesData = []
    try {
      waitlistEntriesData = await sql`
        SELECT *, 
               DATE(created_at) as submission_date
        FROM waitlist_entries 
        ORDER BY created_at DESC
      `
    } catch (error) {
      console.log("waitlist_entries table doesn't exist")
    }

    // Check for any other potential waitlist tables
    let waitlistSignupsData = []
    try {
      waitlistSignupsData = await sql`
        SELECT *, 
               DATE(created_at) as submission_date
        FROM waitlist_signups 
        ORDER BY created_at DESC
      `
    } catch (error) {
      console.log("waitlist_signups table doesn't exist")
    }

    // Check for contact forms or general submissions
    let contactFormsData = []
    try {
      contactFormsData = await sql`
        SELECT *, 
               DATE(created_at) as submission_date
        FROM contact_forms 
        ORDER BY created_at DESC
        LIMIT 20
      `
    } catch (error) {
      console.log("contact_forms table doesn't exist")
    }

    // Check for form_submissions table
    let formSubmissionsData = []
    try {
      formSubmissionsData = await sql`
        SELECT *, 
               DATE(created_at) as submission_date
        FROM form_submissions 
        ORDER BY created_at DESC
        LIMIT 20
      `
    } catch (error) {
      console.log("form_submissions table doesn't exist")
    }

    // Get submissions by date to see patterns
    let submissionsByDate = []
    try {
      submissionsByDate = await sql`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM waitlist 
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 10
      `
    } catch (error) {
      console.log("Error getting submissions by date")
    }

    // Check recent database activity (last 7 days)
    let recentActivity = []
    try {
      recentActivity = await sql`
        SELECT *
        FROM waitlist 
        WHERE created_at >= NOW() - INTERVAL '7 days'
        ORDER BY created_at DESC
      `
    } catch (error) {
      console.log("Error getting recent activity")
    }

    return NextResponse.json({
      allTables: allTables.map((t) => t.table_name),
      waitlistData: {
        count: waitlistData.length,
        data: waitlistData,
        latestSubmission: waitlistData[0] || null,
      },
      waitlistEntriesData: {
        count: waitlistEntriesData.length,
        data: waitlistEntriesData,
        latestSubmission: waitlistEntriesData[0] || null,
      },
      waitlistSignupsData: {
        count: waitlistSignupsData.length,
        data: waitlistSignupsData,
        latestSubmission: waitlistSignupsData[0] || null,
      },
      contactFormsData: {
        count: contactFormsData.length,
        data: contactFormsData.slice(0, 5), // Only show first 5
      },
      formSubmissionsData: {
        count: formSubmissionsData.length,
        data: formSubmissionsData.slice(0, 5), // Only show first 5
      },
      submissionsByDate,
      recentActivity: {
        count: recentActivity.length,
        data: recentActivity,
      },
      summary: {
        totalWaitlistSubmissions: waitlistData.length,
        totalWaitlistEntries: waitlistEntriesData.length,
        totalWaitlistSignups: waitlistSignupsData.length,
        recentSubmissions: recentActivity.length,
        latestSubmissionDate: waitlistData[0]?.created_at || null,
      },
    })
  } catch (error) {
    console.error("Comprehensive waitlist debug error:", error)
    return NextResponse.json(
      {
        error: "Comprehensive debug failed",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
