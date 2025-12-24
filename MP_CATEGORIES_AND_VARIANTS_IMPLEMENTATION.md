# MP Categories & Plan Variants Implementation

**Date:** 2025-01-XX  
**Status:** ✅ Complete

## Overview

This implementation introduces a flexible category system for meal plans and a complete plan variants management system, replacing the hardcoded `audience` field with a manageable, database-driven approach.

## What Was Implemented

### 1. MP Categories System

**Purpose:** Replace hardcoded `audience` values with manageable categories that can have custom variables.

**Database Schema:**
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

**Features:**
- Full CRUD operations via admin panel
- JSONB `variables` field for category-specific configuration
- Default categories: Keto, Low Carb, Balanced, Muscle Gain, Custom
- Migration system to convert existing `audience` values

**API Endpoints:**
- `GET /api/admin/mp-categories` - List all categories
- `POST /api/admin/mp-categories` - Create category
- `GET /api/admin/mp-categories/[id]` - Get category
- `PUT /api/admin/mp-categories/[id]` - Update category
- `DELETE /api/admin/mp-categories/[id]` - Delete category
- `POST /api/admin/migrate-to-mp-categories` - Run migration

**Admin UI:**
- Page: `/admin/products/mp-categories`
- Full CRUD interface with JSON editor for variables
- Shows meal plan count per category
- Prevents deletion if category has meal plans

### 2. Plan Variants Management System

**Purpose:** Allow multiple configuration options (days/week, meals/day, pricing) for each meal plan without creating duplicate meal plans.

**Database Schema:**
```sql
CREATE TABLE plan_variants (
  id SERIAL PRIMARY KEY,
  meal_plan_id INTEGER REFERENCES meal_plans(id),
  label VARCHAR(120) NOT NULL,
  days_per_week INTEGER DEFAULT 5,
  meals_per_day INTEGER DEFAULT 3,
  weekly_price_mad NUMERIC(10,2) NOT NULL,
  published BOOLEAN DEFAULT true
);
```

**Key Concepts:**
- **Meal Plan** = Base plan (e.g., "Keto Classic") - Create ONE per diet type
- **Plan Variants** = Different options for that plan - Create MULTIPLE variants
- **Duration** = Selected by customer when subscribing (NOT stored in variants)

**Example:**
```
Meal Plan: "Keto Classic"
├── Variant 1: "5 days • 3 meals/day" (899 MAD/week) [Active]
├── Variant 2: "5 days • 2 meals/day" (749 MAD/week) [Active]
└── Variant 3: "7 days • 3 meals/day" (1199 MAD/week) [Inactive]

Customer subscribes:
- Selects: "Keto Classic"
- Selects: Variant 1 ("5 days • 3 meals/day")
- Selects: Duration (1 month = 4 weeks)
- Total: 899 × 4 = 3596 MAD
```

**API Endpoints:**
- `GET /api/admin/products/meal-plans/[id]/variants` - List variants for a meal plan
- `POST /api/admin/products/meal-plans/[id]/variants` - Create variant
- `PUT /api/admin/products/meal-plans/[id]/variants/[variantId]` - Update variant
- `DELETE /api/admin/products/meal-plans/[id]/variants/[variantId]` - Delete variant

**Admin UI:**
- Meal Plan Detail Page: `/admin/products/meal-plans/[id]`
- Full CRUD for variants
- Toggle to activate/deactivate variants
- Settings button (⚙️) in meal plans list to access variants

### 3. Database Migration

**Migration Endpoint:** `/api/admin/migrate-to-mp-categories`

**What it does:**
1. Creates `mp_categories` table
2. Creates default categories (Keto, Low Carb, Balanced, Muscle Gain, Custom)
3. Adds `mp_category_id` column to `meal_plans`
4. Migrates existing `audience` values to `mp_category_id`
5. Sets `audience` column from category slug (for backward compatibility)
6. Safe to run multiple times (idempotent)

**Migration Page:** `/admin/migrate-mp-categories`
- User-friendly UI to run migration
- Shows progress and results

### 4. Updated Meal Plans System

**Changes:**
- Meal plans now use `mp_category_id` instead of hardcoded `audience`
- Backward compatible (falls back to `audience` if `mp_category_id` is null)
- Category dropdown in create/edit forms
- Variant count displayed in list
- Settings button to manage variants

## Files Created

### API Endpoints:
- `apps/web/app/api/admin/mp-categories/route.ts`
- `apps/web/app/api/admin/mp-categories/[id]/route.ts`
- `apps/web/app/api/admin/migrate-to-mp-categories/route.ts`
- `apps/web/app/api/admin/products/meal-plans/[id]/variants/route.ts`
- `apps/web/app/api/admin/products/meal-plans/[id]/variants/[variantId]/route.ts`

### Admin UI:
- `apps/web/app/admin/products/mp-categories/page.tsx`
- `apps/web/app/admin/products/mp-categories/mp-categories-content.tsx`
- `apps/web/app/admin/products/meal-plans/[id]/page.tsx`
- `apps/web/app/admin/products/meal-plans/[id]/meal-plan-detail-content.tsx`
- `apps/web/app/admin/migrate-mp-categories/page.tsx`

### Documentation:
- `MP_CATEGORIES_IMPLEMENTATION.md`
- `MEAL_PLANS_STRUCTURE.md`
- `MEAL_PLANS_ANSWERS.md`
- `CREATE_MEAL_PLAN_GUIDE.md`

## Files Modified

- `apps/web/app/api/admin/products/meal-plans/route.ts` - Updated to use `mp_category_id`
- `apps/web/app/api/admin/products/meal-plans/[id]/route.ts` - Updated to use `mp_category_id`
- `apps/web/app/admin/products/meal-plans/meal-plans-content.tsx` - Added category dropdown, Settings button
- `apps/web/app/admin/admin-layout.tsx` - Added MP Categories and Migration to navigation

## How to Use

### Step 1: Run Migration
1. Go to `/admin/migrate-mp-categories`
2. Click "Run Migration"
3. Wait for success message

### Step 2: Manage Categories (Optional)
1. Go to `/admin/products/mp-categories`
2. Create/edit categories
3. Set variables (JSON) for each category

### Step 3: Create Meal Plans
1. Go to `/admin/products/meal-plans`
2. Click "Add New Meal Plan"
3. Select MP Category from dropdown
4. Create the meal plan

### Step 4: Add Variants
1. Click Settings icon (⚙️) on the meal plan
2. Click "Add Variant"
3. Set: Label, Days/Week, Meals/Day, Price/Week
4. Activate/deactivate as needed

## Important Notes

1. **Duration is NOT stored in variants** - It's selected by customers when subscribing
2. **One meal plan, multiple variants** - Don't create duplicate meal plans for different durations
3. **Backward compatibility** - `audience` column is kept and synced with category slug
4. **Variables field** - JSONB field in categories for custom configuration per category

## Database Schema Changes

**Added:**
- `mp_categories` table
- `meal_plans.mp_category_id` column (foreign key to `mp_categories.id`)

**Kept for compatibility:**
- `meal_plans.audience` column (synced with category slug)

## Testing Checklist

- [x] Migration runs successfully
- [x] MP Categories CRUD works
- [x] Meal plan creation with category selection
- [x] Plan variants CRUD works
- [x] Variant activation/deactivation
- [x] Settings button navigation
- [x] Error handling for all operations

## Future Enhancements (Optional)

1. Add duration presets to variants (1 week, 2 weeks, 1 month, etc.)
2. Bulk variant creation
3. Copy variants between meal plans
4. Variant pricing rules based on duration
5. Category variables UI (instead of JSON editor)





