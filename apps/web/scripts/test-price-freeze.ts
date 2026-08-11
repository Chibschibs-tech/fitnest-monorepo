/**
 * Integration test — the price FROZEN on a subscription must not change when
 * meal_type_prices is modified afterwards.
 *
 * Run with a database that has the 0002_single_pricing_engine migration:
 *   DATABASE_URL=postgres://... node --experimental-strip-types apps/web/scripts/test-price-freeze.ts
 *
 * The script creates a throwaway meal plan / prices / user / subscription,
 * doubles the tariffs, and verifies the stored subscription amounts did not
 * move. Everything it creates is deleted in the cleanup phase.
 */
import { Pool } from "pg";
import {
  calculateSubscriptionPrice,
  type DiscountRule,
  type MealPrice,
} from "../../../packages/core/src/pricing-calculator.ts";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const pool = new Pool({
  connectionString: url,
  ssl: url.includes("supabase.com") || url.includes("neon.tech")
    ? { rejectUnauthorized: false }
    : undefined,
});

let pass = 0,
  fail = 0;
function check(name: string, ok: boolean, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `: ${detail}` : ""}`);
  ok ? pass++ : fail++;
}

/**
 * Same data access as apps/web/lib/subscription-pricing.ts, same core engine.
 * Duplicated here only because this standalone script cannot import Next.js
 * aliased modules under plain node.
 */
async function computePrice(
  mealPlanId: number,
  mealTypes: string[],
  daysPerWeek: number,
  durationWeeks: number,
) {
  const { rows: planRows } = await pool.query(
    "SELECT id, title FROM meal_plans WHERE id = $1",
    [mealPlanId],
  );
  if (planRows.length === 0) throw new Error(`Meal plan ${mealPlanId} not found`);

  const { rows: priceRows } = await pool.query(
    "SELECT meal_type, base_price_mad FROM meal_type_prices WHERE meal_plan_id = $1 AND is_active = true",
    [mealPlanId],
  );
  const priceMap = new Map(
    priceRows.map((r: any) => [String(r.meal_type).toLowerCase(), r]),
  );
  const mealPrices: MealPrice[] = mealTypes.map((m) => {
    const row = priceMap.get(m.toLowerCase());
    if (!row) throw new Error(`No price for meal type ${m}`);
    return { meal_type: row.meal_type, base_price_mad: row.base_price_mad };
  });

  const { rows: discountRules } = await pool.query(
    `SELECT discount_type, condition_value, discount_percentage, stackable, stacking_behavior
     FROM discount_rules
     WHERE is_active = true
       AND (valid_from IS NULL OR valid_from <= NOW())
       AND (valid_to IS NULL OR valid_to >= NOW())`,
  );

  const calc = calculateSubscriptionPrice(
    mealPrices,
    daysPerWeek,
    durationWeeks,
    discountRules as DiscountRule[],
    planRows[0].title,
    mealTypes,
  );

  const round2 = (n: number) => Math.round(n * 100) / 100;
  const subtotal = round2(calc.grossWeekly * durationWeeks);
  const total = calc.totalRoundedMAD;
  return {
    pricePerDay: calc.pricePerDay,
    subtotal,
    discountPercentage: subtotal > 0 ? round2(((subtotal - total) / subtotal) * 100) : 0,
    total,
  };
}

const MEAL_TYPES = ["Lunch", "Dinner"];
const DAYS = 5;
const WEEKS = 6;

(async () => {
  const stamp = Date.now();
  let planId: number | null = null;
  let userId: number | null = null;
  let subscriptionId: number | null = null;

  try {
    // --- Setup: throwaway plan + tariffs -----------------------------------
    const { rows: planRows } = await pool.query(
      `INSERT INTO meal_plans (slug, title, summary, published)
       VALUES ($1, $2, 'price-freeze test plan', false)
       RETURNING id`,
      [`test-price-freeze-${stamp}`, `Test Price Freeze ${stamp}`],
    );
    planId = planRows[0].id;

    await pool.query(
      `INSERT INTO meal_type_prices (meal_plan_id, plan_name, meal_type, base_price_mad, is_active)
       VALUES ($1, $2, 'Lunch', 70, true), ($1, $2, 'Dinner', 65, true)`,
      [planId, `Test Price Freeze ${stamp}`],
    );

    // --- 1. Price at signup --------------------------------------------------
    const p1 = await computePrice(planId!, MEAL_TYPES, DAYS, WEEKS);
    console.log(
      `Signup price: ${p1.pricePerDay}/day, subtotal ${p1.subtotal}, -${p1.discountPercentage}% => total ${p1.total}`,
    );

    // --- 2. Subscription with FROZEN price (same insert as the API routes) ---
    const { rows: userRows } = await pool.query(
      `INSERT INTO users (email, name, password, role)
       VALUES ($1, 'Price Freeze Test', 'not-a-real-password', 'customer')
       RETURNING id`,
      [`test-price-freeze-${stamp}@example.invalid`],
    );
    userId = userRows[0].id;

    const { rows: subRows } = await pool.query(
      `INSERT INTO subscriptions (
         user_id, meal_plan_id, meal_types, days_per_week, duration_weeks,
         price_per_day_mad, discount_percentage, total_mad, status, starts_at, renews_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active', NOW(), NOW() + interval '6 weeks')
       RETURNING id`,
      [userId, planId, MEAL_TYPES, DAYS, WEEKS, p1.pricePerDay, p1.discountPercentage, p1.total],
    );
    subscriptionId = subRows[0].id;

    // --- 3. Tariff change AFTER signup ---------------------------------------
    await pool.query(
      "UPDATE meal_type_prices SET base_price_mad = base_price_mad * 2 WHERE meal_plan_id = $1",
      [planId],
    );

    const p2 = await computePrice(planId!, MEAL_TYPES, DAYS, WEEKS);
    console.log(`Price after tariff change: total ${p2.total}`);
    check(
      "new signups get the new price",
      p2.total !== p1.total,
      `before ${p1.total}, after ${p2.total}`,
    );

    // --- 4. The frozen subscription did NOT move -----------------------------
    const { rows: frozen } = await pool.query(
      `SELECT price_per_day_mad, discount_percentage, total_mad
       FROM subscriptions WHERE id = $1`,
      [subscriptionId],
    );
    const f = frozen[0];
    check(
      "frozen price_per_day_mad unchanged",
      Number(f.price_per_day_mad) === p1.pricePerDay,
      `stored ${f.price_per_day_mad}, expected ${p1.pricePerDay}`,
    );
    check(
      "frozen discount_percentage unchanged",
      Number(f.discount_percentage) === p1.discountPercentage,
      `stored ${f.discount_percentage}, expected ${p1.discountPercentage}`,
    );
    check(
      "frozen total_mad unchanged",
      Number(f.total_mad) === p1.total,
      `stored ${f.total_mad}, expected ${p1.total}`,
    );
    check(
      "frozen total differs from the new tariff",
      Number(f.total_mad) !== p2.total,
      `stored ${f.total_mad}, new tariff ${p2.total}`,
    );
  } catch (e: any) {
    console.error("Test failed with error:", e?.message ?? e);
    fail++;
  } finally {
    // --- Cleanup --------------------------------------------------------------
    try {
      if (subscriptionId) await pool.query("DELETE FROM subscriptions WHERE id = $1", [subscriptionId]);
      if (userId) await pool.query("DELETE FROM users WHERE id = $1", [userId]);
      if (planId) {
        await pool.query("DELETE FROM meal_type_prices WHERE meal_plan_id = $1", [planId]);
        await pool.query("DELETE FROM meal_plans WHERE id = $1", [planId]);
      }
    } catch (cleanupError: any) {
      console.error("Cleanup failed:", cleanupError?.message ?? cleanupError);
    }
    await pool.end();
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
