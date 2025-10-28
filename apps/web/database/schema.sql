-- Drop existing tables if they exist
DROP TABLE IF EXISTS meal_plan_items CASCADE;
DROP TABLE IF EXISTS meal_ingredients CASCADE;
DROP TABLE IF EXISTS meals CASCADE;
DROP TABLE IF EXISTS meal_plans CASCADE;

-- Create the centralized meals table (single source of truth)
CREATE TABLE meals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    meal_type VARCHAR(50) NOT NULL, -- breakfast, lunch, dinner, snack
    cuisine_type VARCHAR(100),
    prep_time_minutes INTEGER,
    cook_time_minutes INTEGER,
    servings INTEGER DEFAULT 1,
    difficulty_level VARCHAR(20), -- easy, medium, hard
    
    -- Ingredient data (JSON format)
    ingredients JSONB NOT NULL,
    
    -- USDA-calculated nutrition (cached for performance)
    nutrition JSONB NOT NULL,
    
    -- Metadata
    image_url VARCHAR(500),
    tags TEXT[], -- array of tags like 'high-protein', 'low-carb'
    dietary_info TEXT[], -- array like 'gluten-free', 'vegetarian'
    allergens TEXT[], -- array of allergens
    
    -- USDA verification tracking
    usda_verified BOOLEAN DEFAULT FALSE,
    last_nutrition_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    nutrition_source VARCHAR(100) DEFAULT 'USDA',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create meal plans table
CREATE TABLE meal_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    plan_type VARCHAR(100) NOT NULL, -- weight_loss, muscle_gain, balanced, keto
    target_calories_min INTEGER,
    target_calories_max INTEGER,
    weekly_price DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create meal plan items (references meals with portion adjustments)
CREATE TABLE meal_plan_items (
    id SERIAL PRIMARY KEY,
    meal_plan_id INTEGER REFERENCES meal_plans(id) ON DELETE CASCADE,
    meal_id INTEGER REFERENCES meals(id) ON DELETE CASCADE,
    
    -- Portion control for different plans
    portion_multiplier DECIMAL(4,2) DEFAULT 1.0, -- 0.8 for weight loss, 1.2 for muscle gain
    
    -- Meal scheduling
    meal_type VARCHAR(50) NOT NULL, -- breakfast, lunch, dinner, snack
    day_of_week INTEGER, -- 1-7, NULL for all days
    week_number INTEGER DEFAULT 1, -- for rotating menus
    
    -- Display order
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_meals_type ON meals(meal_type);
CREATE INDEX idx_meals_active ON meals(is_active);
CREATE INDEX idx_meals_nutrition ON meals USING GIN(nutrition);
CREATE INDEX idx_meal_plan_items_plan ON meal_plan_items(meal_plan_id);
CREATE INDEX idx_meal_plan_items_meal ON meal_plan_items(meal_id);

-- Create function to update nutrition timestamp
CREATE OR REPLACE FUNCTION update_nutrition_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_nutrition_update = CURRENT_TIMESTAMP;
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update timestamps
CREATE TRIGGER trigger_update_nutrition_timestamp
    BEFORE UPDATE OF nutrition ON meals
    FOR EACH ROW
    EXECUTE FUNCTION update_nutrition_timestamp();
