-- =============================================================================
-- 0002 — Single pricing engine (DOWN)
--
-- Restores the structure removed by 0002_single_pricing_engine.up.sql.
-- NOTE: the 10 plan_variants rows are NOT restored (they were stale flat
-- prices, unused by any code path). The table structure comes back empty.
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Recreate the dead engine structure
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS plan_variants (
  id               SERIAL PRIMARY KEY,
  meal_plan_id     INTEGER NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
  label            VARCHAR(120) NOT NULL,
  days_per_week    INTEGER NOT NULL DEFAULT 5,
  meals_per_day    INTEGER NOT NULL DEFAULT 3,
  weekly_price_mad NUMERIC(10,2) NOT NULL,
  published        BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_plan_variants_meal_plan ON plan_variants(meal_plan_id);

ALTER TABLE meal_plan_meals
  ADD COLUMN IF NOT EXISTS plan_variant_id INTEGER REFERENCES plan_variants(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- 2. subscriptions: back to the variant reference
-- ---------------------------------------------------------------------------

ALTER TABLE subscriptions
  DROP COLUMN IF EXISTS meal_plan_id,
  DROP COLUMN IF EXISTS meal_types,
  DROP COLUMN IF EXISTS days_per_week,
  DROP COLUMN IF EXISTS duration_weeks,
  DROP COLUMN IF EXISTS price_per_day_mad,
  DROP COLUMN IF EXISTS discount_percentage,
  DROP COLUMN IF EXISTS total_mad;

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS plan_variant_id INTEGER REFERENCES plan_variants(id) ON DELETE SET NULL;

DROP INDEX IF EXISTS idx_subscriptions_meal_plan;

-- ---------------------------------------------------------------------------
-- 3. meal_type_prices: back to name-only coupling
-- ---------------------------------------------------------------------------

ALTER TABLE meal_type_prices
  DROP CONSTRAINT IF EXISTS meal_type_prices_meal_plan_id_meal_type_key;

ALTER TABLE meal_type_prices DROP COLUMN IF EXISTS meal_plan_id;

COMMENT ON COLUMN meal_type_prices.plan_name IS NULL;

COMMIT;
