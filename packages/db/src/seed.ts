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

async function upsertMealTypePrices() {
  // Le prix d'un jour = somme des prix des types de repas sélectionnés
  // (meal_type_prices est le SEUL moteur de prix).
  const { data: plans, error } = await admin.from("meal_plans").select("id, title, slug");
  if (error) throw error;

  const rows: Array<{
    meal_plan_id: number;
    plan_name: string; // DEPRECATED — rempli pour compat, ne plus lire
    meal_type: string;
    base_price_mad: string;
    is_active: boolean;
  }> = [];

  const defaults: Array<[string, string]> = [
    ["Breakfast", "45.00"],
    ["Lunch", "55.00"],
    ["Dinner", "50.00"],
  ];

  for (const plan of plans ?? []) {
    for (const [mealType, price] of defaults) {
      rows.push({
        meal_plan_id: plan.id,
        plan_name: plan.title,
        meal_type: mealType,
        base_price_mad: price,
        is_active: true,
      });
    }
  }

  if (rows.length) {
    const { error: pErr } = await admin
      .from("meal_type_prices")
      .upsert(rows, { onConflict: "meal_plan_id,meal_type" });
    if (pErr) throw pErr;
  }
}

(async () => {
  try {
    console.log("Seeding meals…");
    await upsertMeals();

    console.log("Seeding meal plans…");
    await upsertMealPlans();

    console.log("Seeding meal type prices…");
    await upsertMealTypePrices();

    console.log("✅ Seed terminé.");
  } catch (e: any) {
    console.error("❌ Seed failed:", e?.message ?? e);
    process.exit(1);
  }
})();
