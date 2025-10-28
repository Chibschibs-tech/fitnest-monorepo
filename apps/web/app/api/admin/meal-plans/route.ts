import { NextResponse } from "next/server";
import { q } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/admin/meal-plans
export async function GET() {
  const rows = await q(`select * from meal_plans order by created_at desc limit 200`);
  return NextResponse.json({ rows });
}

// POST /api/admin/meal-plans
export async function POST(req: Request) {
  const body = await req.json();
  const {
    name,
    description = null,
    billing_period = "weekly",
    base_price = 0,
    active = true,
  } = body ?? {};

  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  const inserted = await q(
    `insert into meal_plans (name, description, billing_period, base_price, active)
     values ($1,$2,$3,$4,$5)
     returning *`,
    [name, description, billing_period, base_price, active]
  );

  return NextResponse.json(inserted[0], { status: 201 });
}
