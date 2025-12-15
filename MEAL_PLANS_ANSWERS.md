# Answers to Your Questions

## Question 1: Where does "duration" and "Meals/day" come from?

**Current Issue**: They are **hardcoded defaults** in the API response:
- `duration_weeks: 4` (line 59 in meal-plans/route.ts)
- `meals_per_day: 3` (line 60 in meal-plans/route.ts)

**Correct Answer**: 
- **Meals/day** comes from `plan_variants.meals_per_day` (each variant has its own value)
- **Duration** is NOT stored in variants - it's selected by the customer when subscribing (1 week, 2 weeks, 1 month, etc.)

## Question 2: Should I create the same meal plan 3 times for different durations?

**NO!** You should:
1. Create **ONE meal plan** (e.g., "Keto Classic")
2. Create **multiple plan variants** for that meal plan with different options:
   - Variant 1: 5 days/week, 3 meals/day, 899 MAD/week
   - Variant 2: 5 days/week, 2 meals/day, 749 MAD/week
   - Variant 3: 7 days/week, 3 meals/day, 1199 MAD/week

3. **Duration is selected by the customer** when they subscribe:
   - They choose: Meal Plan → Variant → Duration (1 week, 2 weeks, 1 month)
   - Total price = `weekly_price_mad × duration_weeks`

## The Correct Structure

```
Meal Plan: "Keto Classic"
├── Variant 1: "5 days • 3 meals/day" (899 MAD/week) [Active]
├── Variant 2: "5 days • 2 meals/day" (749 MAD/week) [Active]
└── Variant 3: "7 days • 3 meals/day" (1199 MAD/week) [Inactive]

When customer subscribes:
- Selects: "Keto Classic"
- Selects: Variant 1 ("5 days • 3 meals/day")
- Selects: Duration (1 month = 4 weeks)
- Total: 899 × 4 = 3596 MAD
```

## What I've Created

1. ✅ **API Endpoints** for managing plan variants:
   - `GET /api/admin/products/meal-plans/[id]/variants` - List variants
   - `POST /api/admin/products/meal-plans/[id]/variants` - Create variant
   - `PUT /api/admin/products/meal-plans/[id]/variants/[variantId]` - Update variant
   - `DELETE /api/admin/products/meal-plans/[id]/variants/[variantId]` - Delete variant

2. ✅ **Updated table** to show variant count instead of fake duration

3. ⏳ **Next Step**: Create UI to manage variants (add/edit/delete/activate variants for each meal plan)

## How to Use

1. **Create a meal plan** (you already did this ✅)
2. **Add variants to that meal plan**:
   - Go to meal plan detail page (we need to create this)
   - Click "Add Variant"
   - Set: Label, Days/Week, Meals/Day, Price/Week
   - Activate/Deactivate as needed

3. **Duration is handled automatically** when customers subscribe

## Next Steps

I need to create:
- A meal plan detail page showing all variants
- UI to add/edit/delete variants
- Toggle to activate/deactivate variants

Would you like me to create this UI now?




