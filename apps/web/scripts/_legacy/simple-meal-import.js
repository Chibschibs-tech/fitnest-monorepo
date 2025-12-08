// Simple meal import - no bullshit, just get it done

const csvUrl =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Meals%20to%20upload-sgjDCBc0b6BhC2lINcM8Q2RrVTJ1HG.csv"

console.log("🚀 Starting simple meal import...")

try {
  // Fetch CSV
  const response = await fetch(csvUrl)
  const csvContent = await response.text()
  console.log("📄 CSV fetched")

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

  console.log(`📊 Found ${meals.length} meals`)

  // Connect to database
  const { neon } = await import("@neondatabase/serverless")
  const sql = neon(process.env.DATABASE_URL)

  console.log("🗄️ Connected to database")

  // Insert meals
  let count = 0

  for (const meal of meals) {
    // Muscle Gain version
    if (meal.muscleGain) {
      const nutrition = await getUSDANutrition(meal.muscleGain)
      await sql`
        INSERT INTO meals (name, description, calories, protein, carbs, fat, image_url, category)
        VALUES (
          ${meal.name + " (Muscle Gain)"},
          ${meal.muscleGain},
          ${nutrition.calories},
          ${nutrition.protein},
          ${nutrition.carbs},
          ${nutrition.fat},
          ${getImageUrl(meal.name)},
          ${getCategory(meal.name)}
        )
      `
      count++
      console.log(`✅ ${meal.name} (Muscle Gain)`)
    }

    // Weight Loss version
    if (meal.weightLoss) {
      const nutrition = await getUSDANutrition(meal.weightLoss)
      await sql`
        INSERT INTO meals (name, description, calories, protein, carbs, fat, image_url, category)
        VALUES (
          ${meal.name + " (Weight Loss)"},
          ${meal.weightLoss},
          ${nutrition.calories},
          ${nutrition.protein},
          ${nutrition.carbs},
          ${nutrition.fat},
          ${getImageUrl(meal.name)},
          ${getCategory(meal.name)}
        )
      `
      count++
      console.log(`✅ ${meal.name} (Weight Loss)`)
    }

    // Stay Fit version
    if (meal.stayFit) {
      const nutrition = await getUSDANutrition(meal.stayFit)
      await sql`
        INSERT INTO meals (name, description, calories, protein, carbs, fat, image_url, category)
        VALUES (
          ${meal.name + " (Stay Fit)"},
          ${meal.stayFit},
          ${nutrition.calories},
          ${nutrition.protein},
          ${nutrition.carbs},
          ${nutrition.fat},
          ${getImageUrl(meal.name)},
          ${getCategory(meal.name)}
        )
      `
      count++
      console.log(`✅ ${meal.name} (Stay Fit)`)
    }
  }

  console.log(`🎉 Imported ${count} meals successfully`)
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

async function getUSDANutrition(ingredients) {
  const usdaApiKey = process.env.USDA_API_KEY

  if (!usdaApiKey) {
    console.warn("No USDA API key, using estimates")
    return estimateNutrition(ingredients)
  }

  try {
    let totalCalories = 0
    let totalProtein = 0
    let totalCarbs = 0
    let totalFat = 0

    const lines = ingredients.split("\n").filter((line) => line.trim())

    for (const line of lines) {
      const match = line.match(/^(.+?):\s*(\d+(?:\.\d+)?)\s*grams?/i)
      if (match) {
        const [, ingredientName, amount] = match
        const grams = Number.parseFloat(amount)

        // Search USDA for ingredient
        const searchUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(ingredientName)}&api_key=${usdaApiKey}&dataType=Foundation,SR%20Legacy&pageSize=1`

        const searchResponse = await fetch(searchUrl)
        const searchData = await searchResponse.json()

        if (searchData.foods && searchData.foods.length > 0) {
          const foodId = searchData.foods[0].fdcId

          // Get nutrition details
          const detailUrl = `https://api.nal.usda.gov/fdc/v1/food/${foodId}?api_key=${usdaApiKey}`
          const detailResponse = await fetch(detailUrl)
          const detailData = await detailResponse.json()

          const nutrients = detailData.foodNutrients || []
          const multiplier = grams / 100 // USDA data is per 100g

          const calories = findNutrient(nutrients, "Energy") * multiplier
          const protein = findNutrient(nutrients, "Protein") * multiplier
          const carbs = findNutrient(nutrients, "Carbohydrate") * multiplier
          const fat = findNutrient(nutrients, "Total lipid") * multiplier

          totalCalories += calories
          totalProtein += protein
          totalCarbs += carbs
          totalFat += fat
        }
      }
    }

    return {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein),
      carbs: Math.round(totalCarbs),
      fat: Math.round(totalFat),
    }
  } catch (error) {
    console.warn("USDA API failed, using estimates:", error.message)
    return estimateNutrition(ingredients)
  }
}

function findNutrient(nutrients, nutrientName) {
  const nutrient = nutrients.find((n) => n.nutrient?.name?.toLowerCase().includes(nutrientName.toLowerCase()))
  return nutrient?.amount || 0
}

function estimateNutrition(ingredients) {
  const lines = ingredients.split("\n")
  let totalCalories = 0
  let totalProtein = 0
  let totalCarbs = 0
  let totalFat = 0

  for (const line of lines) {
    const match = line.match(/(\d+)\s*grams?/i)
    if (match) {
      const grams = Number.parseInt(match[1])
      const lower = line.toLowerCase()

      if (lower.includes("chia")) {
        totalCalories += grams * 4.86
        totalProtein += grams * 0.17
        totalCarbs += grams * 0.42
        totalFat += grams * 0.31
      } else if (lower.includes("yogurt")) {
        totalCalories += grams * 0.59
        totalProtein += grams * 0.1
        totalCarbs += grams * 0.036
        totalFat += grams * 0.004
      } else if (lower.includes("berries")) {
        totalCalories += grams * 0.57
        totalProtein += grams * 0.007
        totalCarbs += grams * 0.14
        totalFat += grams * 0.003
      } else if (lower.includes("milk")) {
        totalCalories += grams * 0.17
        totalProtein += grams * 0.006
        totalCarbs += grams * 0.015
        totalFat += grams * 0.011
      } else if (lower.includes("chicken")) {
        totalCalories += grams * 1.65
        totalProtein += grams * 0.31
        totalCarbs += grams * 0
        totalFat += grams * 0.036
      } else if (lower.includes("salmon")) {
        totalCalories += grams * 2.08
        totalProtein += grams * 0.25
        totalCarbs += grams * 0
        totalFat += grams * 0.12
      } else {
        // Default estimate
        totalCalories += grams * 1.0
        totalProtein += grams * 0.05
        totalCarbs += grams * 0.15
        totalFat += grams * 0.02
      }
    }
  }

  return {
    calories: Math.round(totalCalories),
    protein: Math.round(totalProtein),
    carbs: Math.round(totalCarbs),
    fat: Math.round(totalFat),
  }
}

function getImageUrl(mealName) {
  const name = mealName.toLowerCase()

  if (name.includes("chia") && name.includes("pudding")) return "/layered-berry-parfait.png"
  if (name.includes("chicken")) return "/grilled-chicken-vegetable-medley.png"
  if (name.includes("salmon")) return "/pan-seared-salmon-quinoa.png"
  if (name.includes("quinoa")) return "/rainbow-grain-bowl.png"
  if (name.includes("pancake")) return "/fluffy-protein-stack.png"
  if (name.includes("omelette")) return "/fluffy-egg-white-omelette.png"

  return "/vibrant-nutrition-plate.png"
}

function getCategory(mealName) {
  const name = mealName.toLowerCase()

  if (name.includes("breakfast") || name.includes("pudding") || name.includes("pancake")) {
    return "breakfast"
  }
  if (name.includes("snack")) {
    return "snack"
  }

  return "main"
}
