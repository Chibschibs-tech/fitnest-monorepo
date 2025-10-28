// app/api/cart-debug/route.ts
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

export async function GET() {
  try {
    const existsRows = await sql`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'cart_items'
      ) AS exists;
    `;
    const exists = Boolean(existsRows?.[0]?.exists);

    let columns: any[] = [];
    if (exists) {
      columns = await sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'cart_items'
        ORDER BY ordinal_position;
      `;
    }

    return NextResponse.json({ ok: true, table: "cart_items", exists, columns });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
