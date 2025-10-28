-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  name TEXT NOT NULL,
  description TEXT,
  billing_period TEXT NOT NULL DEFAULT 'weekly', -- weekly, monthly, quarterly, yearly
  billing_interval INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  trial_period_days INTEGER DEFAULT 0,
  delivery_frequency TEXT NOT NULL DEFAULT 'weekly', -- weekly, biweekly, monthly
  items_per_delivery INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create subscription_plan_items table
CREATE TABLE IF NOT EXISTS subscription_plan_items (
  id SERIAL PRIMARY KEY,
  plan_id INTEGER REFERENCES subscription_plans(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER DEFAULT 1,
  is_optional BOOLEAN DEFAULT false,
  additional_price DECIMAL(10,2) DEFAULT 0,
  delivery_week INTEGER, -- which week in the cycle (for scheduling)
  delivery_day INTEGER, -- which day of the week (1-7)
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(plan_id, product_id)
);

-- Create active_subscriptions table
CREATE TABLE IF NOT EXISTS active_subscriptions (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES users(id),
  plan_id INTEGER REFERENCES subscription_plans(id),
  status TEXT DEFAULT 'active', -- active, paused, cancelled, expired
  start_date DATE DEFAULT CURRENT_DATE,
  next_billing_date DATE,
  next_delivery_date DATE,
  paused_until DATE,
  billing_amount DECIMAL(10,2),
  customizations JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create deliveries table
CREATE TABLE IF NOT EXISTS deliveries (
  id SERIAL PRIMARY KEY,
  subscription_id INTEGER REFERENCES active_subscriptions(id),
  order_id INTEGER REFERENCES orders(id),
  status TEXT DEFAULT 'scheduled', -- scheduled, preparing, shipped, delivered, failed
  scheduled_date DATE,
  delivery_window_start TIME,
  delivery_window_end TIME,
  actual_delivery_time TIMESTAMP,
  carrier TEXT,
  tracking_number TEXT,
  delivery_address JSONB,
  delivery_notes TEXT,
  admin_notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  customer_feedback TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscription_plans_product_id ON subscription_plans(product_id);
CREATE INDEX IF NOT EXISTS idx_subscription_plan_items_plan_id ON subscription_plan_items(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscription_plan_items_product_id ON subscription_plan_items(product_id);
CREATE INDEX IF NOT EXISTS idx_active_subscriptions_customer_id ON active_subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_active_subscriptions_plan_id ON active_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_active_subscriptions_status ON active_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_subscription_id ON deliveries(subscription_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);
