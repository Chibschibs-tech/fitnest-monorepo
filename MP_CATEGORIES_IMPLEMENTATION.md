# MP Categories Implementation

**Date:** 2025-01-XX  
**Status:** ✅ Complete

## Overview

The MP Categories system replaces the hardcoded `audience` field in meal plans with a flexible, manageable category system. Each category can have custom variables stored as JSON.

## What Was Implemented

### 1. Database Schema

**New Table: `mp_categories`**
```sql
CREATE TABLE mp_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  variables JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Updated Table: `meal_plans`**
- Added `mp_category_id INTEGER REFERENCES mp_categories(id)`
- Kept `audience` column for backward compatibility (can be removed later)

### 2. Migration System

**Migration Endpoint:** `/api/admin/migrate-to-mp-categories`

The migration:
1. Creates `mp_categories` table if it doesn't exist
2. Creates default categories:
   - Keto
   - Low Carb
   - Balanced
   - Muscle Gain
   - Custom
3. Adds `mp_category_id` column to `meal_plans`
4. Migrates existing `audience` values to `mp_category_id`
5. Safe to run multiple times (idempotent)

**Migration Page:** `/admin/migrate-mp-categories`
- User-friendly UI to run the migration
- Shows progress and results

### 3. API Endpoints

**MP Categories CRUD:**
- `GET /api/admin/mp-categories` - List all categories
- `POST /api/admin/mp-categories` - Create category
- `GET /api/admin/mp-categories/[id]` - Get category
- `PUT /api/admin/mp-categories/[id]` - Update category
- `DELETE /api/admin/mp-categories/[id]` - Delete category

**Updated Meal Plans APIs:**
- All meal plan endpoints now use `mp_category_id` instead of `audience`
- Backward compatible (falls back to `audience` if `mp_category_id` is null)
- Response includes both `category` (name) and `mp_category_id`

### 4. Admin UI

**MP Categories Management:**
- Page: `/admin/products/mp-categories`
- Full CRUD interface
- Base price inputs (Breakfast / Lunch / Dinner / Snack) directly on the create/edit modal
  - On save, these values are upserted into `meal_type_prices` as one row per `(plan_name, meal_type)`
  - This means **creating/updating a category can immediately configure the pricing engine** for that diet
- JSON editor for advanced `variables`
- Shows meal plan count per category
- Prevents deletion if category has meal plans

**Meal Plans:**
- Updated create/edit forms to use category dropdown
- Categories fetched dynamically from database
- Link to create categories if none exist

### 5. Variables System

Each MP Category can have custom variables stored as JSON:

```json
{
  "target_calories_min": 1200,
  "target_calories_max": 1500,
  "macros": {
    "protein": 0.3,
    "carbs": 0.4,
    "fat": 0.3
  },
  "allowed_meal_types": ["breakfast", "lunch", "dinner"]
}
```

This allows each category to have its own configuration.

## How to Use

### Step 1: Run Migration

1. Start your dev server:
   ```bash
   cd apps/web && pnpm dev
   ```

2. Login to admin panel

3. Go to: `http://localhost:3002/admin/migrate-mp-categories`

4. Click "Run Migration" button

Or use the API directly:
```bash
POST http://localhost:3002/api/admin/migrate-to-mp-categories
(requires admin session cookie)
```

### Step 2: Manage Categories

1. Go to `/admin/products/mp-categories`
2. Create/edit categories
3. Set variables (JSON) for each category

### Step 3: Use in Meal Plans

1. Go to `/admin/products/meal-plans`
2. When creating/editing meal plans, select from category dropdown
3. Categories are fetched dynamically from database

## Files Created/Modified

### Created:
- `apps/web/app/api/admin/mp-categories/route.ts`
- `apps/web/app/api/admin/mp-categories/[id]/route.ts`
- `apps/web/app/api/admin/migrate-to-mp-categories/route.ts`
- `apps/web/app/admin/products/mp-categories/page.tsx`
- `apps/web/app/admin/products/mp-categories/mp-categories-content.tsx`
- `apps/web/app/admin/migrate-mp-categories/page.tsx`
- `scripts/run-mp-categories-migration.js`

### Modified:
- `apps/web/app/api/admin/products/meal-plans/route.ts`
- `apps/web/app/api/admin/products/meal-plans/[id]/route.ts`
- `apps/web/app/admin/products/meal-plans/meal-plans-content.tsx`
- `apps/web/app/admin/admin-layout.tsx`

## Next Steps (Optional)

1. **Remove `audience` column** (after verifying all meal plans are migrated):
   ```sql
   ALTER TABLE meal_plans DROP COLUMN audience;
   ```

2. **Update Drizzle schema** to reflect the new structure

3. **Add category variables UI** to meal plan creation form (use variables from selected category)

4. **Add category filtering** to meal plans list

## Notes

- The `audience` column is kept for backward compatibility
- Migration is idempotent (safe to run multiple times)
- Categories cannot be deleted if they have associated meal plans
- Variables are stored as JSONB for flexibility



