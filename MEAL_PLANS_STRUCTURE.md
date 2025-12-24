# Meal Plans Structure Explained

## Current Structure

### 1. Meal Plan (Base)
- **Table**: `meal_plans`
- **Purpose**: The base plan (e.g., "Keto Classic", "Balanced Weekly")
- **Fields**: 
  - `id`, `title`, `summary`, `mp_category_id`, `published`
- **You create ONE meal plan per diet type**

### 2. Plan Variants (Options)
- **Table**: `plan_variants`
- **Purpose**: Different options/configurations for the same meal plan
- **Fields**:
  - `id`, `meal_plan_id` (references meal_plans)
  - `label` (e.g., "5 days • 3 meals/day")
  - `days_per_week` (e.g., 5, 7)
  - `meals_per_day` (e.g., 2, 3)
  - `weekly_price_mad` (price per week)
  - `published` (active/inactive)
- **You create MULTIPLE variants for each meal plan**

### 3. Duration
- **Duration is NOT stored in plan_variants**
- **Duration is set when creating a subscription** (1 week, 2 weeks, 1 month, etc.)
- The total price = `weekly_price_mad × duration_weeks`

## Example

**Meal Plan**: "Keto Classic"
- **Variant 1**: 5 days/week, 3 meals/day, 899 MAD/week → "5 days • 3 meals/day"
- **Variant 2**: 5 days/week, 2 meals/day, 749 MAD/week → "5 days • 2 meals/day"
- **Variant 3**: 7 days/week, 3 meals/day, 1199 MAD/week → "7 days • 3 meals/day"

When a customer subscribes:
- They select the meal plan ("Keto Classic")
- They select a variant (e.g., "5 days • 3 meals/day")
- They select duration (1 week, 2 weeks, 1 month = 4 weeks)
- Total = 899 × 4 = 3596 MAD for 1 month

## Current Issues

1. **Duration and Meals/day are hardcoded** in the API response (lines 59-60)
2. **No UI to manage plan variants** - you can't create/edit variants from admin panel
3. **The list shows fake data** instead of actual variant data

## Solution

1. Create a Plan Variants management UI within each meal plan
2. Update the meal plans list to show actual data from variants
3. Allow activating/deactivating variants (published field)





