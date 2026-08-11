import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { createErrorResponse } from "@/lib/error-handler";
import {
  computeSubscriptionPriceByPlanTitle,
  PricingError,
} from "@/lib/subscription-pricing";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const b = await req.json();

    // Validation minimaliste
    if (!b.full_name || !b.email || !b.phone) {
      return NextResponse.json(
        { error: "Merci de renseigner nom, email et téléphone." },
        { status: 400 }
      );
    }

    if (!b.plan || !Array.isArray(b.meals) || b.meals.length === 0 || !b.days || !b.duration) {
      return NextResponse.json(
        { error: "Configuration incomplète : plan, meals, days et duration sont requis." },
        { status: 400 }
      );
    }

    // The billed amount is ALWAYS recomputed server-side by the single pricing
    // function. The client-provided total is only used to detect drift.
    let price;
    try {
      price = await computeSubscriptionPriceByPlanTitle(b.plan, {
        mealTypes: b.meals,
        daysPerWeek: Number(b.days),
        durationWeeks: Number(b.duration),
      });
    } catch (err) {
      if (err instanceof PricingError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      throw err;
    }

    if (b.total != null && Math.abs(Number(b.total) - price.total) > 0.01) {
      console.warn(
        `Checkout total mismatch for "${b.plan}": client sent ${b.total}, server computed ${price.total}. Server value stored.`
      );
    }

    // Ensure subscription_requests table exists
    await sql`
      CREATE TABLE IF NOT EXISTS subscription_requests (
        id SERIAL PRIMARY KEY,
        plan VARCHAR(100),
        meals TEXT[],
        days INTEGER,
        duration INTEGER,
        total NUMERIC(10,2),
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        note TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // Insert lead with the server-computed total
    await sql`
      INSERT INTO subscription_requests (
        plan, meals, days, duration, total, 
        full_name, email, phone, note
      )
      VALUES (
        ${b.plan},
        ${b.meals},
        ${Number(b.days)},
        ${Number(b.duration)},
        ${price.total},
        ${b.full_name},
        ${b.email},
        ${b.phone},
        ${b.note || null}
      )
    `;

    return NextResponse.json({ ok: true, total: price.total });
  } catch (e: any) {
    return createErrorResponse(
      e,
      e?.message || "Erreur lors de l'enregistrement de la demande",
      500
    );
  }
}
