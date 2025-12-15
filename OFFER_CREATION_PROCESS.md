# Complete Offer Creation Process Guide

**Date:** 2025-01-XX  
**Purpose:** Step-by-step guide for creating meal plan offers in FitNest

---

## Overview

Creating an offer in FitNest involves multiple components working together:

1. **MP Categories** - Diet categories (Keto, Low Carb, Balanced, etc.)
2. **Meal Plans** - Base meal plan definitions
3. **Plan Variants** - Different configurations (days/week, meals/day, pricing)
4. **Meal Type Prices** - Base prices for Breakfast, Lunch, Dinner per plan
5. **Discount Rules** - Volume and duration discounts
6. **Meals** - Individual meal items to include in plans

---

## Current System Architecture (Final Model)

The system is now based on **one single pricing engine** and uses **variants as templates**, not as the source of truth for price.

### Single Pricing Engine (Source of Truth)

- Pricing is always **calculated dynamically** from:
  - **Diet / MP Category** (e.g. Keto, Balanced, Muscle Gain) – used as the pricing key.
  - **Meal type prices** in `meal_type_prices`:
    - One row per `(category_or_plan, meal_type)`.
    - Example for Keto: Breakfast = 50 MAD, Lunch = 60 MAD, Dinner = 55 MAD, Snack = 15 MAD.
  - **Discount rules** in `discount_rules`:
    - `days_per_week` discounts (5, 6, 7 days).
    - `duration_weeks` discounts (2, 4, 8, 12 weeks, etc.).
  - **Customer combination**:
    - Selected meal types (Breakfast / Lunch / Dinner / Snack).
    - Days per week (1–7).
    - Duration in weeks (≥ 1).

- The engine:
  1. Sums the prices of the selected meal types for the chosen category → `pricePerDay`.
  2. Multiplies by `days_per_week` → `grossWeekly`.
  3. Applies `days_per_week` discount (if any).
  4. Applies `duration_weeks` discount (if any).
  5. Multiplies by `duration_weeks` → **final total**.

- Implemented in:
  - `meal_type_prices` table.
  - `discount_rules` table.
  - `apps/web/lib/pricing-calculator.ts` (shared calculator).
  - APIs:
    - `POST /api/calculate-price` (public).
    - `POST /api/admin/pricing/calculate` (admin).

### Role of MP Categories

- MP Categories (Keto, Balanced, etc.) are the **diet/pricing profiles**:
  - Used as the key in `meal_type_prices` (per-category meal prices).
  - Store `variables` JSON for nutrition and marketing notes.
- Meal plans link to MP Categories via `meal_plans.mp_category_id`.
- Pricing for any meal plan is derived from the **category** it belongs to.

### Role of Plan Variants

- Plan Variants are **saved configurations + tracking IDs**, not stored prices:
  - They define **what the offer is operationally**:
    - Meal plan (through `meal_plan_id` → MP Category).
    - Days per week (e.g. 5 or 7).
    - Meals per day / meal types (e.g. Breakfast + Lunch + Dinner).
    - Optional default duration (e.g. 4 weeks).
  - They are the **packages Marketing can promote**:
    - “Keto Classic – 5 days • 3 meals/day”.
    - “Balanced Weekly – 5 days • 2 meals/day”.

- When a customer uses a Variant:
  1. System loads the variant configuration.
  2. Derives the category and meal types.
  3. Sends this combination into the pricing engine.
  4. Gets the final price with all discounts applied.
  5. Creates a subscription that stores:
     - `plan_variant_id` (so we know which offer they picked).
     - The full combination and the pricing breakdown.

- When a customer builds a custom combo (no variant):
  1. They choose category, meal types, days/week, duration.
  2. The same pricing engine calculates the price.
  3. Subscription is created with `plan_variant_id = NULL` (or “custom”) but still with full breakdown.

---

## Step-by-Step Offer Creation Process

### Phase 1: Setup Prerequisites

#### Step 1.1: Run MP Categories Migration
1. Navigate to: `/admin/migrate-mp-categories`
2. Click "Run Migration"
3. Verify 5 default categories are created:
   - Keto
   - Low Carb
   - Balanced
   - Muscle Gain
   - Custom

#### Step 1.2: Create/Verify MP Categories
1. Navigate to: `/admin/products/mp-categories`
2. Review existing categories
3. Create new categories if needed
4. For each category, set:
   - **Base prices per meal type** (Breakfast / Lunch / Dinner / Snack) directly in the create/edit modal  
     - This will automatically create/update `meal_type_prices` rows for that category.
   - Category variables (JSON) if required (macros, calories, notes).

#### Step 1.3: (Optional) Fine-Tune Meal Type Prices
1. Navigate to: `/admin/pricing/meal-prices`
2. Review/edit any automatically created rows for each category.
3. Use this screen mainly for **advanced adjustments** or bulk ops; the default flow for Marketing is to set prices via MP Categories.

#### Step 1.4: Setup Discount Rules
1. Navigate to: `/admin/pricing/discount-rules`
2. Create discount rules for:
   - **Days per week discounts:**
     - 5 days: 5% discount
     - 7 days: 10% discount
   - **Duration discounts:**
     - 2 weeks: 5% discount
     - 4 weeks (1 month): 10% discount
     - 8 weeks: 15% discount
     - 12 weeks: 20% discount

**API Endpoint:** `POST /api/admin/pricing/discount-rules`
```json
{
  "discount_type": "days_per_week",
  "condition_value": 5,
  "discount_percentage": 0.05,
  "is_active": true
}
```

#### Step 1.5: Create Meals (Individual Meal Items)
1. Navigate to: `/admin/products/meals`
2. Create meal items with:
   - Name, description
   - Nutritional info (calories, protein, carbs, fat)
   - Meal type (Breakfast, Lunch, Dinner)
   - Allergens, tags
   - Image

---

### Phase 2: Create Meal Plan

#### Step 2.1: Create Base Meal Plan
1. Navigate to: `/admin/products/meal-plans`
2. Click "Add New Meal Plan"
3. Fill in:
   - **Plan Name**: e.g., "Keto Classic"
   - **Description**: e.g., "Low-carb, high-fat meal plan for ketosis"
   - **MP Category**: Select from dropdown (e.g., "Keto")
   - **Available**: Check to publish
4. Click "Create"

**Result:** A base meal plan is created (no pricing yet)

---

### Phase 3: Create Plan Variants

#### Step 3.1: Access Plan Variants Management
1. In the meal plans list, click the Settings icon (⚙️) on your meal plan
2. This opens the Plan Variants management page

#### Step 3.2: Create Plan Variants
For each configuration option, create a variant:

**Example: "5 days • 3 meals/day"**
1. Click "Add Variant"
2. Fill in:
   - **Label**: "5 days • 3 meals/day"
   - **Days per Week**: 5
   - **Meals per Day**: 3
   - **Weekly Price (MAD)**: 899.00
   - **Published**: Check to activate
3. Click "Create"

**Example: "5 days • 2 meals/day"**
- Label: "5 days • 2 meals/day"
- Days per Week: 5
- Meals per Day: 2
- Weekly Price: 749.00

**Example: "7 days • 3 meals/day"**
- Label: "7 days • 3 meals/day"
- Days per Week: 7
- Meals per Day: 3
- Weekly Price: 1199.00

**Result:** Multiple variants for the same meal plan, each with its own pricing

---

### Phase 4: Link Meals to Plan Variants (Optional)

If you want to specify which meals are included in each variant:

1. Navigate to the plan variant detail page
2. Add meals to specific day/slot combinations
3. This allows meal rotation and customization

**Note:** This step may not be required if meals are selected dynamically.

---

## Pricing Calculation Flow

### When Customer Subscribes:

1. **Customer selects:**
   - Meal Plan: "Keto Classic"
   - Variant: "5 days • 3 meals/day" (899 MAD/week)
   - Duration: 4 weeks (1 month)

2. **Price Calculation:**
   - Base: 899 MAD/week
   - Total: 899 × 4 = 3,596 MAD

3. **If using meal-based pricing:**
   - Base prices: Breakfast (45) + Lunch (55) + Dinner (50) = 150 MAD/day
   - Weekly: 150 × 5 days = 750 MAD/week
   - Apply discounts:
     - Days discount (5 days): 5% = 37.50 MAD
     - Duration discount (4 weeks): 10% = 75 MAD
   - Final: 750 - 37.50 - 75 = 637.50 MAD/week
   - Total: 637.50 × 4 = 2,550 MAD

**⚠️ CONFLICT:** Plan variant pricing (3,596 MAD) vs. meal-based pricing (2,550 MAD)

---

## Recommended Process (Unified Approach)

### Option A: Use Plan Variants Only (Simpler)

1. **Create meal plans** with MP categories
2. **Create plan variants** with fixed weekly prices
3. **Calculate total:** `weekly_price_mad × duration_weeks`
4. **Apply admin discounts** if needed (manual override)

**Pros:**
- Simple and straightforward
- Easy to manage
- Clear pricing for customers

**Cons:**
- Less flexible
- Can't dynamically calculate based on meal selection

### Option B: Use Meal-Based Pricing (More Flexible)

1. **Create meal plans** with MP categories
2. **Set meal type prices** for each plan
3. **Create plan variants** for configuration (days/week, meals/day)
4. **Calculate dynamically:** 
   - Get meal prices from `meal_type_prices`
   - Calculate: `(sum of meal prices) × days × duration`
   - Apply discounts from `discount_rules`
5. **Store calculated price** in `plan_variants.weekly_price_mad` for display

**Pros:**
- More flexible
- Can adjust meal prices without changing variants
- Supports dynamic discount rules

**Cons:**
- More complex
- Requires synchronization between systems

---

## Current State Analysis

### What's Working:
- ✅ MP Categories system
- ✅ Meal Plans creation
- ✅ Plan Variants management
- ✅ Meal Type Prices API
- ✅ Discount Rules API

### What Needs Clarification:
- ⚠️ Which pricing system is the source of truth?
- ⚠️ How are plan variants linked to meal type prices?
- ⚠️ Should `plan_variants.weekly_price_mad` be calculated or manually set?
- ⚠️ How do discounts apply to plan variant pricing?

---

## Recommended Next Steps

1. **Decide on pricing system:**
   - Choose Plan Variants only OR Meal-based pricing
   - Document the decision

2. **Create unified pricing calculator:**
   - If using meal-based: Calculate from `meal_type_prices` and `discount_rules`
   - If using variants: Use `plan_variants.weekly_price_mad` directly
   - Ensure consistency across all APIs

3. **Update subscription creation:**
   - Use the chosen pricing system
   - Apply discounts correctly
   - Store final price in subscription record

4. **Create admin UI for:**
   - Meal type prices management
   - Discount rules management
   - Plan variant pricing calculator (if using meal-based)

---

## Example: Complete Offer Creation

### Scenario: Create "Keto Classic" Offer

1. **Setup:**
   - ✅ MP Category "Keto" exists
   - ✅ Meal type prices set for "Keto" plan:
     - Breakfast: 50 MAD
     - Lunch: 60 MAD
     - Dinner: 55 MAD
   - ✅ Discount rules configured

2. **Create Meal Plan:**
   - Name: "Keto Classic"
   - Category: Keto
   - Description: "Low-carb, high-fat meal plan"

3. **Create Variants:**
   - Variant 1: "5 days • 3 meals/day"
     - Days: 5, Meals: 3
     - Price: Calculate or set manually
     - If calculating: (50+60+55) × 5 = 825 MAD/week
     - Apply 5% days discount: 825 × 0.95 = 783.75 MAD/week
     - Set: 784 MAD/week (rounded)
   - Variant 2: "5 days • 2 meals/day"
     - Days: 5, Meals: 2
     - Price: (60+55) × 5 = 575 MAD/week
     - Apply 5% discount: 575 × 0.95 = 546.25 MAD/week
     - Set: 546 MAD/week

4. **Activate Variants:**
   - Set `published = true` for active variants
   - Set `published = false` for inactive variants

5. **Test:**
   - Customer selects "Keto Classic" → "5 days • 3 meals/day" → "4 weeks"
   - Total: 784 × 4 = 3,136 MAD
   - Verify price matches expectations

---

## Questions to Resolve

1. **Which pricing system should be used?**
   - Plan Variants (simple, fixed prices)
   - Meal-Based (flexible, dynamic calculation)

2. **How should `plan_variants.weekly_price_mad` be set?**
   - Manually by admin
   - Calculated from meal type prices
   - Both (manual override available)

3. **How do discounts apply?**
   - To plan variant prices directly
   - To calculated meal-based prices
   - Both (stackable)

4. **Should meal selection affect pricing?**
   - Yes (custom meal selection = custom pricing)
   - No (fixed plan pricing regardless of meals)

---

## Conclusion

The current system has all the components needed to create offers, but there's a need to:
1. **Clarify the pricing system** (variants vs. meal-based)
2. **Unify the calculation logic** across all APIs
3. **Document the chosen approach** clearly
4. **Create admin UI** for managing all pricing components

Once these decisions are made, the offer creation process will be clear and consistent.

