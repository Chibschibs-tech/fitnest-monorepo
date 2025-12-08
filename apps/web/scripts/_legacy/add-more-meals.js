// Add the additional meals from the second screenshot

console.log("Adding more meals from screenshot...")

try {
  const { neon } = await import("@neondatabase/serverless")
  const sql = neon(process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL)

  const additionalMeals = [
    {
      name: "Chicken Breast with Roasted Veggies and Mashed Potato",
      muscleGain: `Chicken Breast ingredients (for 200g):
Chicken breast: 200g
Olive oil: 15g
Garlic powder: 0.5g
Paprika: 0.5g
Salt and pepper: 1-2g
Roasted Veggies ingredients (for 200g):
Zucchini: 70g
Carrots: 65g
Bell peppers: 65g
Olive oil: 15g
Salt, pepper, and herbs (rosemary or thyme): 1-2g
Mashed Potato ingredients (for 200g):
Potatoes: 200g
Butter: 25g
Milk or cream: 75g
Salt and pepper: 1-2g`,
      weightLoss: `Chicken Breast ingredients (for 120g):
Chicken breast: 120g
Olive oil: 7g
Garlic powder: 0.25g
Paprika: 0.25g
Salt and pepper: 1g
Roasted Veggies ingredients (for 130g):
Zucchini: 45g
Carrots: 45g
Bell peppers: 40g
Olive oil: 7g
Salt, pepper, and herbs (rosemary or thyme): 1g
Mashed Potato ingredients (for 90g):
Potatoes: 90g
Butter: 5g
Milk or cream: 25g
Salt and pepper: 1g`,
      stayFit: `Chicken Breast ingredients (for 160g):
Chicken breast: 160g
Olive oil: 10g
Garlic powder: 0.5g
Paprika: 0.5g
Salt and pepper: 1g
Roasted Veggies ingredients (for 160g):
Zucchini: 55g
Carrots: 50g
Bell peppers: 55g
Olive oil: 10g
Salt, pepper, and herbs (rosemary or thyme): 1g
Mashed Potato ingredients (for 130g):
Potatoes: 130g
Butter: 15g
Milk or cream: 35g
Salt and pepper: 1g`,
      category: "main",
      description:
        "Juicy grilled chicken breast, oven-roasted seasonal vegetables, and smooth mashed potatoes. A complete, satisfying and nutritious meal.",
    },
    {
      name: "Grilled Salmon with Greens and Rice",
      muscleGain: `Grilled Salmon ingredients (for 200g):
Salmon fillet: 200g
Olive oil: 15g
Lemon juice: 15g
Salt, pepper, and dill: 1g
Greens ingredients (for 100g):
Mixed greens (e.g., spinach, arugula, kale): 100g
Olive oil and vinegar dressing: 15g
Rice ingredients (for 250g cooked):
White or brown rice (uncooked): 100g
Water or broth: 450ml (450ml)`,
      weightLoss: `Grilled Salmon ingredients (for 130g):
Salmon fillet: 130 grams
Olive oil: 7 grams
Lemon juice: 5 grams
Salt, pepper, and dill: 1 gram
Greens ingredients (for 70g):
Mixed greens (e.g., spinach, arugula, kale): 70 grams
Olive oil and vinegar dressing: 5 grams
Rice ingredients (for 115g cooked):
White or brown rice (uncooked): 55 grams
Water or broth: 240ml (240ml)`,
      stayFit: `Grilled Salmon ingredients (for 170g):
Salmon fillet: 170 grams
Olive oil: 10 grams
Lemon juice: 10 grams
Salt, pepper, and dill: 1 gram
Greens ingredients (for 85g):
Mixed greens (e.g., spinach, arugula, kale): 85 grams
Olive oil and vinegar dressing: 10 grams
Rice ingredients (for 180g cooked):
White or brown rice (uncooked): 75 grams
Water or broth: 340ml (340ml)`,
      category: "main",
      description:
        "Rich in healthy fats, this grilled salmon fillet is paired with aromatic rice and steamed greens. A clean, classic dish that supports both muscle growth and recovery.",
    },
  ]

  let count = 0

  for (const meal of additionalMeals) {
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

  console.log(`✅ Added ${count} more meals`)

  // Show total count
  const result = await sql`SELECT COUNT(*) as count FROM meals`
  console.log(`Database now has ${result[0].count} total meals`)
} catch (error) {
  console.error("Error:", error)
}
