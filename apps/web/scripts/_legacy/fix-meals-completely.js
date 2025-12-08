console.log("🧹 Cleaning up meals database and adding your real meals...")

try {
  const { neon } = await import("@neondatabase/serverless")
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable not set!")
  }
  const sql = neon(databaseUrl)

  // 1. DELETE ALL EXISTING MEALS
  console.log("Deleting all existing meals...")
  await sql`DELETE FROM meals`
  console.log("✅ All existing meals deleted")

  // 2. INSERT YOUR REAL MEALS FROM SCREENSHOTS
  const yourMeals = [
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

A comforting and balanced plate featuring tender meatballs, creamy mashed potatoes, and a fresh, liberating salad. Perfect for satisfying both taste and nutrition.`,
      meal_type: "main",
      image_url: "/hearty-muscle-meal.png",
    },
    {
      name: "Mashed Potato with Meatballs and Salad (Weight Loss)",
      description: `Potatoes: 90g
Butter: 5g
Milk or cream: 25g
Salt and pepper: 1-2g
Ground beef: 70g
Breadcrumbs: 7g
Egg: 1g
Onion: 10g
Garlic: 5g
Parsley (optional): 0.5g
Salt and pepper: 1-2g
Lettuce: 50g
Tomato: 60g
Cucumber: 30g
Bell pepper: 20g
Olive oil and vinegar dressing: 5g

A comforting and balanced plate featuring tender meatballs, creamy mashed potatoes, and a fresh, liberating salad. Perfect for satisfying both taste and nutrition.`,
      meal_type: "main",
      image_url: "/vibrant-weight-loss-meal.png",
    },
    {
      name: "Mashed Potato with Meatballs and Salad (Stay Fit)",
      description: `Potatoes: 150g
Butter: 15g
Milk or cream: 50g
Salt and pepper: 1-2g (2-3 meatballs)
Ground beef: 100g
Breadcrumbs: 10g
Egg: 11g
Onion: 10g
Garlic: 5g
Parsley (optional): 1g
Salt and pepper: 1-2g
Salad ingredients (for 100g of mixed vegetables):
Tomato: 60g
Cucumber: 30g
Bell pepper: 20g
Olive oil and vinegar dressing: 10g

A comforting and balanced plate featuring tender meatballs, creamy mashed potatoes, and a fresh, liberating salad. Perfect for satisfying both taste and nutrition.`,
      meal_type: "main",
      image_url: "/vibrant-meal-prep.png",
    },
    {
      name: "Rice with Grilled Fish and Salad (Muscle Gain)",
      description: `Rice ingredients (for 180g cooked):
White or brown rice (uncooked): 100g
Water or broth: 240ml (240ml)
Grilled Fish ingredients (for 200g):
Fish fillet (e.g., cod, tilapia, or sea bass): 180g
Olive oil: 10g
Lemon juice: 10g
Garlic: 2g
Salt, pepper, and dill: 1g
Greens ingredients (for 100g):
Mixed greens (e.g., spinach, arugula, kale): 100g
Olive oil and vinegar dressing: 15g
Rice ingredients (for 180g cooked):
White or brown rice (uncooked): 100g
Water or broth: 240ml (240ml)

Perfectly grilled fish served with fluffy basmati rice and a crisp garden salad. A clean, classic dish that's great for energy and recovery.`,
      meal_type: "main",
      image_url: "/pan-seared-salmon-quinoa.png",
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
Rice ingredients (for 115g cooked):
White or brown rice (uncooked): 55g
Water or broth: 240ml (240ml)

Perfectly grilled fish served with fluffy basmati rice and a crisp garden salad. A clean, classic dish that's great for energy and recovery.`,
      meal_type: "main",
      image_url: "/vibrant-weight-loss-meal.png",
    },
    {
      name: "Rice with Grilled Fish and Salad (Stay Fit)",
      description: `Rice ingredients (for 180g cooked):
White or brown rice (uncooked): 75g
Water or broth: 240ml
Grilled Fish ingredients (for 170g):
Fish fillet (e.g., cod, tilapia, or sea bass): 160g
Olive oil: 10g
Lemon juice: 9g
Garlic: 2g
Salt, pepper, and herbs: to taste
Salad ingredients (for 100g of mixed greens):
Mixed greens: 65g
Tomato: 50g
Cucumber: 30g
Bell pepper: 20g
Olive oil and vinegar dressing: 10g
Rice ingredients (for 180g cooked):
White or brown rice (uncooked): 75g
Water or broth: 240ml (240ml)

Perfectly grilled fish served with fluffy basmati rice and a crisp garden salad. A clean, classic dish that's great for energy and recovery.`,
      meal_type: "main",
      image_url: "/vibrant-meal-prep.png",
    },
    {
      name: "Chicken Breast with Roasted Veggies and Mashed Potato (Muscle Gain)",
      description: `Chicken Breast ingredients (for 200g):
Chicken breast: 200g
Olive oil: 15g
Garlic powder: 0.5g
Paprika: 0.5g
Salt and pepper: 1-2g
Roasted Veggies ingredients (for 200g):
Broccoli: 100g
Carrots: 65g
Bell peppers: 65g
Olive oil: 15g
Salt, pepper, and herbs (rosemary or thyme): 1-2g
Mashed Potato ingredients (for 200g):
Potatoes: 200g
Butter: 25g
Milk or cream: 75g
Salt and pepper: 1-2g

Juicy grilled chicken breast, oven-roasted seasonal vegetables, and smooth mashed potatoes. A complete, satisfying meal that covers all the nutritional bases.`,
      meal_type: "main",
      image_url: "/grilled-chicken-vegetable-medley.png",
    },
    {
      name: "Chicken Breast with Roasted Veggies and Mashed Potato (Weight Loss)",
      description: `Chicken Breast ingredients (for 120g):
Chicken breast: 120g
Olive oil: 7g
Garlic powder: 0.25g
Paprika: 0.25g
Salt and pepper: 1g
Roasted Veggies ingredients (for 130g):
Broccoli: 60g
Carrots: 45g
Bell peppers: 40g
Olive oil: 7g
Salt, pepper, and herbs (rosemary or thyme): 1g
Mashed Potato ingredients (for 90g):
Potatoes: 90g
Butter: 5g
Milk or cream: 25g
Salt and pepper: 1g

Juicy grilled chicken breast, oven-roasted seasonal vegetables, and smooth mashed potatoes. A complete, satisfying meal that covers all the nutritional bases.`,
      meal_type: "main",
      image_url: "/vibrant-weight-loss-meal.png",
    },
    {
      name: "Chicken Breast with Roasted Veggies and Mashed Potato (Stay Fit)",
      description: `Chicken Breast ingredients (for 160g):
Chicken breast: 160g
Olive oil: 10g
Garlic powder: 0.5g
Paprika: 0.5g
Salt and pepper: 1g
Roasted Veggies ingredients (for 160g):
Broccoli: 80g
Carrots: 50g
Bell peppers: 50g
Olive oil: 10g
Salt, pepper, and herbs (rosemary or thyme): 1g
Mashed Potato ingredients (for 150g):
Potatoes: 150g
Butter: 15g
Milk or cream: 50g
Salt and pepper: 1g

Juicy grilled chicken breast, oven-roasted seasonal vegetables, and smooth mashed potatoes. A complete, satisfying meal that covers all the nutritional bases.`,
      meal_type: "main",
      image_url: "/vibrant-meal-prep.png",
    },
    {
      name: "Grilled Salmon with Greens and Rice (Muscle Gain)",
      description: `Grilled Salmon ingredients (for 200g):
Salmon fillet: 200g
Olive oil: 15g
Lemon juice: 10g
Garlic: 2g
Salt, pepper, and dill: 1g
Greens ingredients (for 100g):
Mixed greens (e.g., spinach, arugula, kale): 100g
Olive oil and vinegar dressing: 15g
Rice ingredients (for 200g cooked):
White or brown rice (uncooked): 100g
Water or broth: 240ml (240ml)

Rich in healthy fats, this grilled salmon fillet is served with aromatic rice and steamed greens. A clean, classic dish that's great for energy and recovery.`,
      meal_type: "main",
      image_url: "/pan-seared-salmon-quinoa.png",
    },
    {
      name: "Grilled Salmon with Greens and Rice (Weight Loss)",
      description: `Grilled Salmon ingredients (for 130g):
Salmon fillet: 130g
Olive oil: 7g
Lemon juice: 5g
Garlic: 1g
Salt, pepper, and dill: 1g
Greens ingredients (for 70g):
Mixed greens (e.g., spinach, arugula, kale): 70g
Olive oil and vinegar dressing: 5g
Rice ingredients (for 180g cooked):
White or brown rice (uncooked): 55g
Water or broth: 240ml (240ml)

Rich in healthy fats, this grilled salmon fillet is served with aromatic rice and steamed greens. A clean, classic dish that's great for energy and recovery.`,
      meal_type: "main",
      image_url: "/vibrant-weight-loss-meal.png",
    },
    {
      name: "Grilled Salmon with Greens and Rice (Stay Fit)",
      description: `Grilled Salmon ingredients (for 170g):
Salmon fillet: 170g
Olive oil: 10g
Lemon juice: 10g
Garlic: 1g
Salt, pepper, and dill: 1g
Greens ingredients (for 85g):
Mixed greens (e.g., spinach, arugula, kale): 85g
Olive oil and vinegar dressing: 10g
Rice ingredients (for 180g cooked):
White or brown rice (uncooked): 75g
Water or broth: 240ml (240ml)

Rich in healthy fats, this grilled salmon fillet is served with aromatic rice and steamed greens. A clean, classic dish that's great for energy and recovery.`,
      meal_type: "main",
      image_url: "/vibrant-meal-prep.png",
    },
    {
      name: "Quesadillas with Chicken, Guacamole, and Salsa (Muscle Gain)",
      description: `Whole wheat tortillas: 100g (2 x 50g)
Cooked chicken breast: 150g, shredded
Shredded cheese (cheddar or mozzarella): 70g
Olive oil: 15g (1 tablespoon)
Guacamole ingredients (for 75g):
Avocado: 100g
Lime juice: 4g
Salt and pepper: to taste
Salsa ingredients (for 60g):
Tomato: 70g
Onion: 25g
Cilantro: 5g
Lime juice: 2g
Salt and pepper: to taste

Lightly grilled tortillas filled with tender chicken, creamy guacamole, and fresh salsa. A Mexican-inspired dish that's full of flavor and perfectly balanced.`,
      meal_type: "main",
      image_url: "/vibrant-nutrition-plate.png",
    },
    {
      name: "Quesadillas with Chicken, Guacamole, and Salsa (Weight Loss)",
      description: `Whole wheat tortillas: 50g
Cooked chicken breast: 80g, shredded
Shredded cheese (cheddar or mozzarella): 30g
Olive oil: 7g (½ tablespoon)
Guacamole ingredients (for 50g):
Avocado: 45g
Lime juice: 1.25g (¼ teaspoon)
Salt and pepper: to taste
Salsa ingredients (for 40g):
Tomato: 45g
Onion: 10g
Cilantro: 1g
Lime juice: 1.25g (¼ teaspoon)
Salt and pepper: to taste

Lightly grilled tortillas filled with tender chicken, creamy guacamole, and fresh salsa. A Mexican-inspired dish that's full of flavor and perfectly balanced.`,
      meal_type: "main",
      image_url: "/vibrant-weight-loss-meal.png",
    },
    {
      name: "Quesadillas with Chicken, Guacamole, and Salsa (Stay Fit)",
      description: `Whole wheat tortillas: 100g
Cooked chicken breast: 100g, shredded
Shredded cheese (cheddar or mozzarella): 50g
Olive oil: 10g (¾ tablespoon)
Guacamole ingredients (for 50g):
Avocado: 50g
Lime juice: 2.5g (½ teaspoon)
Salt and pepper: to taste
Salsa ingredients (for 50g):
Tomato: 50g
Onion: 15g
Cilantro: 2g
Lime juice: 2.5g (½ teaspoon)
Salt and pepper: to taste

Lightly grilled tortillas filled with tender chicken, creamy guacamole, and fresh salsa. A Mexican-inspired dish that's full of flavor and perfectly balanced.`,
      meal_type: "main",
      image_url: "/vibrant-meal-prep.png",
    },
    {
      name: "Stuffed Pepper with Rice and Minced Meat + Veggie Salad (Muscle Gain)",
      description: `Stuffed Pepper ingredients (for 3 small stuffed peppers):
Bell pepper: 450g
Cooked rice: 120g (3-9 tbsp cooked)
Ground beef: 210g
Onion: 45g (1½ medium)
Garlic: 4.5g (1½ cloves)
Tomato sauce: 100g (6-7 tbsp)
Olive oil: 15g (1 tablespoon, for sautéing)
Salt, pepper, and herbs: to taste
Veggie Salad ingredients (for ~250g salad):
Lettuce: 125g, chopped
Tomato: 250g (≈ 2½ small)
Cucumber: 130g (1½ medium)
Olive oil (for dressing): 5g (1 teaspoon, optional)

A hearty pepper stuffed with a savory blend of rice and lean minced meat, served with a colorful fresh salad. Nutritious, filling, and satisfying.`,
      meal_type: "main",
      image_url: "/vibrant-nutrition-plate.png",
    },
    {
      name: "Stuffed Pepper with Rice and Minced Meat + Veggie Salad (Weight Loss)",
      description: `Stuffed Pepper ingredients (for 1 small stuffed pepper):
Bell pepper: 150g
Cooked rice: 40g (3 tbsp cooked)
Ground beef: 70g
Onion: 15g (½ medium)
Garlic: 1.5g (½ clove)
Tomato sauce: 35g (2-3 tbsp)
Olive oil: 7.5g (½ tablespoon, for sautéing)
Salt, pepper, and herbs: to taste
Veggie Salad ingredients (for 100g):
Lettuce: 50g, chopped
Tomato: 100g (1 small)
Cucumber: 50g (½ medium)
Olive oil and vinegar dressing: 5g (1 teaspoon)

A hearty pepper stuffed with a savory blend of rice and lean minced meat, served with a colorful fresh salad. Nutritious, filling, and satisfying.`,
      meal_type: "main",
      image_url: "/vibrant-weight-loss-meal.png",
    },
    {
      name: "Stuffed Pepper with Rice and Minced Meat + Veggie Salad (Stay Fit)",
      description: `Stuffed Pepper ingredients (for 1 medium stuffed pepper):
Bell pepper: 200g
Cooked rice: 50g (uncooked weight)
Ground beef: 100g
Onion: 30g (½ medium)
Garlic: 3g (1 clove)
Tomato sauce: 50g (3-4 tbsp)
Olive oil: 15g (1 tablespoon, for sautéing)
Salt, pepper, and herbs: to taste
Veggie Salad ingredients (for 100g):
Lettuce: 50g, chopped
Tomato: 100g (1 small)
Cucumber: 50g (½ medium)
Olive oil and vinegar dressing: 10g (1 tablespoon)

A hearty pepper stuffed with a savory blend of rice and lean minced meat, served with a colorful fresh salad. Nutritious, filling, and satisfying.`,
      meal_type: "main",
      image_url: "/vibrant-meal-prep.png",
    },
    {
      name: "Grilled Chicken Salad (Muscle Gain)",
      description: `Grilled chicken breast: 200g
Mixed greens (lettuce, spinach, arugula, or mesclun): 100g
Cherry tomatoes: 60g
Cucumber: 60g
Shredded carrots: 40g
Sliced almonds: 30g
Balsamic vinaigrette dressing (on the side): 30g (2 tablespoons)

Slices of grilled chicken served on a bed of crisp mixed greens with fresh vegetables. High in protein and freshness - the perfect light yet satisfying meal.`,
      meal_type: "main",
      image_url: "/vibrant-nutrition-plate.png",
    },
    {
      name: "Grilled Chicken Salad (Weight Loss)",
      description: `Grilled chicken breast: 120g
Mixed greens (lettuce, spinach, arugula, or mesclun): 100g
Cherry tomatoes: 40g
Cucumber: 40g
Shredded carrots: 25g
Sliced almonds: 15g
Balsamic vinaigrette dressing (on the side): 15g (1 tablespoon)

Slices of grilled chicken served on a bed of crisp mixed greens with fresh vegetables. High in protein and freshness - the perfect light yet satisfying meal.`,
      meal_type: "main",
      image_url: "/vibrant-weight-loss-meal.png",
    },
    {
      name: "Grilled Chicken Salad (Stay Fit)",
      description: `Grilled chicken breast: 150g
Mixed greens (lettuce, spinach, arugula, or mesclun): 100g
Cherry tomatoes: 50g
Cucumber: 50g
Shredded carrots: 30g
Sliced almonds: 20g
Balsamic vinaigrette dressing (on the side): 30g (2 tablespoons)

Slices of grilled chicken served on a bed of crisp mixed greens with fresh vegetables. High in protein and freshness - the perfect light yet satisfying meal.`,
      meal_type: "main",
      image_url: "/vibrant-meal-prep.png",
    },
    {
      name: "Turkey and Spinach Wrap (Muscle Gain)",
      description: `Whole wheat tortilla: 1x large (105g)
Sliced turkey breast: 150g
Spinach: 60g
Avocado: 75g, sliced
Greek yogurt: 40g, as a spread

A soft wrap filled with lean turkey slices, baby spinach, and fresh avocado. A balanced and easy-to-eat meal ideal for a healthy break on the go.`,
      meal_type: "main",
      image_url: "/fresh-tuna-avocado-wrap.png",
    },
    {
      name: "Turkey and Spinach Wrap (Weight Loss)",
      description: `Whole wheat tortilla: ½ large (52g)
Sliced turkey breast: 80g
Spinach: 40g
Avocado: 30g, sliced
Greek yogurt: 20g, as a spread

A soft wrap filled with lean turkey slices, baby spinach, and fresh avocado. A balanced and easy-to-eat meal ideal for a healthy break on the go.`,
      meal_type: "main",
      image_url: "/vibrant-weight-loss-meal.png",
    },
    {
      name: "Turkey and Spinach Wrap (Stay Fit)",
      description: `Whole wheat tortilla: 1 large (70g)
Sliced turkey breast: 100g
Spinach: 50g
Avocado: 50g, sliced
Greek yogurt: 30g, as a spread

A soft wrap filled with lean turkey slices, baby spinach, and fresh avocado. A balanced and easy-to-eat meal ideal for a healthy break on the go.`,
      meal_type: "main",
      image_url: "/vibrant-meal-prep.png",
    },
    // BREAKFAST MEALS
    {
      name: "Breakfast Egg and Avocado Toast (Muscle Gain)",
      description: `Whole grain bread: 3 slices (150g)
Eggs: 3 large (150g total)
Avocado: 125g, mashed
Cherry tomatoes: 60g, halved
Olive oil: 1 tablespoon (10g), drizzled

A nutritious breakfast combining protein-rich eggs with creamy avocado on whole grain toast, topped with fresh cherry tomatoes.`,
      meal_type: "breakfast",
      image_url: "/fluffy-egg-white-omelette.png",
    },
    {
      name: "Breakfast Egg and Avocado Toast (Weight Loss)",
      description: `Whole grain bread: 2 slices (80g)
Eggs: 2 large (100g total)
Avocado: 100g, mashed
Cherry tomatoes: 50g, halved
Olive oil: 1 teaspoon (5g), drizzled

A nutritious breakfast combining protein-rich eggs with creamy avocado on whole grain toast, topped with fresh cherry tomatoes.`,
      meal_type: "breakfast",
      image_url: "/colorful-overnight-oats.png",
    },
    {
      name: "Breakfast Egg and Avocado Toast (Stay Fit)",
      description: `Whole grain bread: 2 slices (80g)
Eggs: 2 large (100g total)
Avocado: 100g, mashed
Cherry tomatoes: 50g, halved
Olive oil: 1 teaspoon (5g), drizzled

A nutritious breakfast combining protein-rich eggs with creamy avocado on whole grain toast, topped with fresh cherry tomatoes.`,
      meal_type: "breakfast",
      image_url: "/fluffy-protein-stack.png",
    },
    {
      name: "Overnight Oats (Muscle Gain)",
      description: `Rolled oats: 75g
Greek yogurt: 150g
Mixed berries: 75g
Chia seeds: 15g
Honey or maple syrup (optional): 15g

Creamy overnight oats with Greek yogurt, fresh berries, and chia seeds. A convenient make-ahead breakfast that's both nutritious and delicious.`,
      meal_type: "breakfast",
      image_url: "/colorful-overnight-oats.png",
    },
    {
      name: "Overnight Oats (Weight Loss)",
      description: `Rolled oats: 40g
Greek yogurt: 80g
Mixed berries: 40g
Chia seeds: 8g
Honey or maple syrup (optional): 5g

Creamy overnight oats with Greek yogurt, fresh berries, and chia seeds. A convenient make-ahead breakfast that's both nutritious and delicious.`,
      meal_type: "breakfast",
      image_url: "/colorful-overnight-oats.png",
    },
    {
      name: "Overnight Oats (Stay Fit)",
      description: `Rolled oats: 50g
Greek yogurt: 100g
Mixed berries: 50g
Chia seeds: 10g
Honey or maple syrup (optional): 10g

Creamy overnight oats with Greek yogurt, fresh berries, and chia seeds. A convenient make-ahead breakfast that's both nutritious and delicious.`,
      meal_type: "breakfast",
      image_url: "/fluffy-protein-stack.png",
    },
    {
      name: "Greek Yogurt Parfait (Muscle Gain)",
      description: `Greek yogurt: 200g
Granola (with nuts): 50g
Mixed berries: 75g

Layers of creamy Greek yogurt, crunchy granola, and fresh mixed berries. A protein-packed breakfast that's as beautiful as it is nutritious.`,
      meal_type: "breakfast",
      image_url: "/layered-berry-parfait.png",
    },
    {
      name: "Greek Yogurt Parfait (Weight Loss)",
      description: `Greek yogurt: 150g
Granola (with nuts): 20g
Mixed berries: 40g

Layers of creamy Greek yogurt, crunchy granola, and fresh mixed berries. A protein-packed breakfast that's as beautiful as it is nutritious.`,
      meal_type: "breakfast",
      image_url: "/colorful-overnight-oats.png",
    },
    {
      name: "Greek Yogurt Parfait (Stay Fit)",
      description: `Greek yogurt: 150g
Granola (with nuts): 30g
Mixed berries: 50g

Layers of creamy Greek yogurt, crunchy granola, and fresh mixed berries. A protein-packed breakfast that's as beautiful as it is nutritious.`,
      meal_type: "breakfast",
      image_url: "/fluffy-protein-stack.png",
    },
    {
      name: "Chia Seed Pudding (Muscle Gain)",
      description: `Chia seeds: 40g
Milk (plant-based): 200g
Honey or maple syrup (optional): 15g
Mixed fruit or nuts (topping): 70g

A creamy, pudding-like breakfast made with nutrient-dense chia seeds and plant-based milk, topped with fresh fruits and nuts.`,
      meal_type: "breakfast",
      image_url: "/layered-berry-parfait.png",
    },
    {
      name: "Chia Seed Pudding (Weight Loss)",
      description: `Chia seeds: 20g
Milk (plant-based): 150g
Honey or maple syrup (optional): 5g
Mixed fruit or nuts (topping): 30g

A creamy, pudding-like breakfast made with nutrient-dense chia seeds and plant-based milk, topped with fresh fruits and nuts.`,
      meal_type: "breakfast",
      image_url: "/colorful-overnight-oats.png",
    },
    {
      name: "Chia Seed Pudding (Stay Fit)",
      description: `Chia seeds: 30g
Milk (plant-based): 150g
Honey or maple syrup (optional): 10g
Mixed fruit or nuts (topping): 50g

A creamy, pudding-like breakfast made with nutrient-dense chia seeds and plant-based milk, topped with fresh fruits and nuts.`,
      meal_type: "breakfast",
      image_url: "/fluffy-protein-stack.png",
    },
    {
      name: "Banana Bread Oatmeal (Muscle Gain)",
      description: `Steel-cut oats: 75g
Ripe banana: 150g (1½ bananas)
Cinnamon: 5g
Honey or maple syrup (optional): 15g

Warm, comforting oatmeal with the flavors of banana bread. A hearty breakfast that provides sustained energy throughout the morning.`,
      meal_type: "breakfast",
      image_url: "/colorful-overnight-oats.png",
    },
    {
      name: "Banana Bread Oatmeal (Weight Loss)",
      description: `Steel-cut oats: 40g
Ripe banana: 80g (about ¾ banana)
Cinnamon: 3g
Honey or maple syrup (optional): 5g

Warm, comforting oatmeal with the flavors of banana bread. A hearty breakfast that provides sustained energy throughout the morning.`,
      meal_type: "breakfast",
      image_url: "/colorful-overnight-oats.png",
    },
    {
      name: "Banana Bread Oatmeal (Stay Fit)",
      description: `Steel-cut oats: 50g
Ripe banana: 100g (1 medium banana)
Cinnamon: 5g
Honey or maple syrup (optional): 10g

Warm, comforting oatmeal with the flavors of banana bread. A hearty breakfast that provides sustained energy throughout the morning.`,
      meal_type: "breakfast",
      image_url: "/fluffy-protein-stack.png",
    },
    {
      name: "Breakfast Burritos (Muscle Gain)",
      description: `Whole wheat tortillas: 2 large (50g each = 100g)
Scrambled eggs: 150g
Black beans: 70g
Diced bell peppers: 40g
Shredded cheese: 40g

Protein-packed breakfast burritos filled with eggs, beans, and vegetables. Perfect for a grab-and-go morning meal.`,
      meal_type: "breakfast",
      image_url: "/fluffy-egg-white-omelette.png",
    },
    {
      name: "Breakfast Burritos (Weight Loss)",
      description: `Whole wheat tortilla: 1 small (≈45g)
Cooked turkey sausage: 70g
Black beans: 40g
Diced bell peppers: 25g
Shredded cheese: 20g

Protein-packed breakfast burritos filled with eggs, beans, and vegetables. Perfect for a grab-and-go morning meal.`,
      meal_type: "breakfast",
      image_url: "/colorful-overnight-oats.png",
    },
    {
      name: "Breakfast Burritos (Stay Fit)",
      description: `Whole wheat tortilla: 2 medium (≈50g each = 100g)
Cooked turkey sausage: 100g
Black beans: 50g
Diced bell peppers: 30g
Shredded cheese: 30g

Protein-packed breakfast burritos filled with eggs, beans, and vegetables. Perfect for a grab-and-go morning meal.`,
      meal_type: "breakfast",
      image_url: "/fluffy-protein-stack.png",
    },
    {
      name: "Peanut Butter Banana Overnight Oats (Muscle Gain)",
      description: `Rolled oats: 70g
Peanut butter: 40g
Ripe banana: 150g
Cocoa powder or chocolate chips: 15g

Indulgent overnight oats with creamy peanut butter and sweet banana. A satisfying breakfast that tastes like dessert but provides lasting nutrition.`,
      meal_type: "breakfast",
      image_url: "/colorful-overnight-oats.png",
    },
    {
      name: "Peanut Butter Banana Overnight Oats (Weight Loss)",
      description: `Rolled oats: 30g
Peanut butter: 20g
Ripe banana: 80g
Cocoa powder or chocolate chips: 5g

Indulgent overnight oats with creamy peanut butter and sweet banana. A satisfying breakfast that tastes like dessert but provides lasting nutrition.`,
      meal_type: "breakfast",
      image_url: "/colorful-overnight-oats.png",
    },
    {
      name: "Peanut Butter Banana Overnight Oats (Stay Fit)",
      description: `Rolled oats: 50g
Peanut butter: 30g
Ripe banana: 100g
Cocoa powder or chocolate chips: 10g

Indulgent overnight oats with creamy peanut butter and sweet banana. A satisfying breakfast that tastes like dessert but provides lasting nutrition.`,
      meal_type: "breakfast",
      image_url: "/fluffy-protein-stack.png",
    },
    {
      name: "Yogurt and Fruit Bowl (Muscle Gain)",
      description: `Greek yogurt: 200g
Mixed berries: 70g
Sliced fruits (kiwi, mango, etc.): 75g
Granola or nuts: 30g

A colorful bowl of creamy Greek yogurt topped with fresh seasonal fruits and crunchy granola. Simple, fresh, and nutritious.`,
      meal_type: "breakfast",
      image_url: "/layered-berry-parfait.png",
    },
    {
      name: "Yogurt and Fruit Bowl (Weight Loss)",
      description: `Greek yogurt: 120g
Mixed berries: 50g
Sliced fruits (kiwi, mango, etc.): 50g
Granola or nuts: 20g

A colorful bowl of creamy Greek yogurt topped with fresh seasonal fruits and crunchy granola. Simple, fresh, and nutritious.`,
      meal_type: "breakfast",
      image_url: "/colorful-overnight-oats.png",
    },
    {
      name: "Yogurt and Fruit Bowl (Stay Fit)",
      description: `Greek yogurt: 150g
Mixed berries: 50g
Sliced fruits (kiwi, mango, etc.): 50g
Granola or nuts: 20g

A colorful bowl of creamy Greek yogurt topped with fresh seasonal fruits and crunchy granola. Simple, fresh, and nutritious.`,
      meal_type: "breakfast",
      image_url: "/fluffy-protein-stack.png",
    },
    {
      name: "Chia Seed Breakfast Pudding (Muscle Gain)",
      description: `Chia seeds: 40g
Milk (almond, coconut, etc.): 200g
Mixed berries: 75g
Greek yogurt: 50g

A nutrient-dense breakfast pudding made with chia seeds, plant-based milk, and topped with fresh berries and Greek yogurt.`,
      meal_type: "breakfast",
      image_url: "/layered-berry-parfait.png",
    },
    {
      name: "Chia Seed Breakfast Pudding (Weight Loss)",
      description: `Chia seeds: 20g
Milk (almond, coconut, etc.): 150g
Mixed berries: 40g
Greek yogurt: 20g

A nutrient-dense breakfast pudding made with chia seeds, plant-based milk, and topped with fresh berries and Greek yogurt.`,
      meal_type: "breakfast",
      image_url: "/colorful-overnight-oats.png",
    },
    {
      name: "Chia Seed Breakfast Pudding (Stay Fit)",
      description: `Chia seeds: 30g
Milk (almond, coconut, etc.): 150g
Mixed berries: 50g
Greek yogurt: 30g

A nutrient-dense breakfast pudding made with chia seeds, plant-based milk, and topped with fresh berries and Greek yogurt.`,
      meal_type: "breakfast",
      image_url: "/fluffy-protein-stack.png",
    },
  ]

  // 3. INSERT ALL YOUR MEALS
  console.log(`Inserting ${yourMeals.length} meals...`)

  for (const meal of yourMeals) {
    await sql`
      INSERT INTO meals (name, description, meal_type, ingredients, nutrition, image_url, tags, dietary_info, allergens)
      VALUES (
        ${meal.name},
        ${meal.description},
        ${meal.meal_type},
        ${meal.description},
        ${"{}"},
        ${meal.image_url},
        ${"[]"},
        ${"[]"},
        ${"[]"}
      )
    `
  }

  console.log(`✅ Successfully inserted ${yourMeals.length} meals`)

  // 4. VERIFY COUNT
  const result = await sql`SELECT COUNT(*) as count FROM meals`
  console.log(`Database now has ${result[0].count} total meals`)
} catch (error) {
  console.error("❌ Error:", error)
}
