// app/api/admin/init-customer-system/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { initCustomersTable, createCustomerProfile } from "@/lib/customer-management";

// Empêche toute évaluation/rendu statique pendant le build
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    // Initialise la table si besoin
    await initCustomersTable();

    // Optionnel : créer un client de test si précisé
    if (body?.seed) {
      const created = await createCustomerProfile({
        userId: body.userId ?? null,
        name: body.name ?? "Guest",
        email: body.email ?? null,
        phone: body.phone ?? null,
        city: body.city ?? null,
      });
      return NextResponse.json({ ok: true, created });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 });
  }
}

// GET pratique pour vérifier depuis le navigateur
export async function GET() {
  try {
    await initCustomersTable();
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 });
  }
}
