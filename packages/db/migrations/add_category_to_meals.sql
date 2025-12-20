-- Migration: Add category column to meals table
-- Date: 2025-01-XX

-- Add category column if it doesn't exist
ALTER TABLE meals 
ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'meal';

-- Update existing meals to have 'meal' category if null
UPDATE meals SET category = 'meal' WHERE category IS NULL;

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_meals_category ON meals(category);

