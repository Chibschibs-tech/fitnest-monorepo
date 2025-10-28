// app/api/import-meals-direct/route.ts
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function POST() {
  // Cette route d'import n'est pas nécessaire pour le P0.
  // On la désactive proprement pour éviter un crash au build.
  return NextResponse.json({ ok: false, reason: 'import disabled for preview' }, { status: 503 });
}

// Si tu veux la réactiver plus tard, on mettra la logique d'import ici en appelant neon()
// *à l’intérieur* du handler et pas au top-level.

