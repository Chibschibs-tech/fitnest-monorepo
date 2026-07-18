import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export const dynamic = "force-dynamic"

const NEED_TYPES = ["event", "daily", "both"]
const HEADCOUNTS = ["10-20", "20-50", "50+"]

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

/**
 * Public B2B lead capture for /entreprises (FitNest Events + FitNest Corporate).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const fullName = String(body.fullName || "").trim()
    const company = String(body.company || "").trim()
    const jobRole = String(body.jobRole || "").trim()
    const email = String(body.email || "").trim()
    const phone = String(body.phone || "").trim()
    const needType = String(body.needType || "").trim()
    const headcount = String(body.headcount || "").trim()
    const eventDate = body.eventDate ? String(body.eventDate) : null
    const message = String(body.message || "").trim()

    if (!fullName || !company || !email || !phone) {
      return NextResponse.json(
        { error: "Nom, entreprise, email et telephone sont obligatoires." },
        { status: 400 },
      )
    }

    if (!isEmail(email)) {
      return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 })
    }

    if (!NEED_TYPES.includes(needType)) {
      return NextResponse.json({ error: "Type de besoin invalide." }, { status: 400 })
    }

    if (headcount && !HEADCOUNTS.includes(headcount)) {
      return NextResponse.json({ error: "Nombre de personnes invalide." }, { status: 400 })
    }

    await sql`
      INSERT INTO company_leads
        (full_name, company, job_role, email, phone, need_type, headcount, event_date, message)
      VALUES
        (${fullName}, ${company}, ${jobRole || null}, ${email}, ${phone}, ${needType},
         ${headcount || null}, ${eventDate || null}, ${message || null})
    `

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error("Error saving company lead:", error)
    return NextResponse.json({ error: "Impossible d'enregistrer votre demande." }, { status: 500 })
  }
}
