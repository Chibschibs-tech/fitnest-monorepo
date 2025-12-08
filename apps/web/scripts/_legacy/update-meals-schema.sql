-- Add missing nutrition columns to meals table
ALTER TABLE meals 
ADD COLUMN IF NOT EXISTS meal_type TEXT,
ADD COLUMN IF NOT EXISTS ingredients TEXT,
ADD COLUMN IF NOT EXISTS nutrition JSONB,
ADD COLUMN IF NOT EXISTS tags TEXT,
ADD COLUMN IF NOT EXISTS dietary_info TEXT,
ADD COLUMN IF NOT EXISTS allergens TEXT;

-- Update the existing meals table structure to match what we need
UPDATE meals SET 
  meal_type = category,
  ingredients = description,
  nutrition = jsonb_build_object(
    'calories', COALESCE(calories, 0),
    'protein', COALESCE(protein, 0),
    'carbs', COALESCE(carbs, 0),
    'fat', COALESCE(fat, 0)
  )
WHERE meal_type IS NULL;
