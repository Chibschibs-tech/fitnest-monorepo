// Create meals directly from the screenshot data

console.log("Creating meals from screenshot data...")

try {
  // Connect to database
  const { neon } = await import("@neondatabase/serverless")
  const sql = neon(process.env.DATABASE_URL)

  // Clear existing meals
  await sql`DELETE FROM meals`
  console.log("Cleared existing meals")

  // Meal data from screenshot
  const meals = [
    {
      name: "Mashed Potato with Meatballs and Salad",
      muscleGain: `Mashed Potato ingredients (for 200g):
Potatoes: 200 g
Butter: 25 g
Milk or cream: 75 ml
Salt and pepper: to taste
Meatball ingredients (for 4-5 meatballs):
Ground beef: 200g
Breadcrumbs: 2x tablespoons
Egg: 1 medium egg
Onion: 15g
Garlic: 2g
Parsley (optional): 1g
Salt and pepper: 1-2g
Olive oil: 5g
Salad ingredients (for 100g of mixed vegetables):
Lettuce: 50g
Tomato: 60g
Cucumber: 30g
Bell pepper: 20g
Olive oil and vinegar dressing: 15g`,
      weightLoss: `Potatoes: 90g
Butter: 5g
Milk or cream: 25g
Salt and pepper: 1-2g
Ground beef: 70g
Breadcrumbs: 7g
Egg: 1g
Onion: 10g
Garlic: 1g
Parsley (optional): 0.3g
Salt and pepper: 1-2g
Olive oil: 7g
Salad ingredients (for 100g of mixed vegetables):
Lettuce: 50g
Tomato: 60g
Cucumber: 30g
Bell pepper: 20g
Olive oil and vinegar dressing: 5g`,
      stayFit: `Butter: 15g
Milk or cream: 50g
Salt and pepper: 1-2g
Salad ingredients (for 2-3 meatballs):
Ground beef: 100g
Breadcrumbs: 10g
Egg: 11g
Onion: 15g
Garlic: 2g
Parsley (optional): 1g
Salt and pepper: 1-2g
Olive oil: 3g
Salad ingredients (for 100g of mixed vegetables):
Lettuce: 50g
Tomato: 60g
Cucumber: 30g
Bell pepper: 20g
Olive oil and vinegar dressing: 10g`,
      category: "main",
      description:
        "A comforting and balanced plate featuring tender meatballs, creamy mashed potatoes, and a fresh, liberally dressed salad that provides essential nutrients and satisfying taste and nutrition.",
    },
    {
      name: "Rice with Grilled Fish and Salad",
      muscleGain: `Rice ingredients (for 180g cooked):
White or brown rice: 75g
Water or broth: 300g
Grilled Fish ingredients (for 1 fillet):
Fish fillet (e.g., cod, tilapia, or sea bass): 180g
Olive oil: 10g
Lemon juice: 10g
Garlic: 2g
Salt, pepper, and herbs: 1-2g
Salad ingredients (for 100g of mixed greens):
Mixed greens: 50g
Tomato: 60g
Cucumber: 30g
Carrots: 15g
Salad dressing: 10g (olive oil and lemon juice)`,
      weightLoss: `Rice ingredients (for 115g cooked):
White or brown rice: 50g
Water or broth: 240g
Grilled Fish ingredients (for 1 small fillet):
Fish fillet (e.g., cod, tilapia, or sea bass): 100g
Olive oil: 2g
Lemon juice: 10g
Garlic: 2g
Salt, pepper, and herbs: 1-2g
Salad ingredients (for 100g of mixed greens):
Mixed greens: 40g
Tomato: 50g
Cucumber: 15g
Carrots: 15g
Salad dressing: 10g (olive oil and lemon juice)`,
      stayFit: `Rice ingredients (for ~180g cooked):
White or brown rice: 75g
Water or broth: 300g
Grilled Fish ingredients (for 1 fillet):
Fish fillet (e.g., cod, tilapia, or sea bass): 150g
Olive oil: 10g
Lemon juice: 10g
Garlic: 2g
Salt, pepper, and herbs: to taste
Salad ingredients (for 100g of mixed greens):
Mixed greens: 45g
Tomato: 50g
Cucumber: 30g
Carrots: 15g
Salad dressing: 10g (olive oil and lemon juice)`,
      category: "main",
      description:
        "Perfectly grilled fish served with fluffy basmati rice and a crisp garden salad, providing lean protein and complex carbs great for energy and recovery.",
    },
  ]

  let count = 0

  // Insert each meal variation
  for (const meal of meals) {
    // Muscle Gain version
    await sql`
      INSERT INTO meals (name, description, "imageUrl", category, "createdAt", "updatedAt")
      VALUES (
        ${meal.name + " (Muscle Gain)"},
        ${meal.muscleGain + "\n\n" + meal.description},
        ${"/vibrant-nutrition-plate.png"},
        ${meal.category},
        NOW(),
        NOW()
      )
    `
    count++

    // Weight Loss version
    await sql`
      INSERT INTO meals (name, description, "imageUrl", category, "createdAt", "updatedAt")
      VALUES (
        ${meal.name + " (Weight Loss)"},
        ${meal.weightLoss + "\n\n" + meal.description},
        ${"/vibrant-weight-loss-meal.png"},
        ${meal.category},
        NOW(),
        NOW()
      )
    `
    count++

    // Stay Fit version
    await sql`
      INSERT INTO meals (name, description, "imageUrl", category, "createdAt", "updatedAt")
      VALUES (
        ${meal.name + " (Stay Fit)"},
        ${meal.stayFit + "\n\n" + meal.description},
        ${"/vibrant-meal-prep.png"},
        ${meal.category},
        NOW(),
        NOW()
      )
    `
    count++
  }

  console.log(`✅ Created ${count} meals`)

  // Verify
  const result = await sql`SELECT COUNT(*) as count FROM meals`
  console.log(`Database now has ${result[0].count} meals`)

  // Show created meals
  const createdMeals = await sql`SELECT name FROM meals ORDER BY name`
  console.log("Created meals:")
  createdMeals.forEach((meal) => console.log(`- ${meal.name}`))
} catch (error) {
  console.error("Error:", error)
}
