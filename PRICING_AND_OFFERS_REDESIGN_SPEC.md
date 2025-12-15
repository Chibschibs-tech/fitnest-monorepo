# Pricing & Offers Redesign – Implementation Spec

**Date:** 2025-01-XX  
**Status:** Draft – used as source of truth for upcoming refactors  

## 1. Goal

Unify the pricing and offers system around a **single calculation engine** and a clear data model:

- **Source of truth for price:**  
  MP Category → `meal_type_prices` + `discount_rules` + combination (meal types, days/week, duration).
- **Variants:** Saved **configuration templates + tracking IDs**, *not* the source of pricing truth.
- **Custom combinations:** Always allowed through the calculator (order/subscribe flows).
- **Admin/Marketing:** Use variants and MP Categories to compose and promote offers without touching code.

This spec describes:

1. Current state (summary, only where it impacts pricing/offers).
2. Target model.
3. Concrete implementation steps.

---

## 2. Current State (Summary)

### 2.1 Pricing Engine

Already implemented and documented:

- **Database tables**
  - `meal_type_prices(plan_name, meal_type, base_price_mad, is_active, ...)`
  - `discount_rules(discount_type, condition_value, discount_percentage, stackable, valid_from, valid_to, ...)`
- **Core APIs**
  - `POST /api/calculate-price` (public)
  - `POST /api/admin/pricing/calculate` (admin)
- **Calculator module**
  - `apps/web/lib/pricing-calculator.ts`
    - `calculateSubscriptionPrice(mealPrices, days, duration, discountRules, plan, meals)`
    - Applies `days_per_week` then `duration_weeks` discounts and returns a detailed breakdown.
- **Docs**
  - `apps/web/docs/PRICING_SYSTEM_GUIDE.md`
  - `apps/web/docs/TECHNICAL_BRIEF_FITNEST.md`

### 2.2 Legacy / Parallel Logic

- `apps/web/lib/pricing-model.ts`  
  - Old, in-memory pricing model (no DB) – should be considered **deprecated**.
- `POST /api/calculate-price` (public)  
  - Reimplements a pricing calculation inline instead of using `pricing-calculator.ts`.
- `/subscribe` and `/subscribe/checkout` pages  
  - Expect a response shape `{ basePerDay, grossWeekly, total, ... }` from `/api/calculate-price`, which differs from the newer admin API shape.

### 2.3 Offers & Variants

- **MP Categories**
  - Table `mp_categories` and full admin CRUD UI already exist.
  - Meal plans link to categories via `meal_plans.mp_category_id`.
- **Meal Plans**
  - Admin CRUD implemented (`/admin/products/meal-plans`).
- **Plan Variants**
  - Table `plan_variants` with fields such as:
    - `meal_plan_id`, `label`, `days_per_week`, `meals_per_day`, `weekly_price_mad`, `published`.
  - Admin CRUD implemented:
    - `/admin/products/meal-plans/[id]/variants` endpoints
    - `/admin/products/meal-plans/[id]/meal-plan-detail-content.tsx` for UI.
  - Currently, `weekly_price_mad` is used as a **stored weekly price**, not always tied to the dynamic pricing engine.

### 2.4 Subscription Creation

- **Admin-created subscriptions**
  - `POST /api/admin/customers/[id]/subscriptions/create`
  - Already uses `meal_type_prices` + `discount_rules` to calculate price when possible, then falls back to `plan_variants.weekly_price_mad` as backup.
  - Stores:
    - `subscriptions.plan_variant_id`
    - Calculation details inside `subscriptions.notes` (JSON).
    - Creates an `orders` row and `order_items` entry for auditing.
- **Unified checkout**
  - `POST /api/orders/create-unified`
  - Builds `subscriptions` array from the cart payload:
    - `plan_name`, `meal_types`, `days_per_week`, `duration_weeks`, `total_price`.
  - Currently trusts `total_price` from the frontend instead of recalculating with the pricing engine.

---

## 3. Target Model

### 3.1 Single Source of Truth for Pricing

Price is always computed from:

- **Category / Plan key**
  - For now: `plan_name` as used by `meal_type_prices.plan_name`.
  - Long term: we should standardize this to MP Category slug or a dedicated pricing key.
- **Meal combination**
  - `meal_types[]` (Breakfast/Lunch/Dinner/Snack, extensible).
- **Days / week**
  - Integer 1–7.
- **Duration**
  - Integer ≥ 1 week.
- **Discount rules**
  - Rows from `discount_rules` where `is_active = true` and within valid dates.

All clients (public flows, admin flows, tests) use the **same calculator**.

### 3.2 Role of Variants

Variants are **saved configurations**, not stored prices:

- Fields:
  - `meal_plan_id`
  - `label`
  - `days_per_week`
  - `meals_per_day` (UI help)
  - `meal_types` (array) – if not present yet, will be added / emulated via `variables` or notes
  - `published`
  - Optional: `last_calculated_weekly_price` (cache for display only).
- Behavior:
  - When a customer comes via a variant:
    - System loads variant config (and underlying MP Category / plan name),
    - Runs the calculator to get current price,
    - Creates subscription with:
      - `plan_variant_id`
      - The full combination used
      - The calculator breakdown.
  - When customer builds a custom combo:
    - Same calculator, but `plan_variant_id` can be `NULL`.

### 3.3 Subscription Data

Each subscription should carry:

- `plan_variant_id` (nullable).
- Combination fields (in structured columns or JSON):
  - `meal_types`, `days_per_week`, `duration_weeks`, `category`/`plan_name`.
- Pricing info:
  - `total_price` (final MAD amount).
  - `pricing_breakdown` JSON:
    - `pricePerDay`, `grossWeekly`, `discountsApplied[]`, `finalWeekly`, `durationWeeks`, `totalRoundedMAD`.

Existing `notes` JSON already stores many of these – we will **standardize keys** and reuse it initially, then consider promoting some fields to top-level columns later.

---

## 4. Implementation Plan

### Phase 1 – Unify the Pricing Engine

**Objective:** There must be exactly one pricing calculation algorithm used everywhere.

1. **Refactor `/api/calculate-price` to delegate to `pricing-calculator.ts`.**
   - Replace inline logic with:
     - Validate payload (plan/meal types/days/duration).
     - Fetch `meal_type_prices` and `discount_rules`.
     - Call `calculateSubscriptionPrice(...)`.
   - Decide on response shape for public API:
     - Either:
       - Reuse admin shape `{ success, data: PricingResult }`, or
       - Wrap it for backwards compatibility:
         - e.g. `{ basePerDay, grossWeekly, total, calculation: PricingResult }`.
   - Update `/subscribe` and `/subscribe/checkout` to use the new response shape consistently.

2. **Confirm `/api/admin/pricing/calculate` uses the same module (already true).**
   - Keep as is, just ensure the docs and code comments reference the unified model.

3. **Mark `lib/pricing-model.ts` as deprecated.**
   - Add a big header comment: “DEPRECATED – use `/api/calculate-price` + `pricing-calculator.ts` instead.”
   - Ensure no production code paths rely on it for pricing. If any remain, route them through the API or the shared module.

### Phase 2 – Align Variants with the Calculator

**Objective:** Variants are configuration templates + IDs, not price sources.

1. **Schema / API review for `plan_variants`.**
   - Ensure endpoints:
     - `GET /api/admin/products/meal-plans/[id]/variants`
     - `POST /api/admin/products/meal-plans/[id]/variants`
     - `PUT /api/admin/products/meal-plans/[id]/variants/[variantId]`
   - Clearly document in code comments:
     - `weekly_price_mad` is for **display/cache only** (if kept),
     - Real price is always computed via calculator using `meal_types`, `days_per_week`, and duration.
   - If `meal_types` is not yet present in the DB:
     - Short-term: store it in a JSON `variables`/`config` column or in `notes`.
     - Medium-term: add a proper `meal_types TEXT[]` column with a migration.

2. **Admin UI: show “computed price” instead of “stored price” where relevant.**
   - On meal plan variants page:
     - For each variant, call `/api/admin/pricing/calculate` (or an internal helper) with:
       - category/plan name,
       - variant meal types,
       - days/week,
       - a default duration (e.g. 4 weeks).
     - Display:
       - “Reference: X MAD/week (4 weeks)” as read-only info.
   - Keep a simple numeric input for “Marketing display price” only if really needed (e.g. rounded marketing-friendly number), but note in docs that real backoffice billing uses calculated price.

3. **Subscription creation with variants.**
   - For `POST /api/admin/customers/[id]/subscriptions/create`:
     - Ensure it:
       - Reads variant → determines category/plan name & meal_types.
       - Always calls the unified calculator to get price.
       - Only falls back to `weekly_price_mad` if there is a hard failure (and log it).
     - Standardize `notes` JSON structure to match calculator output keys.

4. **Unified order creation (`/api/orders/create-unified`).**
   - For each subscription entry derived from cart:
     - Instead of trusting `sub.total_price` from the frontend:
       - Derive category/plan name, meal_types, days_per_week, duration_weeks.
       - Call calculator and recompute final total on the server.
       - Store both frontend-reported and server-calculated totals in debug if they differ.

### Phase 3 – Docs & Admin UX for Marketing

**Objective:** Make the system understandable and operable by both devs and Marketing.

1. **Create `OFFER_SYSTEM_FULL_GUIDE.md`.**
   - Structure:
     - **Part 1 – Concepts (shared language)**
       - MP Category, Meal Plan, Variant, Combination, Subscription, Pricing Rule.
     - **Part 2 – Technical View (for devs)**
       - Tables, APIs, calculator algorithm, data flow diagrams.
     - **Part 3 – Operational View (for Marketing/Comms)**
       - How to:
         - Launch a new diet/category.
         - Configure meal type prices & discounts.
         - Create meal plans and variants.
         - Promote variants with URLs / campaigns.
       - Several fully worked examples with numbers.

2. **Update `OFFER_CREATION_PROCESS.md`.**
   - Replace the “two conflicting pricing systems” section with the final decision:
     - “Meal-based pricing with variants as configuration templates.”
   - Add step-by-step “How Marketing should work in the admin” section:
     - Which pages to use in which order.
     - Which fields are safe to change vs. which are technical.

3. **Admin panel copy & helper text.**
   - On `/admin/pricing`:
     - Short description at top: “Here you configure base prices per meal and global discounts. These drive all subscription prices.”
   - On `/admin/products/meal-plans` and variants pages:
     - Explain that variants are “predefined combinations” and that the final price is calculated dynamically.

---

## 5. Non-Goals / Out of Scope (for now)

- Payment gateway integration and recurring billing (handled elsewhere).
- Deep refactor of the legacy `pricing-model.ts` beyond deprecation and documentation.
- Changing the database schema to fully normalize pricing keys to MP Category slug – that can be a follow-up once everything is wired and stable.

---

## 6. Acceptance Criteria

1. **Single calculator**
   - All server-side pricing paths for subscriptions use `pricing-calculator.ts` (directly or via a thin API wrapper).
2. **Consistent responses**
   - `/api/calculate-price` and `/api/admin/pricing/calculate` both expose the same core structure for `PricingResult` (even if wrapped differently).
3. **Variants as config**
   - No code path *requires* `weekly_price_mad` to be accurate for billing; it is at most an optimization/display.
4. **Unified docs**
   - `OFFER_SYSTEM_FULL_GUIDE.md` exists and is referenced from `CONTEXT_FOR_RESUMPTION.md`.
5. **Marketing-ready admin**
   - Pricing and offers sections in the admin include helper text that matches this model.





