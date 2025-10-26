export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { supabase } from "@fitnest/db";

// === CORS helpers ===
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

const PriceSchema = z.object({
  plan: z.string().min(1),
  meals: z.array(z.string().min(1)).min(1),
  days: z.number().min(1).max(7),
  duration: z.number().min(1)
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { plan, meals, days, duration } = PriceSchema.parse(body);

    const { data: mealPrices, error: mealErr } = await supabase
      .from("meal_type_prices")
      .select("meal_type, base_price_mad")
      .eq("plan_name", plan)
      .in("meal_type", meals)
      .eq("is_active", true);

    if (mealErr) throw mealErr;
    if (!mealPrices || mealPrices.length !== meals.length) {
      return NextResponse.json({ error: "Invalid plan or meals" }, { status: 400, headers: corsHeaders });
    }

    const basePerDay = mealPrices.reduce((acc, r) => acc + Number(r.base_price_mad), 0);
    const grossWeekly = basePerDay * days;

    const { data: daysRule, error: daysErr } = await supabase
      .from("discount_rules")
      .select("discount_percentage")
      .eq("discount_type", "days_per_week")
      .lte("condition_value", days)
      .eq("is_active", true)
      .order("condition_value", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (daysErr) throw daysErr;
    const daysPct = daysRule?.discount_percentage ? Number(daysRule.discount_percentage) : 0;

    const { data: durRule, error: durErr } = await supabase
      .from("discount_rules")
      .select("discount_percentage")
      .eq("discount_type", "duration_weeks")
      .lte("condition_value", duration)
      .eq("is_active", true)
      .order("condition_value", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (durErr) throw durErr;
    const durPct = durRule?.discount_percentage ? Number(durRule.discount_percentage) : 0;

    const afterDays = grossWeekly * (1 - daysPct);
    const afterDuration = afterDays * (1 - durPct);
    const total = Math.round(afterDuration * duration * 100) / 100;

    return NextResponse.json({
      basePerDay,
      grossWeekly,
      discounts: { days: daysPct, duration: durPct },
      total,
      breakdown: {
        plan, meals, days,
        mealPrices: mealPrices.map(m => ({ meal: m.meal_type, price: Number(m.base_price_mad) }))
      }
    }, { headers: corsHeaders });
  } catch (e:any) {
    console.error("Price calculation error:", e);
    return NextResponse.json({ error: "Bad Request", detail: String(e?.message || e) }, { status: 400, headers: corsHeaders });
  }
}
