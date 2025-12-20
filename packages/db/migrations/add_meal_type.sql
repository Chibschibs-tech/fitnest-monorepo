-- Add meal_type and category columns to meals table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'meals' AND column_name = 'meal_type'
  ) THEN
    ALTER TABLE meals ADD COLUMN meal_type VARCHAR(50) CHECK (meal_type IN ('Breakfast', 'Lunch', 'Dinner', 'Snack'));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'meals' AND column_name = 'category'
  ) THEN
    ALTER TABLE meals ADD COLUMN category VARCHAR(100) DEFAULT 'meal';
  END IF;
END $$;



