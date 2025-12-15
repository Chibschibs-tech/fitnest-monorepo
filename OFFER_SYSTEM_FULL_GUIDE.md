# Offer System – Full Guide (Tech + Marketing)

**Date:** 2025-01-XX  
**Audience:** Tech team, Marketing, Communication  

---

## 1. Big Picture (Non‑Technical)

FitNest offers **meal subscriptions** built from three layers:

1. **Diet Category (MP Category)** – e.g. *Keto*, *Balanced*, *Muscle Gain*  
   - Defines the **nutrition philosophy** and **base prices per meal type**.
2. **Meal Plan** – e.g. *Keto Classic*, *Balanced Weekly*  
   - A branded product under a category (copy, visuals, positioning).
3. **Variant** – e.g. *5 days • 3 meals/day*  
   - A **ready-made package**: which meals per day, how many days per week.

The **price is always calculated dynamically** from:

- The **category’s meal prices** (Breakfast/Lunch/Dinner/Snack).
- The **combination** (meal types, days per week, duration).
- The **discount rules** (days/week and duration).

Variants are **saved templates** and **tracking IDs** for marketing, not hard‑coded prices.

---

## 2. Core Concepts

### 2.1 MP Category (Diet)

- Examples: **Keto**, **Low Carb**, **Balanced**, **Muscle Gain**, **Custom**.
- Stored in `mp_categories` table.
- Each category has:
  - `name` – public label (“Keto”).
  - `slug` – internal key (`keto`, `balanced`, etc.).
  - `description` – marketing description.
  - `variables` (JSON) – optional technical/business rules (macros, calories, allowed meals).

**Marketing View:**
- “Diet families” that you communicate in campaigns.
- You create a category **once**, then reuse it for many plans.
- When you create or edit a category, you can **enter the base prices per meal type (Breakfast / Lunch / Dinner / Snack) directly in the same screen**; this is the main place Marketing will define the “price level” of each diet.

**Tech View:**
- Category is the **pricing key**: it maps to **meal_type_prices** rows.
- The base price inputs in `/admin/products/mp-categories` are persisted as one row per `(plan_name, meal_type)` in `meal_type_prices`.
- Used by the pricing engine to derive prices for any meal plan/variant under that category.

### 2.2 Meal Plan

- Example: **“Keto Classic”**, **“Balanced Weekly”**, **“Muscle Builder”**.
- Lives in `meal_plans`.
- Linked to a category via `mp_category_id`.

**Marketing View:**
- The “product name” customers see.
- You write copy, upload visuals, choose which variants to highlight.

**Tech View:**
- Thin wrapper over an MP Category:
  - Plan → Category → meal prices + rules.
  - Has many **Variants**.

### 2.3 Variant

- Example:  
  - “5 days • 3 meals/day”  
  - “5 days • 2 meals/day”  
  - “7 days • 3 meals/day”
- Stored in `plan_variants`.
- Defines a **fixed configuration**:
  - `meal_plan_id`
  - `label` (for UI and campaigns)
  - `days_per_week`
  - `meals_per_day` (for display)
  - `meal_types` (Breakfast/Lunch/Dinner/Snack) – stored now in config/notes, later as a column.
  - `published` flag.

**Marketing View:**
- These are the **concrete offers** you sell:
  - “Keto Classic – 5 days • 3 meals/day”
  - “Balanced – 5 days • 2 meals/day”
- You can:
  - Decide which ones are active.
  - Promote some as “Best seller”, “Promo”, etc.
  - Link campaigns directly to a variant.

**Tech View:**
- Variant provides the **input** to the pricing engine:
  - Which category → which meal_type_prices.
  - Which meal types, days/week, and default duration.
- It is *not* the source of truth for price; the engine is.

### 2.4 Subscription

- A customer’s active purchase of an offer.
- Stores:
  - `plan_variant_id` (nullable).
  - Combination: `meal_types`, `days_per_week`, `duration_weeks`, etc. (in `notes` JSON today).
  - Pricing breakdown: total price + full calculator output (also in `notes`).

---

## 3. The Pricing Engine (How Price is Calculated)

### 3.1 Data Inputs

1. **Meal type prices** – `meal_type_prices` table  
   - One row per `(plan_name_or_category, meal_type)`.
   - Example for *Keto*:
     - Breakfast: 50 MAD
     - Lunch: 60 MAD
     - Dinner: 55 MAD
     - Snack: 15 MAD

2. **Discount rules** – `discount_rules` table  
   - Examples:
     - `days_per_week`:
       - 5 days → 3%
       - 6 days → 5%
       - 7 days → 7%
     - `duration_weeks`:
       - ≥ 2 weeks → 5%
       - ≥ 4 weeks → 10%
       - ≥ 8 weeks → 15%
       - ≥ 12 weeks → 20%

3. **Customer combination**
   - Category / plan name (maps to meal_type_prices).
   - `meal_types[]` (Breakfast / Lunch / Dinner / Snack).
   - `days_per_week` (1–7).
   - `duration_weeks` (≥ 1).

### 3.2 Calculation Steps

1. **Sum meal prices (per day)**  
   \[
   \text{pricePerDay} = \sum \text{base\_price\_mad for each selected meal type}
   \]

2. **Weekly subtotal**  
   \[
   \text{grossWeekly} = \text{pricePerDay} \times \text{days\_per\_week}
   \]

3. **Apply days_per_week discount** (exact match)  
   - If rule exists for `days_per_week`, reduce `grossWeekly` by that percentage.

4. **Apply duration_weeks discount** (highest applicable)  
   - Choose the rule with the largest `condition_value <= duration_weeks`.
   - Apply it multiplicatively.

5. **Total for the subscription**  
   \[
   \text{finalWeekly} = \text{grossWeekly after all discounts}
   \]
   \[
   \text{total} = \text{finalWeekly} \times \text{duration\_weeks}
   \]

6. **(Admin only) Admin override discount or fixed price**  
   - Admin may:
     - Add an extra percentage discount (e.g. “-5% admin override”), or
     - Manually override the final price.

### 3.3 Where It Lives (Tech)

- Code: `apps/web/lib/pricing-calculator.ts`
- APIs:
  - Public: `POST /api/calculate-price`
  - Admin: `POST /api/admin/pricing/calculate`
  - Used indirectly in:
    - `POST /api/admin/customers/[id]/subscriptions/create`
    - `POST /api/orders/create-unified`

---

## 4. Two Customer Flows (How Customers Buy)

### 4.1 Flow A – Customer Configures Their Own Plan (/subscribe)

1. Customer goes to `/subscribe`.
2. They choose:
   - Plan (currently mapped to pricing plan name).
   - Meal types (Breakfast/Lunch/Dinner).
   - Days per week.
   - Duration in weeks.
3. Frontend calls `POST /api/calculate-price` with this data.
4. API runs the pricing engine and returns:
   - `basePerDay`, `grossWeekly`, `total`, plus full `calculation` breakdown.
5. Customer confirms and submits their contact details (legacy / lead flow).

**Important:**  
Even if not tied to a specific variant, the price **always** comes from the same engine.

### 4.2 Flow B – Customer Comes from a Promoted Variant

1. Marketing promotes a URL like:  
   `/offer/keto-classic-5d-3m?variantId=123`.
2. That page:
   - Loads variant config (category, meal_types, days_per_week, default duration).
   - Pre-fills the `/order` or `/subscribe` UI.
3. The pricing engine runs with **exactly the same logic** as Flow A.
4. Subscription is created with:
   - `plan_variant_id = 123`.
   - Combination and pricing breakdown from the engine.

**Benefit for Marketing:**  
You can say “Keto Classic – 5 days • 3 meals/day from X MAD/month” and always be confident the system calculates the correct total from current prices and discounts.

---

## 5. Admin Panel – How Marketing Uses It

### 5.1 Where to Work

In the admin panel:

- **Offers section:**
  - `Products → MP Categories`
  - `Products → Meal Plans`
  - `Products → Meal Plans → Variants`
- **Pricing section:**
  - `Pricing → Meal Prices`
  - `Pricing → Discount Rules`
  - `Pricing → Simulator`

### 5.2 Typical Workflow – Launch a New Offer

Example: launch **“Keto Classic – 5 days • 3 meals/day”**.

**Step 1 – Ensure Keto category exists**
- Go to `Products → MP Categories`.
- If “Keto” exists:
  - Check description & variables, adjust if needed.
- If not:
  - Create new category: Name = Keto, Slug = `keto`, add a description.

**Step 2 – Check meal prices for Keto**
- Go to `Pricing → Meal Prices`.
- For the Keto plan/category:
  - Verify base prices for Breakfast, Lunch, Dinner, Snack.
  - Adjust as needed (e.g. B=50, L=60, D=55).

**Step 3 – Check discount rules**
- Go to `Pricing → Discount Rules`.
- Verify or set:
  - 5 days → 3% discount.
  - 6 days → 5% discount.
  - 7 days → 7% discount.
  - 4 weeks → 10% discount, etc.

**Step 4 – Create the Meal Plan**
- Go to `Products → Meal Plans`.
- Click “Add New Meal Plan”.
- Fill:
  - Name: “Keto Classic”.
  - Category: **Keto**.
  - Description: marketing copy.
  - Set as Available (published).

**Step 5 – Create the Variant**
- In the Meal Plans list, click the ⚙️ (Settings) icon on “Keto Classic”.
- On the Variants page:
  - Click “Add Variant”.
  - Label: “5 days • 3 meals/day”.
  - Days per Week: 5.
  - Meals per Day: 3.
  - Meal types: Breakfast + Lunch + Dinner (in config).
  - Published: ON.
- The system can show the **calculated weekly price** using the pricing engine (for reference).

**Step 6 – Test the Price**
- Use `Pricing → Simulator` or `/subscribe`:
  - Plan: Keto.
  - Meals: Breakfast, Lunch, Dinner.
  - Days: 5.
  - Duration: 4 weeks.
- Compare the output with your expectations.

**Step 7 – Launch Campaign**
- Create a landing page or campaign URL that:
  - Pre-selects the variant (via `variantId` or query params).
  - Takes the user directly into a pre-filled checkout/order flow.

---

## 6. Tech Deep Dive (for Developers)

### 6.1 Key Files

- Pricing:
  - `apps/web/lib/pricing-calculator.ts`
  - `apps/web/app/api/calculate-price/route.ts`
  - `apps/web/app/api/admin/pricing/calculate/route.ts`
- Offers / Subscriptions:
  - `apps/web/app/api/admin/customers/[id]/subscriptions/create/route.ts`
  - `apps/web/app/api/orders/create-unified/route.ts`
  - `apps/web/app/admin/products/meal-plans/[id]/meal-plan-detail-content.tsx`
- Documentation:
  - `OFFER_CREATION_PROCESS.md`
  - `MEAL_PLANS_STRUCTURE.md`
  - `MEAL_PLANS_ANSWERS.md`
  - `PRICING_AND_OFFERS_REDESIGN_SPEC.md`

### 6.2 Unified Calculator Usage

- Always use `calculateSubscriptionPrice` when:
  - Admin creates subscriptions.
  - Unified order API creates subscriptions.
  - Any new pricing-related route is added.

**Do not:**
- Manually recompute price with ad hoc SQL + arithmetic in new APIs.
- Trust frontend‐supplied `total_price` without server recalculation.

---

## 7. Examples for Marketing & Comms

### Example 1 – Price Communication

> “Keto Classic – 5 days • 3 meals/day – from 1,746 MAD for 4 weeks”

How it is computed (example numbers):

- Keto prices: B=50, L=60, D=55.
- Daily = 50 + 60 + 55 = 165 MAD.
- Weekly gross = 165 × 5 = 825 MAD.
- Days discount (5 days = 3%): 825 × 0.03 = 24.75 → 800.25.
- Duration discount (4 weeks = 10%): 800.25 × 0.10 = 80.025 → ~720.23 / week.
- Total = 720.23 × 4 ≈ 2,880.9 MAD (numbers for illustration only).

Marketing only needs the final number; the system guarantees consistency.

### Example 2 – Short Promo

> “Balanced Weekly – 2 weeks – 5 days • Lunch + Dinner – 10% OFF”

Implementation:

- Add a `discount_rules` row with:
  - `discount_type = 'duration_weeks'`
  - `condition_value = 2`
  - `discount_percentage = 0.10`
  - `valid_from` / `valid_to` for the promo period.
- Optionally mark it as non‑stackable if it should override standard rules.

---

## 8. How to Work Together (Tech + Marketing)

**Marketing responsibilities:**
- Define categories (diets) and their positioning.
- Decide which meal plans and variants to offer.
- Configure pricing expectations (with help from the simulator).
- Launch and track campaigns using specific variants.

**Tech responsibilities:**
- Maintain the pricing engine and guarantees:
  - Consistent, correct calculations.
  - Backward compatibility when rules change.
- Keep the admin UI clear and safe for non‑technical users.
- Ensure subscriptions always store enough data to understand and audit pricing later.

---

## 9. Where to Start

When resuming work on offers/pricing:

1. Read:
   - `CONTEXT_FOR_RESUMPTION.md` (overview).
   - This file: `OFFER_SYSTEM_FULL_GUIDE.md`.
   - `PRICING_SYSTEM_GUIDE.md` (technical pricing details).
2. For a new diet/event:
   - Configure category → meal prices → discount rules.
   - Create meal plans + variants.
   - Test with simulator and `/subscribe`.
3. Keep Marketing and Tech aligned using this document as the shared reference.




