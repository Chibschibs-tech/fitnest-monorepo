import { NextResponse } from "next/server";
import { q } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/admin/meal-plans/:id/items
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const rows = await q(
    `select i.*, m.name as meal_name
       from meal_plan_items i
       join meals m on m.id = i.meal_id
      where i.meal_plan_id = $1
      order by i.id desc`,
    [params.id]
  );
  return NextResponse.json({ rows });
}

// POST /api/admin/meal-plans/:id/items
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { meal_id, day_of_week = null, slot = null, servings = 1 } = body ?? {};
  if (!meal_id) return NextResponse.json({ error: "meal_id required" }, { status: 400 });

  const inserted = await q(
    `insert into meal_plan_items (meal_plan_id, meal_id, day_of_week, slot, servings)
     values ($1,$2,$3,$4,$5)
     returning *`,
    [params.id, meal_id, day_of_week, slot, servings]
  );

  return NextResponse.json(inserted[0], { status: 201 });
}
