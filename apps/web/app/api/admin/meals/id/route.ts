import { NextResponse } from "next/server";
import { q } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// PUT /api/admin/meals/:id
export async function PUT(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const body = await _req.json();
  const fields = [
    "name","description","image_url","calories","protein","carbs","fat","price"
  ] as const;

  const updates: string[] = [];
  const values: any[] = [];
  let i = 1;

  for (const f of fields) {
    if (f in body) {
      updates.push(`${f} = $${i++}`);
      values.push(body[f]);
    }
  }
  if (!updates.length) return NextResponse.json({ error: "no changes" }, { status: 400 });

  values.push(params.id);

  const updated = await q(
    `update meals
       set ${updates.join(", ")}, updated_at = now()
     where id = $${i}
     returning *`,
    values
  );

  return NextResponse.json(updated[0] ?? null);
}

// DELETE /api/admin/meals/:id
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await q(`delete from meals where id = $1`, [params.id]);
  return NextResponse.json({ ok: true });
}
