-- =============================================================================
-- 0002 PRE-FIX — realign meal_type_prices.plan_name with the renamed plans
--
-- Context: the plans were renamed from the admin (Weight Loss -> Low Carb,
-- Stay Fit -> Balanced, Muscle Gain -> Protein Power; Keto unchanged), but
-- meal_type_prices still carries the OLD names. The 0002 up migration aborts
-- (by design) as long as any plan_name matches no meal_plans.title.
--
-- Run this ONCE in production BEFORE re-running 0002_single_pricing_engine.up.sql.
-- Everything is in one transaction: if a check fails, nothing is changed.
-- =============================================================================

BEGIN;

UPDATE meal_type_prices SET plan_name = 'Low Carb'      WHERE lower(plan_name) = 'weight loss';
UPDATE meal_type_prices SET plan_name = 'Balanced'      WHERE lower(plan_name) = 'stay fit';
UPDATE meal_type_prices SET plan_name = 'Protein Power' WHERE lower(plan_name) = 'muscle gain';

-- Abort if any orphan plan_name remains (unexpected name: inspect it by hand).
DO $$
DECLARE bad TEXT;
BEGIN
  SELECT string_agg(DISTINCT mtp.plan_name, ', ') INTO bad
  FROM meal_type_prices mtp
  LEFT JOIN meal_plans mp ON lower(mp.title) = lower(mtp.plan_name)
  WHERE mp.id IS NULL;
  IF bad IS NOT NULL THEN
    RAISE EXCEPTION 'Orphan plan_name(s) still present: %', bad;
  END IF;
END $$;

-- Abort if the remap produced two price rows for the same (plan, meal_type)
-- (would violate the unique constraint added by 0002). If this fires, the same
-- tariff exists under both the old and the new name: keep one, delete the other.
DO $$
DECLARE dup TEXT;
BEGIN
  SELECT string_agg(plan_name || ' / ' || meal_type, ', ') INTO dup
  FROM (
    SELECT plan_name, meal_type
    FROM meal_type_prices
    GROUP BY plan_name, meal_type
    HAVING COUNT(*) > 1
  ) d;
  IF dup IS NOT NULL THEN
    RAISE EXCEPTION 'Duplicate price rows after remap: %', dup;
  END IF;
END $$;

COMMIT;
