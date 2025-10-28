// Add all remaining meals from the screenshots

console.log("Adding all remaining meals...")

try {
  const { neon } = await import("@neondatabase/serverless")
  const sql = neon(process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL)

  const allMeals = [
    // From first screenshot
    {
      name: "Quesadillas with Chicken, Guacamole, and Salsa",
      muscleGain: `Whole wheat tortillas: 100 grams (2 x 50g)
Cooked chicken breast: 150 grams, shredded
Shredded cheese (cheddar or mozzarella): 70 grams
Olive oil: 15g grams (1 tablespoon)
Guacamole ingredients (for 75g):
Avocado: 100 grams
Lime juice: 4 grams
Salt and pepper: to taste
Salsa ingredients (for 60g):
Tomato: 70 grams
Onion: 25 grams
Cilantro: 5 grams
Lime juice: 2 grams
Salt and pepper: to taste`,
      weightLoss: `Whole wheat tortillas: 50 grams
Cooked chicken breast: 80 grams, shredded
Shredded cheese (cheddar or mozzarella): 30 grams
Olive oil: 7 grams (½ tablespoon)
Guacamole ingredients (for 50g):
Avocado: 45 grams
Lime juice: 1.25 grams (¼ teaspoon)
Salt and pepper: to taste
Salsa ingredients (for 40g):
Tomato: 45 grams
Onion: 10 grams
Cilantro: 1 gram
Lime juice: 1.25 grams (¼ teaspoon)
Salt and pepper: to taste`,
      stayFit: `Whole wheat tortillas: 100 grams
Cooked chicken breast: 100 grams, shredded
Shredded cheese (cheddar or mozzarella): 50 grams
Olive oil: 10 grams (¾ tablespoon)
Guacamole ingredients (for 50g):
Avocado: 50 grams
Lime juice: 2.5 grams (½ teaspoon)
Salt and pepper: to taste
Salsa ingredients (for 50g):
Tomato: 50 grams
Onion: 15 grams
Cilantro: 2 grams
Lime juice: 2.5 grams (½ teaspoon)
Salt and pepper: to taste`,
      category: "main",
      description:
        "Lightly grilled tortillas filled with tender chicken, creamy guacamole, and fresh salsa. A Mexican-inspired dish that's full of flavor and perfectly balanced.",
    },
    {
      name: "Stuffed Pepper with Rice and Minced Meat + Veggie Salad",
      muscleGain: `Stuffed Pepper ingredients (for 3 small stuffed peppers):
Bell pepper: 450 grams
Cooked rice: 120 grams (3-9 tbsp cooked)
Ground beef: 210 grams
Onion: 45 grams (1½ medium)
Garlic: 4.5 grams (1½ cloves)
Tomato sauce: 100 grams (6-7 tbsp)
Olive oil: 15 grams (1 tablespoon, for sautéing)
Salt, pepper, and herbs: to taste
Veggie Salad ingredients (for ~250g salad):
Lettuce: 125 grams, chopped
Tomato: 250 grams (≈ 2½ small)
Cucumber: 130 grams (1½ medium)
Olive oil (for dressing): 5 grams (1 teaspoon, optional)`,
      weightLoss: `Stuffed Pepper ingredients (for 1 small stuffed pepper):
Bell pepper: 150 grams
Cooked rice: 40 grams (3 tbsp cooked)
Ground beef: 70 grams
Onion: 15 grams (½ medium)
Garlic: 1.5 grams (½ clove)
Tomato sauce: 35 grams (2-3 tbsp)
Olive oil: 7.5 grams (½ tablespoon, for sautéing)
Salt, pepper, and herbs: to taste
Veggie Salad ingredients (for 100g):
Lettuce: 50 grams, chopped
Tomato: 100 grams (1 small)
Cucumber: 50 grams (½ medium)
Olive oil and vinegar dressing: 5 grams (1 teaspoon)`,
      stayFit: `Stuffed Pepper ingredients (for 1 medium stuffed pepper):
Bell pepper: 200 grams
Cooked rice: 50 grams (uncooked weight)
Ground beef: 100 grams
Onion: 30 grams (½ medium)
Garlic: 3 grams (1 clove)
Tomato sauce: 50 grams (3-4 tbsp)
Olive oil: 15 grams (1 tablespoon, for sautéing)
Salt, pepper, and herbs: to taste
Veggie Salad ingredients (for 100g):
Lettuce: 50 grams, chopped
Tomato: 100 grams (1 small)
Cucumber: 50 grams (½ medium)
Olive oil and vinegar dressing: 10 grams (1 tablespoon)`,
      category: "main",
      description:
        "A hearty pepper stuffed with a savory blend of rice and lean minced meat, served with a colorful fresh salad. Nutritious, filling, and satisfying.",
    },
    {
      name: "Grilled Chicken Salad",
      muscleGain: `Grilled chicken breast: 200 grams
Mixed greens (lettuce, spinach, arugula, or mesclun): 100 grams
Cherry tomatoes: 60 grams
Cucumber: 60 grams
Shredded carrots: 40 grams
Sliced almonds: 30 grams
Balsamic vinaigrette dressing (on the side): 30 grams (2 tablespoons)`,
      weightLoss: `Grilled chicken breast: 120 grams
Mixed greens (lettuce, spinach, arugula, or mesclun): 100 grams
Cherry tomatoes: 40 grams
Cucumber: 40 grams
Shredded carrots: 25 grams
Sliced almonds: 15 grams
Balsamic vinaigrette dressing (on the side): 15 grams (1 tablespoon)`,
      stayFit: `Grilled chicken breast: 150 grams
Mixed greens (lettuce, spinach, arugula, or mesclun): 100 grams
Cherry tomatoes: 50 grams
Cucumber: 50 grams
Shredded carrots: 30 grams
Sliced almonds: 20 grams
Balsamic vinaigrette dressing (on the side): 30 grams (2 tablespoons)`,
      category: "main",
      description:
        "Slices of grilled chicken served on a bed of crisp mixed greens with fresh vegetables. High in protein and freshness - the perfect light yet satisfying meal.",
    },
    {
      name: "Turkey and Spinach Wrap",
      muscleGain: `Whole wheat tortilla: 1x large (105g)
Sliced turkey breast: 150 grams
Spinach: 60 grams
Avocado: 75 grams, sliced
Greek yogurt: 40 grams, as a spread`,
      weightLoss: `Whole wheat tortilla: ½ large (52g)
Sliced turkey breast: 80 grams
Spinach: 40 grams
Avocado: 30 grams, sliced
Greek yogurt: 20 grams, as a spread`,
      stayFit: `Whole wheat tortilla: 1 large (70g)
Sliced turkey breast: 100 grams
Spinach: 50 grams
Avocado: 50 grams, sliced
Greek yogurt: 30 grams, as a spread`,
      category: "main",
      description:
        "A soft wrap filled with lean turkey slices, baby spinach, and fresh avocado. A balanced and easy-to-eat meal ideal for a healthy break on the go.",
    },
    {
      name: "Breakfast Egg and Avocado Toast",
      muscleGain: `Whole grain bread: 3 slices (150g)
Eggs: 3 large (150g total)
Avocado: 125 grams, mashed
Cherry tomatoes: 60 grams, halved
Olive oil: 1 tablespoon (10g), drizzled`,
      weightLoss: `Whole grain bread: 2 slices (80g)
Eggs: 2 large (100g total)
Avocado: 100 grams, mashed
Cherry tomatoes: 50 grams, halved
Olive oil: 1 teaspoon (5g), drizzled`,
      stayFit: `Whole grain bread: 2 slices (80g)
Eggs: 2 large (100g total)
Avocado: 100 grams, mashed
Cherry tomatoes: 50 grams, halved
Olive oil: 1 teaspoon (5g), drizzled`,
      category: "breakfast",
      description:
        "A nutritious breakfast combining protein-rich eggs with creamy avocado on whole grain toast, topped with fresh cherry tomatoes.",
    },
    {
      name: "Overnight Oats",
      muscleGain: `Rolled oats: 75 grams
Greek yogurt: 150 grams
Mixed berries: 75 grams
Chia seeds: 15 grams
Honey or maple syrup (optional): 15 grams`,
      weightLoss: `Rolled oats: 40 grams
Greek yogurt: 80 grams
Mixed berries: 40 grams
Chia seeds: 8 grams
Honey or maple syrup (optional): 5 grams`,
      stayFit: `Rolled oats: 50 grams
Greek yogurt: 100 grams
Mixed berries: 50 grams
Chia seeds: 10 grams
Honey or maple syrup (optional): 10 grams`,
      category: "breakfast",
      description:
        "Creamy overnight oats with Greek yogurt, fresh berries, and chia seeds. A convenient make-ahead breakfast that's both nutritious and delicious.",
    },
    {
      name: "Greek Yogurt Parfait",
      muscleGain: `Greek yogurt: 200 grams
Granola (with nuts): 50 grams
Mixed berries: 75 grams`,
      weightLoss: `Greek yogurt: 150 grams
Granola (with nuts): 20 grams
Mixed berries: 40 grams`,
      stayFit: `Greek yogurt: 150 grams
Granola (with nuts): 30 grams
Mixed berries: 50 grams`,
      category: "breakfast",
      description:
        "Layers of creamy Greek yogurt, crunchy granola, and fresh mixed berries. A protein-packed breakfast that's as beautiful as it is nutritious.",
    },
    {
      name: "Chia Seed Pudding",
      muscleGain: `Chia seeds: 40 grams
Milk (plant-based): 200 grams
Honey or maple syrup (optional): 15 grams
Mixed fruit or nuts (topping): 70 grams`,
      weightLoss: `Chia seeds: 20 grams
Milk (plant-based): 150 grams
Honey or maple syrup (optional): 5 grams
Mixed fruit or nuts (topping): 30 grams`,
      stayFit: `Chia seeds: 30 grams
Milk (plant-based): 150 grams
Honey or maple syrup (optional): 10 grams
Mixed fruit or nuts (topping): 50 grams`,
      category: "breakfast",
      description:
        "A creamy, pudding-like breakfast made with nutrient-dense chia seeds and plant-based milk, topped with fresh fruits and nuts.",
    },
    {
      name: "Banana Bread Oatmeal",
      muscleGain: `Steel-cut oats: 75 grams
Ripe banana: 150 grams (1½ bananas)
Cinnamon: 5 grams
Honey or maple syrup (optional): 15 grams`,
      weightLoss: `Steel-cut oats: 40 grams
Ripe banana: 80 grams (about ¾ banana)
Cinnamon: 3 grams
Honey or maple syrup (optional): 5 grams`,
      stayFit: `Steel-cut oats: 50 grams
Ripe banana: 100 grams (1 medium banana)
Cinnamon: 5 grams
Honey or maple syrup (optional): 10 grams`,
      category: "breakfast",
      description:
        "Warm, comforting oatmeal with the flavors of banana bread. A hearty breakfast that provides sustained energy throughout the morning.",
    },
    {
      name: "Breakfast Burritos",
      muscleGain: `Whole wheat tortillas: 2 large (50g each = 100g)
Scrambled eggs: 150 grams
Black beans: 70 grams
Diced bell peppers: 40 grams
Shredded cheese: 40 grams`,
      weightLoss: `Whole wheat tortilla: 1 small (≈45g)
Cooked turkey sausage: 70 grams
Black beans: 40 grams
Diced bell peppers: 25 grams
Shredded cheese: 20 grams`,
      stayFit: `Whole wheat tortilla: 2 medium (≈50g each = 100g)
Cooked turkey sausage: 100 grams
Black beans: 50 grams
Diced bell peppers: 30 grams
Shredded cheese: 30 grams`,
      category: "breakfast",
      description:
        "Protein-packed breakfast burritos filled with eggs, beans, and vegetables. Perfect for a grab-and-go morning meal.",
    },
    {
      name: "Peanut Butter Banana Overnight Oats",
      muscleGain: `Rolled oats: 70 grams
Peanut butter: 40 grams
Ripe banana: 150 grams
Cocoa powder or chocolate chips: 15 grams`,
      weightLoss: `Rolled oats: 30 grams
Peanut butter: 20 grams
Ripe banana: 80 grams
Cocoa powder or chocolate chips: 5 grams`,
      stayFit: `Rolled oats: 50 grams
Peanut butter: 30 grams
Ripe banana: 100 grams
Cocoa powder or chocolate chips: 10 grams`,
      category: "breakfast",
      description:
        "Indulgent overnight oats with creamy peanut butter and sweet banana. A satisfying breakfast that tastes like dessert but provides lasting nutrition.",
    },
    {
      name: "Yogurt and Fruit Bowl",
      muscleGain: `Greek yogurt: 200 grams
Mixed berries: 70 grams
Sliced fruits (kiwi, mango, etc.): 75 grams
Granola or nuts: 30 grams`,
      weightLoss: `Greek yogurt: 120 grams
Mixed berries: 50 grams
Sliced fruits (kiwi, mango, etc.): 50 grams
Granola or nuts: 20 grams`,
      stayFit: `Greek yogurt: 150 grams
Mixed berries: 50 grams
Sliced fruits (kiwi, mango, etc.): 50 grams
Granola or nuts: 20 grams`,
      category: "breakfast",
      description:
        "A colorful bowl of creamy Greek yogurt topped with fresh seasonal fruits and crunchy granola. Simple, fresh, and nutritious.",
    },
    {
      name: "Chia Seed Breakfast Pudding",
      muscleGain: `Chia seeds: 40 grams
Milk (almond, coconut, etc.): 200 grams
Mixed berries: 75 grams
Greek yogurt: 50 grams`,
      weightLoss: `Chia seeds: 20 grams
Milk (almond, coconut, etc.): 150 grams
Mixed berries: 40 grams
Greek yogurt: 20 grams`,
      stayFit: `Chia seeds: 30 grams
Milk (almond, coconut, etc.): 150 grams
Mixed berries: 50 grams
Greek yogurt: 30 grams`,
      category: "breakfast",
      description:
        "A nutrient-dense breakfast pudding made with chia seeds, plant-based milk, and topped with fresh berries and Greek yogurt.",
    },
  ]

  let count = 0

  for (const meal of allMeals) {
    // Muscle Gain version
    await sql`
      INSERT INTO meals (name, description, "imageUrl", category, "createdAt", "updatedAt")
      VALUES (
        ${meal.name + " (Muscle Gain)"},
        ${meal.muscleGain + (meal.description ? "\n\n" + meal.description : "")},
        ${meal.category === "breakfast" ? "/layered-berry-parfait.png" : "/vibrant-nutrition-plate.png"},
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
        ${meal.weightLoss + (meal.description ? "\n\n" + meal.description : "")},
        ${meal.category === "breakfast" ? "/colorful-overnight-oats.png" : "/vibrant-weight-loss-meal.png"},
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
        ${meal.stayFit + (meal.description ? "\n\n" + meal.description : "")},
        ${meal.category === "breakfast" ? "/fluffy-protein-stack.png" : "/vibrant-meal-prep.png"},
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
