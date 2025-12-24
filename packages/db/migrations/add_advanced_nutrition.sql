-- Add advanced nutrition fields to meals table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'meals' AND column_name = 'fiber'
  ) THEN
    ALTER TABLE meals ADD COLUMN fiber NUMERIC(6, 2) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'meals' AND column_name = 'sodium'
  ) THEN
    ALTER TABLE meals ADD COLUMN sodium NUMERIC(6, 2) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'meals' AND column_name = 'sugar'
  ) THEN
    ALTER TABLE meals ADD COLUMN sugar NUMERIC(6, 2) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'meals' AND column_name = 'cholesterol'
  ) THEN
    ALTER TABLE meals ADD COLUMN cholesterol NUMERIC(6, 2) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'meals' AND column_name = 'saturated_fat'
  ) THEN
    ALTER TABLE meals ADD COLUMN saturated_fat NUMERIC(6, 2) DEFAULT 0;
  END IF;
END $$;




