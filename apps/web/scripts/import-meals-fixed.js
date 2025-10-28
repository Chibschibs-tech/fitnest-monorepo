// Fixed meal import script using correct database schema

const csvUrl =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Meals%20to%20upload-sgjDCBc0b6BhC2lINcM8Q2RrVTJ1HG.csv"

console.log("🚀 Starting meal import with correct schema...")

try {
  // Fetch CSV
  const response = await fetch(csvUrl)
  const csvContent = await response.text()

  console.log("📄 CSV fetched successfully")

  // Parse CSV
  const lines = csvContent.split("\n").filter((line) => line.trim())
  console.log(`📊 Found ${lines.length} lines in CSV`)

  // Parse meals
  const meals = []
  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVRow(lines[i])
    if (row.length >= 4 && row[0].trim()) {
      meals.push({
        name: row[0].trim(),
        muscleGain: row[1].trim(),
        weightLoss: row[2].trim(),
        stayFit: row[3].trim(),
      })
    }
  }

  console.log(`✅ Parsed ${meals.length} meals`)

  // Connect to database using correct environment variable
  const { neon } = await import("@neondatabase/serverless")
  const sql = neon(process.env.DATABASE_URL) // Using DATABASE_URL as per your env vars

  console.log("🗄️ Connected to database")

  // Clear existing meals
  await sql`DELETE FROM meals`
  console.log("🧹 Cleared existing meals")

  let insertedCount = 0

  // Insert each meal for each plan type
  for (const meal of meals) {
    // Muscle Gain version
    if (meal.muscleGain) {
      await sql`
        INSERT INTO meals (name, description, calories, protein, carbs, fat, "imageUrl", category, "createdAt", "updatedAt")
        VALUES (
          ${meal.name + " (Muscle Gain)"},
          ${meal.muscleGain},
          ${estimateCalories(meal.muscleGain)},
          ${estimateProtein(meal.muscleGain)},
          ${estimateCarbs(meal.muscleGain)},
          ${estimateFat(meal.muscleGain)},
          ${getImageUrl(meal.name)},
          ${getCategory(meal.name)},
          NOW(),
          NOW()
        )
      `
      insertedCount++
    }

    // Weight Loss version
    if (meal.weightLoss) {
      await sql`
        INSERT INTO meals (name, description, calories, protein, carbs, fat, "imageUrl", category, "createdAt", "updatedAt")
        VALUES (
          ${meal.name + " (Weight Loss)"},
          ${meal.weightLoss},
          ${estimateCalories(meal.weightLoss)},
          ${estimateProtein(meal.weightLoss)},
          ${estimateCarbs(meal.weightLoss)},
          ${estimateFat(meal.weightLoss)},
          ${getImageUrl(meal.name)},
          ${getCategory(meal.name)},
          NOW(),
          NOW()
        )
      `
      insertedCount++
    }

    // Stay Fit version
    if (meal.stayFit) {
      await sql`
        INSERT INTO meals (name, description, calories, protein, carbs, fat, "imageUrl", category, "createdAt", "updatedAt")
        VALUES (
          ${meal.name + " (Stay Fit)"},
          ${meal.stayFit},
          ${estimateCalories(meal.stayFit)},
          ${estimateProtein(meal.stayFit)},
          ${estimateCarbs(meal.stayFit)},
          ${estimateFat(meal.stayFit)},
          ${getImageUrl(meal.name)},
          ${getCategory(meal.name)},
          NOW(),
          NOW()
        )
      `
      insertedCount++
    }
  }

  console.log(`🎉 Successfully inserted ${insertedCount} meals into database`)

  // Verify insertion
  const result = await sql`SELECT COUNT(*) as count FROM meals`
  console.log(`✅ Database now contains ${result[0].count} meals`)

  // Show sample meals
  const sampleMeals = await sql`SELECT name, calories, protein FROM meals LIMIT 3`
  console.log("📋 Sample meals:", sampleMeals)
} catch (error) {
  console.error("❌ Error:", error)
}

function parseCSVRow(row) {
  const result = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < row.length; i++) {
    const char = row[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ""))
      current = ""
    } else {
      current += char
    }
  }

  result.push(current.trim().replace(/^"|"$/g, ""))
  return result
}

function estimateCalories(ingredients) {
  const lines = ingredients.split("\n")
  let totalCalories = 0

  for (const line of lines) {
    const match = line.match(/(\d+)\s*grams?/i)
    if (match) {
      const grams = Number.parseInt(match[1])
      if (line.toLowerCase().includes("chia")) totalCalories += grams * 4.86
      else if (line.toLowerCase().includes("yogurt")) totalCalories += grams * 0.59
      else if (line.toLowerCase().includes("berries")) totalCalories += grams * 0.57
      else if (line.toLowerCase().includes("milk")) totalCalories += grams * 0.17
      else if (line.toLowerCase().includes("chicken")) totalCalories += grams * 1.65
      else if (line.toLowerCase().includes("salmon")) totalCalories += grams * 2.08
      else if (line.toLowerCase().includes("quinoa")) totalCalories += grams * 1.2
      else if (line.toLowerCase().includes("rice")) totalCalories += grams * 1.12
      else totalCalories += grams * 1.0
    }
  }

  return Math.round(totalCalories)
}

function estimateProtein(ingredients) {
  const lines = ingredients.split("\n")
  let totalProtein = 0

  for (const line of lines) {
    const match = line.match(/(\d+)\s*grams?/i)
    if (match) {
      const grams = Number.parseInt(match[1])
      if (line.toLowerCase().includes("chia")) totalProtein += grams * 0.17
      else if (line.toLowerCase().includes("yogurt")) totalProtein += grams * 0.1
      else if (line.toLowerCase().includes("chicken")) totalProtein += grams * 0.31
      else if (line.toLowerCase().includes("salmon")) totalProtein += grams * 0.25
      else if (line.toLowerCase().includes("quinoa")) totalProtein += grams * 0.044
    }
  }

  return Math.round(totalProtein)
}

function estimateCarbs(ingredients) {
  const lines = ingredients.split("\n")
  let totalCarbs = 0

  for (const line of lines) {
    const match = line.match(/(\d+)\s*grams?/i)
    if (match) {
      const grams = Number.parseInt(match[1])
      if (line.toLowerCase().includes("chia")) totalCarbs += grams * 0.42
      else if (line.toLowerCase().includes("berries")) totalCarbs += grams * 0.14
      else if (line.toLowerCase().includes("quinoa")) totalCarbs += grams * 0.22
      else if (line.toLowerCase().includes("rice")) totalCarbs += grams * 0.23
    }
  }

  return Math.round(totalCarbs)
}

function estimateFat(ingredients) {
  const lines = ingredients.split("\n")
  let totalFat = 0

  for (const line of lines) {
    const match = line.match(/(\d+)\s*grams?/i)
    if (match) {
      const grams = Number.parseInt(match[1])
      if (line.toLowerCase().includes("chia")) totalFat += grams * 0.31
      else if (line.toLowerCase().includes("salmon")) totalFat += grams * 0.12
      else if (line.toLowerCase().includes("chicken")) totalFat += grams * 0.036
    }
  }

  return Math.round(totalFat)
}

function getImageUrl(mealName) {
  const name = mealName.toLowerCase()

  if (name.includes("chia") && name.includes("pudding")) return "/layered-berry-parfait.png"
  if (name.includes("chicken")) return "/grilled-chicken-vegetable-medley.png"
  if (name.includes("salmon")) return "/pan-seared-salmon-quinoa.png"
  if (name.includes("quinoa")) return "/rainbow-grain-bowl.png"
  if (name.includes("pancake")) return "/fluffy-protein-stack.png"
  if (name.includes("omelette")) return "/fluffy-egg-white-omelette.png"
  if (name.includes("stir")) return "/vibrant-vegetable-stir-fry.png"

  return "/vibrant-nutrition-plate.png"
}

function getCategory(mealName) {
  const name = mealName.toLowerCase()

  if (name.includes("breakfast") || name.includes("pudding") || name.includes("pancake") || name.includes("omelette")) {
    return "breakfast"
  }
  if (name.includes("snack") || name.includes("bar")) {
    return "snack"
  }

  return "main"
}
