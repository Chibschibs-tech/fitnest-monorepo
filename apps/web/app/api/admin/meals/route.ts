import { NextResponse } from "next/server";
import { q } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/admin/meals?search=...
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = (searchParams.get("search") ?? "").trim();

  const rows = search
    ? await q(
        `select * 
         from meals 
         where name ilike $1 or coalesce(description,'') ilike $1
         order by created_at desc
         limit 200`,
        [`%${search}%`]
      )
    : await q(
        `select * 
         from meals 
         order by created_at desc
         limit 200`
      );

  return NextResponse.json({ rows });
}

// POST /api/admin/meals
export async function POST(req: Request) {
  const body = await req.json();
  const {
    name,
    description = null,
    image_url = null,
    calories = null,
    protein = null,
    carbs = null,
    fat = null,
    price = 0,
  } = body ?? {};

  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  const inserted = await q(
    `insert into meals (name, description, image_url, calories, protein, carbs, fat, price)
     values ($1,$2,$3,$4,$5,$6,$7,$8)
     returning *`,
    [name, description, image_url, calories, protein, carbs, fat, price]
  );

  return NextResponse.json(inserted[0], { status: 201 });
}
