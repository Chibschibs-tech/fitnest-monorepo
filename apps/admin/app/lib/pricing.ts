// apps/admin/lib/pricing.ts

/**
 * Fitnest Pricing Engine (v1)
 * - Duration rules: 1w / 2w / 1m
 * - Minimum required days should be enforced by caller (UI).
 * - Baseline & proration are configurable to match the pricing guide.
 *
 * Design goals:
 * - Pure, deterministic: no IO.
 * - Extensible hooks for discounts (promos, loyalty, seasonal).
 */

export type DurationKey = "1w" | "2w" | "1m";

export type PricingInput = {
  weeklyBaseMAD: number;      // variant.weekly_base_price_mad
  duration: DurationKey;      // "1w" | "2w" | "1m"
  selectedDays: number;       // number of chosen delivery days
};

export type PricingLine = { label: string; amount: number };
export type PricingOutput = {
  subtotal: number;           // before discounts
  discounts: PricingLine[];   // negative amounts
  total: number;              // after discounts
  breakdown: PricingLine[];   // explanatory lines (non-negative)
};

// -------------------- CONFIG --------------------
//
// IMPORTANT: Tweak these constants to mirror your PRICING_SYSTEM_GUIDE.md.
//
// We treat the weekly price as covering `BASELINE_DAYS_PER_WEEK` deliveries.
// The subtotal is prorated by how many days the customer actually selects.
//
const BASELINE_DAYS_PER_WEEK = 5;

// How many base weeks per duration
const DURATION_WEEKS: Record<DurationKey, number> = {
  "1w": 1,
  "2w": 2,
  "1m": 4, // treat "1 month" as 4 weeks for pricing
};

// Duration discounts (set to 0 initially; tune to your policy)
const DURATION_DISCOUNT: Record<DurationKey, number> = {
  "1w": 0.0,   // 0%
  "2w": 0.0,   // 0%
  "1m": 0.0,   // 0%
};

// Seasonal / Demand multiplier (1.0 = no change)
function seasonalMultiplier(/* dateWindow?: {start: Date; end: Date} */): number {
  return 1.0;
}

// Loyalty or promo hooks — return negative amounts as discounts.
// (right now they are inert; wire them when you’re ready)
function loyaltyDiscount(_input: PricingInput, _base: number): number {
  return 0;
}
function promoDiscount(
  _input: PricingInput,
  _base: number,
  _code?: string
): number {
  return 0;
}

// -------------------- ENGINE --------------------

export function computePrice(input: PricingInput, opts?: { promoCode?: string }): PricingOutput {
  const { weeklyBaseMAD, duration, selectedDays } = input;
  const weeks = DURATION_WEEKS[duration];

  // baseline for the duration (no proration yet)
  const baseline = weeklyBaseMAD * weeks;

  // prorate by selected days vs baseline coverage
  const baselineCoverage = weeks * BASELINE_DAYS_PER_WEEK;
  const prorationFactor = baselineCoverage > 0 ? selectedDays / baselineCoverage : 0;

  // apply seasonal factor to baseline before discounts
  const seasonFactor = seasonalMultiplier();
  const prorated = Math.max(0, Math.round(baseline * prorationFactor * seasonFactor));

  // duration-level discount (percentage on prorated)
  const durationDiscPct = DURATION_DISCOUNT[duration] ?? 0;
  const durationDisc = -Math.round(prorated * durationDiscPct);

  // other discounts
  const loyaltyDisc = loyaltyDiscount(input, prorated + durationDisc);
  const promoDisc = promoDiscount(input, prorated + durationDisc + loyaltyDisc, opts?.promoCode);

  const discounts: PricingLine[] = [];
  if (durationDisc !== 0) discounts.push({ label: "Remise durée", amount: durationDisc });
  if (loyaltyDisc !== 0) discounts.push({ label: "Remise fidélité", amount: loyaltyDisc });
  if (promoDisc !== 0) discounts.push({ label: "Code promo", amount: promoDisc });

  const subtotal = prorated;
  const totalDiscount = discounts.reduce((s, d) => s + d.amount, 0);
  const total = Math.max(0, subtotal + totalDiscount);

  const breakdown: PricingLine[] = [
    { label: `Base ${weeks} sem.`, amount: weeklyBaseMAD * weeks },
    { label: `Prorata (${selectedDays}/${baselineCoverage} j)`, amount: subtotal },
  ];

  return { subtotal, discounts, total, breakdown };
}
