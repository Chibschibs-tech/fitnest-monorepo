// app/api/waitlist/route.ts
import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST() {
  // Désactivée pour le build P0. On la réactive après la mise en ligne.
  return NextResponse.json(
    { ok: false, reason: 'waitlist disabled for preview build' },
    { status: 503 }
  )
}
