-- Create pricing tables for dynamic pricing engine
DROP TABLE IF EXISTS discount_rules CASCADE;
DROP TABLE IF EXISTS meal_type_prices CASCADE;

-- Table for meal type prices
CREATE TABLE meal_type_prices (
  id SERIAL PRIMARY KEY,
  plan_name TEXT NOT NULL,     -- Weight Loss | Stay Fit | Muscle Gain | extensible
  meal_type TEXT NOT NULL,     -- Breakfast | Lunch | Dinner | extensible
  base_price_mad NUMERIC(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(plan_name, meal_type)
);

-- Table for discount rules
CREATE TABLE discount_rules (
  id SERIAL PRIMARY KEY,
  discount_type TEXT NOT NULL,    -- duration_weeks | days_per_week | special_offer
  condition_value INT NOT NULL,   -- ex: 4 (semaines) ou 6 (jours)
  discount_percentage NUMERIC(5,4) NOT NULL, -- 0.10 = 10%
  stackable BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMP NULL,
  valid_to TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Seed data for meal type prices (3 plans × 3 meals = 9 prices)
INSERT INTO meal_type_prices (plan_name, meal_type, base_price_mad) VALUES
-- Weight Loss Plan
('Weight Loss', 'Breakfast', 45.00),
('Weight Loss', 'Lunch', 55.00),
('Weight Loss', 'Dinner', 50.00),
-- Stay Fit Plan
('Stay Fit', 'Breakfast', 50.00),
('Stay Fit', 'Lunch', 60.00),
('Stay Fit', 'Dinner', 55.00),
-- Muscle Gain Plan
('Muscle Gain', 'Breakfast', 55.00),
('Muscle Gain', 'Lunch', 70.00),
('Muscle Gain', 'Dinner', 65.00);

-- Seed data for discount rules
INSERT INTO discount_rules (discount_type, condition_value, discount_percentage, stackable) VALUES
-- Days per week discounts
('days_per_week', 5, 0.0300, true),  -- 5 days = 3%
('days_per_week', 6, 0.0500, true),  -- 6 days = 5%
('days_per_week', 7, 0.0700, true),  -- 7 days = 7%
-- Duration discounts
('duration_weeks', 2, 0.0500, true), -- 2 weeks = 5%
('duration_weeks', 4, 0.1000, true), -- 4 weeks = 10%
('duration_weeks', 8, 0.1500, true), -- 8 weeks = 15%
('duration_weeks', 12, 0.2000, true); -- 12 weeks = 20%

-- Create indexes for performance
CREATE INDEX idx_meal_type_prices_plan ON meal_type_prices(plan_name);
CREATE INDEX idx_meal_type_prices_active ON meal_type_prices(is_active);
CREATE INDEX idx_discount_rules_type ON discount_rules(discount_type);
CREATE INDEX idx_discount_rules_active ON discount_rules(is_active);
CREATE INDEX idx_discount_rules_dates ON discount_rules(valid_from, valid_to);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for auto-updating timestamps
CREATE TRIGGER update_meal_type_prices_updated_at 
    BEFORE UPDATE ON meal_type_prices 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discount_rules_updated_at 
    BEFORE UPDATE ON discount_rules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
