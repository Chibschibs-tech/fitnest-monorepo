-- =============================================================================
-- FitNest Unified Schema — Fresh Supabase Migration
-- Generated: 2026-03-28
-- Consolidates: Drizzle schema, bootstrap route, auth.ts DDL, legacy SQL
-- =============================================================================

BEGIN;

-- ===================== AUTHENTICATION & USERS =====================

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  name          VARCHAR(255),
  password      VARCHAR(255) NOT NULL,
  phone         VARCHAR(50),
  role          VARCHAR(50) NOT NULL DEFAULT 'customer',
  status        VARCHAR(20) NOT NULL DEFAULT 'active',
  city          VARCHAR(100),
  admin_notes   TEXT,
  last_login_at TIMESTAMP,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id         VARCHAR(255) PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- ===================== MEAL CATALOG =====================

CREATE TABLE IF NOT EXISTS mp_categories (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  variables   JSONB DEFAULT '{}',
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meal_plans (
  id              SERIAL PRIMARY KEY,
  slug            VARCHAR(160) NOT NULL UNIQUE,
  title           VARCHAR(200) NOT NULL,
  summary         TEXT,
  audience        VARCHAR(60),
  mp_category_id  INTEGER REFERENCES mp_categories(id) ON DELETE SET NULL,
  published       BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_meal_plans_category ON meal_plans(mp_category_id);
CREATE INDEX idx_meal_plans_published ON meal_plans(published);

CREATE TABLE IF NOT EXISTS plan_variants (
  id               SERIAL PRIMARY KEY,
  meal_plan_id     INTEGER NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
  label            VARCHAR(120) NOT NULL,
  days_per_week    INTEGER NOT NULL DEFAULT 5,
  meals_per_day    INTEGER NOT NULL DEFAULT 3,
  weekly_price_mad NUMERIC(10,2) NOT NULL,
  published        BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX idx_plan_variants_meal_plan ON plan_variants(meal_plan_id);

CREATE TABLE IF NOT EXISTS meals (
  id            SERIAL PRIMARY KEY,
  slug          VARCHAR(160) NOT NULL UNIQUE,
  title         VARCHAR(200) NOT NULL,
  description   TEXT,
  meal_type     VARCHAR(50),
  category      VARCHAR(100) DEFAULT 'meal',
  kcal          INTEGER NOT NULL DEFAULT 0,
  protein       NUMERIC(6,2) DEFAULT 0,
  carbs         NUMERIC(6,2) DEFAULT 0,
  fat           NUMERIC(6,2) DEFAULT 0,
  fiber         NUMERIC(6,2) DEFAULT 0,
  sodium        NUMERIC(6,2) DEFAULT 0,
  sugar         NUMERIC(6,2) DEFAULT 0,
  cholesterol   NUMERIC(6,2) DEFAULT 0,
  saturated_fat NUMERIC(6,2) DEFAULT 0,
  allergens     JSONB DEFAULT '[]',
  tags          JSONB DEFAULT '[]',
  ingredients   JSONB DEFAULT '[]',
  image_url     TEXT,
  published     BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_meals_meal_type ON meals(meal_type);
CREATE INDEX idx_meals_published ON meals(published);

CREATE TABLE IF NOT EXISTS meal_plan_meals (
  id              SERIAL PRIMARY KEY,
  meal_plan_id    INTEGER NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
  meal_id         INTEGER NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
  plan_variant_id INTEGER REFERENCES plan_variants(id) ON DELETE SET NULL,
  sort_order      INTEGER DEFAULT 0
);

CREATE INDEX idx_mpm_meal_plan ON meal_plan_meals(meal_plan_id);
CREATE INDEX idx_mpm_meal ON meal_plan_meals(meal_id);

-- ===================== PRICING =====================

CREATE TABLE IF NOT EXISTS meal_type_prices (
  id             SERIAL PRIMARY KEY,
  plan_name      VARCHAR(100) NOT NULL,
  meal_type      VARCHAR(50) NOT NULL,
  base_price_mad NUMERIC(10,2) NOT NULL,
  is_active      BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS discount_rules (
  id                  SERIAL PRIMARY KEY,
  discount_type       VARCHAR(50) NOT NULL,
  condition_value     INTEGER NOT NULL,
  discount_percentage NUMERIC(5,2) NOT NULL,
  stackable           BOOLEAN NOT NULL DEFAULT false,
  is_active           BOOLEAN NOT NULL DEFAULT true,
  valid_from          TIMESTAMP,
  valid_to            TIMESTAMP,
  created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ===================== COMMERCE =====================

CREATE TABLE IF NOT EXISTS products (
  id               SERIAL PRIMARY KEY,
  name             VARCHAR(255) NOT NULL,
  slug             VARCHAR(200),
  description      TEXT,
  price            NUMERIC(10,2) NOT NULL DEFAULT 0,
  sale_price       NUMERIC(10,2),
  image_url        TEXT,
  category         VARCHAR(100),
  product_type     VARCHAR(50) DEFAULT 'product',
  tags             JSONB DEFAULT '[]',
  nutritional_info JSONB DEFAULT '{}',
  stock            INTEGER NOT NULL DEFAULT 0,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category, is_active);

CREATE TABLE IF NOT EXISTS cart_items (
  id             SERIAL PRIMARY KEY,
  user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_type      VARCHAR(20) NOT NULL DEFAULT 'product',
  product_id     INTEGER REFERENCES products(id) ON DELETE SET NULL,
  plan_name      VARCHAR(100),
  meal_types     JSONB,
  days_per_week  INTEGER,
  duration_weeks INTEGER,
  quantity       INTEGER NOT NULL DEFAULT 1,
  unit_price     NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_price    NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cart_items_user ON cart_items(user_id);

CREATE TABLE IF NOT EXISTS orders (
  id               SERIAL PRIMARY KEY,
  user_id          INTEGER REFERENCES users(id) ON DELETE SET NULL,
  plan_name        VARCHAR(100),
  total_amount     NUMERIC(10,2) NOT NULL DEFAULT 0,
  status           VARCHAR(50) NOT NULL DEFAULT 'pending',
  delivery_address TEXT,
  delivery_date    DATE,
  notes            TEXT,
  created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders(user_id, created_at DESC);
CREATE INDEX idx_orders_status ON orders(status);

CREATE TABLE IF NOT EXISTS order_items (
  id          SERIAL PRIMARY KEY,
  order_id    INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  INTEGER REFERENCES products(id) ON DELETE SET NULL,
  description VARCHAR(255),
  quantity    INTEGER NOT NULL DEFAULT 1,
  unit_price  NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ===================== SUBSCRIPTIONS & DELIVERIES =====================

CREATE TABLE IF NOT EXISTS subscriptions (
  id               SERIAL PRIMARY KEY,
  user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_variant_id  INTEGER REFERENCES plan_variants(id) ON DELETE SET NULL,
  status           VARCHAR(50) NOT NULL DEFAULT 'active',
  starts_at        TIMESTAMP,
  renews_at        TIMESTAMP,
  pause_start_date TIMESTAMP,
  pause_end_date   TIMESTAMP,
  pause_reason     TEXT,
  notes            TEXT,
  created_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id, status);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

CREATE TABLE IF NOT EXISTS deliveries (
  id              SERIAL PRIMARY KEY,
  subscription_id INTEGER REFERENCES subscriptions(id) ON DELETE SET NULL,
  order_id        INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  delivery_date   DATE NOT NULL,
  status          VARCHAR(50) NOT NULL DEFAULT 'pending',
  delivered_at    TIMESTAMP,
  notes           TEXT,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_deliveries_subscription ON deliveries(subscription_id, delivery_date);
CREATE INDEX idx_deliveries_order ON deliveries(order_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_deliveries_date ON deliveries(delivery_date);

-- ===================== ENGAGEMENT =====================

CREATE TABLE IF NOT EXISTS waitlist (
  id                  SERIAL PRIMARY KEY,
  first_name          VARCHAR(100),
  last_name           VARCHAR(100),
  email               VARCHAR(255) NOT NULL UNIQUE,
  phone               VARCHAR(50),
  preferred_meal_plan VARCHAR(100),
  city                VARCHAR(100),
  wants_notifications BOOLEAN DEFAULT true,
  position            INTEGER,
  status              VARCHAR(50) NOT NULL DEFAULT 'waiting',
  created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_waitlist_email ON waitlist(email);
CREATE INDEX idx_waitlist_status ON waitlist(status);

CREATE TABLE IF NOT EXISTS notifications (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  type        VARCHAR(50),
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS notification_preferences (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  push_enabled  BOOLEAN NOT NULL DEFAULT false,
  sms_enabled   BOOLEAN NOT NULL DEFAULT false,
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ===================== CMS =====================

CREATE TABLE IF NOT EXISTS content_hero (
  id                SERIAL PRIMARY KEY,
  desktop_image_url TEXT,
  mobile_image_url  TEXT,
  title             VARCHAR(200),
  description       TEXT,
  alt_text          VARCHAR(255),
  seo_title         VARCHAR(200),
  seo_description   TEXT,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ===================== LEGACY COMPAT =====================
-- These tables exist because some routes still reference them.
-- They can be removed once those routes are consolidated.

CREATE TABLE IF NOT EXISTS subscription_requests (
  id         SERIAL PRIMARY KEY,
  plan       VARCHAR(100),
  meals      TEXT,
  days       INTEGER,
  duration   INTEGER,
  total      NUMERIC(10,2),
  full_name  VARCHAR(255),
  email      VARCHAR(255),
  phone      VARCHAR(50),
  note       TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

COMMIT;
