SELECT COUNT(*) as total_meals FROM meals;

SELECT id, name, description, calories, protein, carbs, fat, meal_type, category 
FROM meals 
ORDER BY id 
LIMIT 10;
