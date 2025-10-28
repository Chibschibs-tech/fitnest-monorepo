import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST() {
  return NextResponse.json(
    { ok: false, reason: 'import disabled for preview build' },
    { status: 503 }
  )
}
