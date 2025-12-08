console.log("🔧 Fixing meals with correct database connection...")

try {
  const { neon } = await import("@neondatabase/serverless")

  // Try the environment variable that works with your other APIs
  const databaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL

  if (!databaseUrl) {
    throw new Error("No database URL found")
  }

  console.log("Using database URL:", databaseUrl.substring(0, 20) + "...")
  const sql = neon(databaseUrl)

  // Test connection first
  const testResult = await sql`SELECT 1 as test`
  console.log("✅ Database connection successful")

  // Clear existing meals
  await sql`DELETE FROM meals`
  console.log("✅ Cleared existing meals")

  // Insert a few test meals first
  const testMeals = [
    {
      name: "Mashed Potato with Meatballs and Salad (Muscle Gain)",
      description: `Mashed Potato ingredients (for 200g):
Potatoes: 200g
Butter: 25g
Milk or cream: 75ml
Salt and pepper: to taste
Meatball ingredients (for 4-5 meatballs):
Ground beef: 200g
Breadcrumbs: 2x tablespoons
Egg: 1 large egg
Onion: 15g
Garlic: 5g
Parsley (optional): 1g
Salt and pepper: 1-5g
Salad ingredients (for 100g of mixed vegetables):
Lettuce: 50g
Tomato: 60g
Cucumber: 30g
Bell pepper: 20g
Olive oil and vinegar dressing: 15g

A comforting and balanced plate featuring tender meatballs, creamy mashed potatoes, and a fresh, liberating salad.`,
      meal_type: "main",
      image_url: "/hearty-muscle-meal.png",
    },
    {
      name: "Rice with Grilled Fish and Salad (Weight Loss)",
      description: `Rice ingredients (for 115g cooked):
White or brown rice (uncooked): 50g
Water or broth: 240g
Grilled Fish ingredients (for 130g):
Fish fillet (e.g., cod, tilapia, or sea bass): 100g
Olive oil: 7g
Lemon juice: 5g
Garlic: 2g
Salt, pepper, and herbs: 1-2g
Salad ingredients (for 100g):
Mixed greens (e.g., spinach, arugula, kale): 70g
Olive oil and vinegar dressing: 5g

Perfectly grilled fish served with fluffy basmati rice and a crisp garden salad.`,
      meal_type: "main",
      image_url: "/vibrant-weight-loss-meal.png",
    },
    {
      name: "Overnight Oats (Stay Fit)",
      description: `Rolled oats: 50g
Greek yogurt: 100g
Mixed berries: 50g
Chia seeds: 10g
Honey or maple syrup (optional): 10g

Creamy overnight oats with Greek yogurt, fresh berries, and chia seeds.`,
      meal_type: "breakfast",
      image_url: "/colorful-overnight-oats.png",
    },
  ]

  for (const meal of testMeals) {
    await sql`
      INSERT INTO meals (name, description, meal_type, image_url)
      VALUES (${meal.name}, ${meal.description}, ${meal.meal_type}, ${meal.image_url})
    `
  }

  const count = await sql`SELECT COUNT(*) as count FROM meals`
  console.log(`✅ Successfully inserted ${count[0].count} test meals`)
} catch (error) {
  console.error("❌ Error:", error)
}
