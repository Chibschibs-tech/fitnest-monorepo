-- Migration: Add meal_type column to meals table
-- Date: 2025-01-XX

-- Add meal_type column if it doesn't exist
ALTER TABLE meals 
ADD COLUMN IF NOT EXISTS meal_type VARCHAR(50) 
CHECK (meal_type IN ('Breakfast', 'Lunch', 'Dinner', 'Snack'));

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_meals_meal_type ON meals(meal_type);

