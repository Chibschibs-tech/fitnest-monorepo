/**
 * Pricing engine regression tests (no test runner required).
 * Run with:  node --experimental-strip-types apps/web/scripts/test-pricing.ts
 *
 * Uses the real production meal prices + discount rules as of 2026-07-16.
 * All current DB discount rules are behavior "best" (single largest applies),
 * backfilled from the legacy stackable=false flag.
 */
import { calculateSubscriptionPrice, type DiscountRule, type MealPrice } from "../lib/pricing-calculator.ts";

const prices: Record<string, MealPrice[]> = {
  "Weight Loss": [
    { meal_type: "Breakfast", base_price_mad: 45 },
    { meal_type: "Lunch", base_price_mad: 55 },
    { meal_type: "Dinner", base_price_mad: 50 },
    { meal_type: "Snack", base_price_mad: 20 },
    { meal_type: "Drink", base_price_mad: 12 },
  ],
  "Muscle Gain": [
    { meal_type: "Breakfast", base_price_mad: 55 },
    { meal_type: "Lunch", base_price_mad: 70 },
    { meal_type: "Dinner", base_price_mad: 65 },
    { meal_type: "Snack", base_price_mad: 25 },
    { meal_type: "Drink", base_price_mad: 15 },
  ],
};
const pick = (plan: string, meals: string[]) => prices[plan].filter((p) => meals.includes(p.meal_type));

const rulesBest: DiscountRule[] = [
  { discount_type: "days", condition_value: 5, discount_percentage: 3, stacking_behavior: "best" },
  { discount_type: "days", condition_value: 6, discount_percentage: 5, stacking_behavior: "best" },
  { discount_type: "days", condition_value: 7, discount_percentage: 7, stacking_behavior: "best" },
  { discount_type: "duration", condition_value: 2, discount_percentage: 5, stacking_behavior: "best" },
  { discount_type: "duration", condition_value: 4, discount_percentage: 10, stacking_behavior: "best" },
  { discount_type: "duration", condition_value: 8, discount_percentage: 15, stacking_behavior: "best" },
  { discount_type: "duration", condition_value: 12, discount_percentage: 20, stacking_behavior: "best" },
];

let pass = 0,
  fail = 0;
function check(name: string, got: number, exp: number) {
  const ok = Math.abs(got - exp) < 0.005;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}: got ${got}  expected ${exp}`);
  ok ? pass++ : fail++;
}

// A: WL B/L/D 5d 4w -> best-of(days5 3%, dur4 10%) = 10% => 750*0.9=675/wk *4 = 2700
{
  const r = calculateSubscriptionPrice(pick("Weight Loss", ["Breakfast", "Lunch", "Dinner"]), 5, 4, rulesBest, "Weight Loss", ["Breakfast", "Lunch", "Dinner"]);
  check("A grossWeekly", r.grossWeekly, 750);
  check("A finalWeekly", r.finalWeekly, 675);
  check("A total", r.totalRoundedMAD, 2700);
}
// B: WL B/L/D 6d 12w -> best-of(5%,20%)=20% => 900*0.8=720 *12 = 8640
{
  const r = calculateSubscriptionPrice(pick("Weight Loss", ["Breakfast", "Lunch", "Dinner"]), 6, 12, rulesBest, "Weight Loss", ["Breakfast", "Lunch", "Dinner"]);
  check("B finalWeekly", r.finalWeekly, 720);
  check("B total", r.totalRoundedMAD, 8640);
}
// C: MG B/L/D/Snack 6d 8w -> 215/day gross 1290; best-of(5%,15%)=15% => 1096.5 *8 = 8772
{
  const r = calculateSubscriptionPrice(pick("Muscle Gain", ["Breakfast", "Lunch", "Dinner", "Snack"]), 6, 8, rulesBest, "Muscle Gain", ["Breakfast", "Lunch", "Dinner", "Snack"]);
  check("C grossWeekly", r.grossWeekly, 1290);
  check("C finalWeekly", r.finalWeekly, 1096.5);
  check("C total", r.totalRoundedMAD, 8772);
}
// D: STACK â€” days5(3%) stacks with dur4(10%): 750*0.97=727.5 then *0.90=654.75 *4 = 2619
{
  const rulesStack: DiscountRule[] = rulesBest.map((x) => (x.discount_type === "days" ? { ...x, stacking_behavior: "stack" as const } : x));
  const r = calculateSubscriptionPrice(pick("Weight Loss", ["Breakfast", "Lunch", "Dinner"]), 5, 4, rulesStack, "Weight Loss", ["Breakfast", "Lunch", "Dinner"]);
  check("D stacked finalWeekly", r.finalWeekly, 654.75);
  check("D stacked total", r.totalRoundedMAD, 2619);
}
// E: EXCLUSIVE â€” a 25% exclusive rule suppresses all others: 750*0.75=562.5 *4 = 2250
{
  const rulesEx: DiscountRule[] = rulesBest.map((x) => (x.discount_type === "duration" && x.condition_value === 4 ? { ...x, discount_percentage: 25, stacking_behavior: "exclusive" as const } : x));
  const r = calculateSubscriptionPrice(pick("Weight Loss", ["Breakfast", "Lunch", "Dinner"]), 5, 4, rulesEx, "Weight Loss", ["Breakfast", "Lunch", "Dinner"]);
  check("E exclusive finalWeekly", r.finalWeekly, 562.5);
  check("E exclusive total", r.totalRoundedMAD, 2250);
}
// F: no discount (3 days, 1 week) -> gross => total 450
{
  const r = calculateSubscriptionPrice(pick("Weight Loss", ["Breakfast", "Lunch", "Dinner"]), 3, 1, rulesBest, "Weight Loss", ["Breakfast", "Lunch", "Dinner"]);
  check("F nodiscount total", r.totalRoundedMAD, 450);
}

// G: plan-card entry prices (lib/plan-pricing.ts baseline: Lunch+Dinner, 5 days, 1 week)
// These are the numbers rendered on /plans, and must equal what checkout charges.
{
  const entry = (plan: string, expPerDay: number, expWeekly: number) => {
    const r = calculateSubscriptionPrice(pick(plan, ["Lunch", "Dinner"]), 5, 1, rulesBest, plan, ["Lunch", "Dinner"]);
    check(`G ${plan} entry perDay`, r.pricePerDay, expPerDay);
    check(`G ${plan} entry weekly`, r.finalWeekly, expWeekly);
  };
  // Weight Loss  55+50=105/day x5 = 525, days5 -3% => 509.25
  entry("Weight Loss", 105, 509.25);
  // Muscle Gain  70+65=135/day x5 = 675, days5 -3% => 654.75
  entry("Muscle Gain", 135, 654.75);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
