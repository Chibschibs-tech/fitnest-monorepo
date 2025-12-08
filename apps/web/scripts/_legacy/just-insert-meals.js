// Just insert the fucking meals into the existing table

const csvUrl =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Meals%20to%20upload-sgjDCBc0b6BhC2lINcM8Q2RrVTJ1HG.csv"

console.log("Fetching CSV and inserting meals...")

try {
  // Get CSV
  const response = await fetch(csvUrl)
  const csvContent = await response.text()

  // Parse CSV
  const lines = csvContent.split("\n").filter((line) => line.trim())
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

  console.log(`Found ${meals.length} meals`)

  // Connect to database
  const { neon } = await import("@neondatabase/serverless")
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    throw new Error("DATABASE_URL environment variable not set!")
  }
  const sql = neon(dbUrl)

  // Clear existing meals
  await sql`DELETE FROM meals`
  console.log("Cleared existing meals")

  let count = 0

  // Insert each meal variation
  for (const meal of meals) {
    // Muscle Gain
    await sql`
      INSERT INTO meals (name, description, meal_type, calories, protein, carbs, fat, image_url, category)
      VALUES (
        ${meal.name + " (Muscle Gain)"},
        ${meal.muscleGain},
        ${"muscle-gain"},
        ${getCalories(meal.muscleGain)},
        ${getProtein(meal.muscleGain)},
        ${getCarbs(meal.muscleGain)},
        ${getFat(meal.muscleGain)},
        ${"/vibrant-nutrition-plate.png"},
        ${"main"}
      )
    `
    count++

    // Weight Loss
    await sql`
      INSERT INTO meals (name, description, meal_type, calories, protein, carbs, fat, image_url, category)
      VALUES (
        ${meal.name + " (Weight Loss)"},
        ${meal.weightLoss},
        ${"weight-loss"},
        ${getCalories(meal.weightLoss)},
        ${getProtein(meal.weightLoss)},
        ${getCarbs(meal.weightLoss)},
        ${getFat(meal.weightLoss)},
        ${"/vibrant-nutrition-plate.png"},
        ${"main"}
      )
    `
    count++

    // Stay Fit
    await sql`
      INSERT INTO meals (name, description, meal_type, calories, protein, carbs, fat, image_url, category)
      VALUES (
        ${meal.name + " (Stay Fit)"},
        ${meal.stayFit},
        ${"stay-fit"},
        ${getCalories(meal.stayFit)},
        ${getProtein(meal.stayFit)},
        ${getCarbs(meal.stayFit)},
        ${getFat(meal.stayFit)},
        ${"/vibrant-nutrition-plate.png"},
        ${"main"}
      )
    `
    count++
  }

  console.log(`✅ Inserted ${count} meals`)

  // Verify
  const result = await sql`SELECT COUNT(*) as count FROM meals`
  console.log(`Database now has ${result[0].count} meals`)
} catch (error) {
  console.error("Error:", error)
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

function getCalories(ingredients) {
  const lines = ingredients.split("\n")
  let total = 0

  for (const line of lines) {
    const match = line.match(/(\d+)\s*grams?/i)
    if (match) {
      const grams = Number.parseInt(match[1])
      if (line.toLowerCase().includes("chia")) total += grams * 4.86
      else if (line.toLowerCase().includes("yogurt")) total += grams * 0.59
      else if (line.toLowerCase().includes("berries")) total += grams * 0.57
      else if (line.toLowerCase().includes("milk")) total += grams * 0.17
      else if (line.toLowerCase().includes("chicken")) total += grams * 1.65
      else if (line.toLowerCase().includes("salmon")) total += grams * 2.08
      else total += grams * 1.0
    }
  }

  return Math.round(total)
}

function getProtein(ingredients) {
  const lines = ingredients.split("\n")
  let total = 0

  for (const line of lines) {
    const match = line.match(/(\d+)\s*grams?/i)
    if (match) {
      const grams = Number.parseInt(match[1])
      if (line.toLowerCase().includes("chia")) total += grams * 0.17
      else if (line.toLowerCase().includes("yogurt")) total += grams * 0.1
      else if (line.toLowerCase().includes("chicken")) total += grams * 0.31
      else if (line.toLowerCase().includes("salmon")) total += grams * 0.25
    }
  }

  return Math.round(total)
}

function getCarbs(ingredients) {
  const lines = ingredients.split("\n")
  let total = 0

  for (const line of lines) {
    const match = line.match(/(\d+)\s*grams?/i)
    if (match) {
      const grams = Number.parseInt(match[1])
      if (line.toLowerCase().includes("berries")) total += grams * 0.14
      else if (line.toLowerCase().includes("quinoa")) total += grams * 0.22
      else if (line.toLowerCase().includes("rice")) total += grams * 0.23
    }
  }

  return Math.round(total)
}

function getFat(ingredients) {
  const lines = ingredients.split("\n")
  let total = 0

  for (const line of lines) {
    const match = line.match(/(\d+)\s*grams?/i)
    if (match) {
      const grams = Number.parseInt(match[1])
      if (line.toLowerCase().includes("chia")) total += grams * 0.31
      else if (line.toLowerCase().includes("salmon")) total += grams * 0.12
    }
  }

  return Math.round(total)
}
