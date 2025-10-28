console.log("🧹 Removing test meals and restoring your real meals...")

try {
  const { neon } = await import("@neondatabase/serverless")
  const databaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!databaseUrl) {
    throw new Error("No database URL found!")
  }
  const sql = neon(databaseUrl)

  // Delete the test meals I just added
  await sql`DELETE FROM meals WHERE name LIKE '%Test%'`
  console.log("✅ Deleted test meals")

  // Check if your real meals are still there
  const existingMeals = await sql`SELECT COUNT(*) as count FROM meals`
  console.log(`Current meal count: ${existingMeals[0].count}`)

  // If no meals exist, add your real ones back
  if (existingMeals[0].count === 0) {
    console.log("Adding your real meals back...")

    const yourRealMeals = [
      {
        name: "Mashed Potato with Meatballs and Salad (Muscle Gain)",
        description: `Mashed Potato ingredients (for 200g): Potatoes: 200g, Butter: 25g, Milk or cream: 75ml, Salt and pepper: to taste. Meatball ingredients (for 4-5 meatballs): Ground beef: 200g, Breadcrumbs: 2x tablespoons, Egg: 1 large egg, Onion: 15g, Garlic: 5g, Parsley (optional): 1g, Salt and pepper: 1-5g. Salad ingredients (for 100g of mixed vegetables): Lettuce: 50g, Tomato: 60g, Cucumber: 30g, Bell pepper: 20g, Olive oil and vinegar dressing: 15g. A comforting and balanced plate featuring tender meatballs, creamy mashed potatoes, and a fresh, liberating salad.`,
        meal_type: "main",
        image_url: "/hearty-muscle-meal.png",
      },
      {
        name: "Mashed Potato with Meatballs and Salad (Weight Loss)",
        description: `Potatoes: 90g, Butter: 5g, Milk or cream: 25g, Salt and pepper: 1-2g, Ground beef: 70g, Breadcrumbs: 7g, Egg: 1g, Onion: 10g, Garlic: 5g, Parsley (optional): 0.5g, Salt and pepper: 1-2g, Lettuce: 50g, Tomato: 60g, Cucumber: 30g, Bell pepper: 20g, Olive oil and vinegar dressing: 5g. A comforting and balanced plate featuring tender meatballs, creamy mashed potatoes, and a fresh, liberating salad.`,
        meal_type: "main",
        image_url: "/vibrant-weight-loss-meal.png",
      },
      {
        name: "Mashed Potato with Meatballs and Salad (Stay Fit)",
        description: `Potatoes: 150g, Butter: 15g, Milk or cream: 50g, Salt and pepper: 1-2g (2-3 meatballs), Ground beef: 100g, Breadcrumbs: 10g, Egg: 11g, Onion: 10g, Garlic: 5g, Parsley (optional): 1g, Salt and pepper: 1-2g, Salad ingredients (for 100g of mixed vegetables): Tomato: 60g, Cucumber: 30g, Bell pepper: 20g, Olive oil and vinegar dressing: 10g. A comforting and balanced plate featuring tender meatballs, creamy mashed potatoes, and a fresh, liberating salad.`,
        meal_type: "main",
        image_url: "/vibrant-meal-prep.png",
      },
      // Add more of your real meals here...
    ]

    for (const meal of yourRealMeals) {
      await sql`
        INSERT INTO meals (name, description, meal_type, image_url)
        VALUES (${meal.name}, ${meal.description}, ${meal.meal_type}, ${meal.image_url})
      `
    }

    console.log(`✅ Added ${yourRealMeals.length} real meals back`)
  }

  const finalCount = await sql`SELECT COUNT(*) as count FROM meals`
  console.log(`Final meal count: ${finalCount[0].count}`)
} catch (error) {
  console.error("❌ Error:", error)
}
