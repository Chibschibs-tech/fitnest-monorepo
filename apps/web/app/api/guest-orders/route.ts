export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"

// Guest checkout closed by founder decision D-052 (2026-09-08);
// customer identity moves to phone+OTP (slice 001).
export async function POST() {
  return NextResponse.json(
    { error: { code: "guest_checkout_closed", message: "La commande sans compte est fermée." } },
    { status: 410 },
  )
}
