// packages/db/src/seed.ts
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY ?? "";

if (!supabaseUrl || !serviceKey) {
  console.error("Missing SUPABASE URL or SERVICE ROLE KEY in .env");
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

// audiences autorisées (doit matcher le check constraint de la DB)
const AUDIENCES = ["keto", "balanced", "lowcarb", "muscle", "custom", "general"] as const;
type Audience = (typeof AUDIENCES)[number];

async function upsertMeals() {
  const rows = [
    { slug: "chicken-avocado-bowl", title: "Chicken & Avocado Bowl", kcal: 620 },
    { slug: "tofu-buddha-bowl",     title: "Tofu Buddha Bowl",       kcal: 540 },
    { slug: "turkey-sweet-potato",  title: "Turkey & Sweet Potato",  kcal: 580 },
  ];
  const { error } = await admin.from("meals").upsert(rows, { onConflict: "slug" });
  if (error) throw error;
}

async function upsertMealPlans() {
  // mets ici des audiences qui existent dans ton check constraint
  const plans: { slug: string; title: string; audience: Audience; summary?: string }[] = [
    { slug: "keto-classic",          title: "Keto Classic",          audience: "keto",     summary: "Plan kéto classique" },
    { slug: "balanced-essentials",   title: "Balanced Essentials",   audience: "balanced", summary: "Équilibré au quotidien" },
  ];
  const { error } = await admin.from("meal_plans").upsert(plans, { onConflict: "slug" });
  if (error) throw error;
}

async function upsertVariantsAndDays() {
  // Récupérer IDs des plans
  const { data: plans, error } = await admin.from("meal_plans").select("id, slug");
  if (error) throw error;

  const keto = plans?.find(p => p.slug === "keto-classic");
  const bal  = plans?.find(p => p.slug === "balanced-essentials");
  if (!keto || !bal) throw new Error("Meal plans not found after insert");

  // Variants (exemples)
  const variants = [
    { meal_plan_id: keto.id, label: "5 jours • 3 repas/jour", days_per_week: 5, meals_per_day: 3, weekly_base_price_mad: "899.00", published: true },
    { meal_plan_id: bal.id,  label: "5 jours • 2 repas/jour", days_per_week: 5, meals_per_day: 2, weekly_base_price_mad: "749.00", published: true },
  ];
  const { data: insertedVariants, error: vErr } = await admin
    .from("plan_variants")
    .upsert(variants)
    .select("id, meal_plan_id");
  if (vErr) throw vErr;

  // Tous les meals
  const { data: allMeals, error: mErr } = await admin.from("meals").select("id, slug");
  if (mErr) throw mErr;
  const mealIds = (allMeals ?? []).map(m => m.id);
  if (mealIds.length === 0) throw new Error("No meals to assign");

  // Jours * slots => plan_meals
  const planMealsRows: Array<{plan_variant_id:number; day_index:number; slot_index:number; meal_id:number}> = [];
  for (const v of insertedVariants ?? []) {
    const isKeto = v.meal_plan_id === keto.id;
    const days   = 5;
    const perDay = isKeto ? 3 : 2;
    let cursor   = 0;
    for (let d = 0; d < days; d++) {
      for (let s = 0; s < perDay; s++) {
        planMealsRows.push({
          plan_variant_id: v.id,
          day_index: d,
          slot_index: s,
          meal_id: mealIds[cursor % mealIds.length],
        });
        cursor++;
      }
    }
  }

  if (planMealsRows.length) {
    const { error: pmErr } = await admin.from("plan_meals").insert(planMealsRows);
    if (pmErr) throw pmErr;
  }
}

(async () => {
  try {
    console.log("Seeding meals…");
    await upsertMeals();

    console.log("Seeding meal plans…");
    await upsertMealPlans();

    console.log("Seeding variants & plan meals…");
    await upsertVariantsAndDays();

    console.log("✅ Seed terminé.");
  } catch (e: any) {
    console.error("❌ Seed failed:", e?.message ?? e);
    process.exit(1);
  }
})();
