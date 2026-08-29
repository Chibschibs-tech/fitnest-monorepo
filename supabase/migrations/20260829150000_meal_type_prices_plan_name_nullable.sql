-- A1 — meal_type_prices.plan_name becomes nullable.
--
-- Approved by founder on 2026-08-29 (Article II: proposed → reviewed → applied).
-- First step of the plan_name removal: the column is deprecated (linked by
-- title, forbidden by Article II) but still written by the admin pricing
-- routes. Dropping the NOT NULL constraint lets new code stop writing it.
--
-- A2 (DROP COLUMN plan_name) stays blocked until every write path is removed —
-- scheduled with the pricing rebuild slice.
--
-- NOTE: do not `supabase db push` before the production baseline has been
-- pulled and reviewed (see supabase/migrations/README.md).

ALTER TABLE meal_type_prices ALTER COLUMN plan_name DROP NOT NULL;
