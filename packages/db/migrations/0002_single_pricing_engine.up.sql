-- =============================================================================
-- 0002 — Single pricing engine (UP)
--
-- Keeps meal_type_prices as the ONLY pricing engine:
--   1. meal_type_prices gets a real FK to meal_plans (no more coupling by name).
--   2. subscriptions stores the full frozen configuration + price at signup,
--      so a later tariff change can never alter an already-sold subscription.
--   3. The dead engine (plan_variants + meal_plan_meals.plan_variant_id) is
--      removed. Verified before this migration:
--        - meal_plan_meals.plan_variant_id is NULL on all 54 rows
--        - subscriptions is empty (no data to lose)
--        - no code path reads plan_variants for pricing anymore
--
-- Reverse with 0002_single_pricing_engine.down.sql
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. meal_type_prices: reference plans by id, not by name
-- ---------------------------------------------------------------------------

ALTER TABLE meal_type_prices
  ADD COLUMN IF NOT EXISTS meal_plan_id INTEGER REFERENCES meal_plans(id) ON DELETE CASCADE;

UPDATE meal_type_prices mtp
SET meal_plan_id = mp.id
FROM meal_plans mp
WHERE mtp.meal_plan_id IS NULL
  AND lower(mp.title) = lower(mtp.plan_name);

-- Abort loudly instead of silently losing price rows whose plan_name does not
-- match any meal_plans.title (must be fixed by hand before migrating).
DO $$
DECLARE
  unmatched INTEGER;
BEGIN
  SELECT COUNT(*) INTO unmatched FROM meal_type_prices WHERE meal_plan_id IS NULL;
  IF unmatched > 0 THEN
    RAISE EXCEPTION
      'meal_type_prices: % row(s) whose plan_name matches no meal_plans.title — fix data then re-run',
      unmatched;
  END IF;
END $$;

ALTER TABLE meal_type_prices ALTER COLUMN meal_plan_id SET NOT NULL;

ALTER TABLE meal_type_prices
  ADD CONSTRAINT meal_type_prices_meal_plan_id_meal_type_key
  UNIQUE (meal_plan_id, meal_type);

-- plan_name stays for now but must never be read again (removal in a later lot,
-- together with the plan renaming work).
COMMENT ON COLUMN meal_type_prices.plan_name IS
  'DEPRECATED — do not read or write. Use meal_plan_id. Scheduled for removal.';

-- ---------------------------------------------------------------------------
-- 2. subscriptions: frozen configuration + price at signup
--    (table verified empty, hence the NOT NULL columns are safe)
-- ---------------------------------------------------------------------------

ALTER TABLE subscriptions DROP COLUMN IF EXISTS plan_variant_id;

ALTER TABLE subscriptions
  ADD COLUMN meal_plan_id        INTEGER       NOT NULL REFERENCES meal_plans(id) ON DELETE RESTRICT,
  ADD COLUMN meal_types          TEXT[]        NOT NULL,
  ADD COLUMN days_per_week       INTEGER       NOT NULL CHECK (days_per_week BETWEEN 1 AND 7),
  ADD COLUMN duration_weeks      INTEGER       NOT NULL CHECK (duration_weeks >= 1),
  ADD COLUMN price_per_day_mad   NUMERIC(10,2) NOT NULL CHECK (price_per_day_mad >= 0),
  ADD COLUMN discount_percentage NUMERIC(5,2)  NOT NULL DEFAULT 0 CHECK (discount_percentage BETWEEN 0 AND 100),
  ADD COLUMN total_mad           NUMERIC(10,2) NOT NULL CHECK (total_mad >= 0);

CREATE INDEX IF NOT EXISTS idx_subscriptions_meal_plan ON subscriptions(meal_plan_id);

-- ---------------------------------------------------------------------------
-- 3. Remove the dead engine
-- ---------------------------------------------------------------------------

ALTER TABLE meal_plan_meals DROP COLUMN IF EXISTS plan_variant_id;

DROP TABLE IF EXISTS plan_variants;

-- ---------------------------------------------------------------------------
-- 4. Safety net: discount_rules.stacking_behavior is read by the pricing
--    engine but was added ad hoc; make sure it exists everywhere.
-- ---------------------------------------------------------------------------

ALTER TABLE discount_rules
  ADD COLUMN IF NOT EXISTS stacking_behavior VARCHAR(20) NOT NULL DEFAULT 'best';

COMMIT;
