// Just create the fucking meals already

const csvUrl =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Meals%20to%20upload-HNRy9oGVXVvS2MyRSHxHKN0XpiQyKE.csv"

console.log("Creating meals from CSV...")

try {
  // Get CSV
  const response = await fetch(csvUrl)
  const csvContent = await response.text()

  // Parse CSV
  const lines = csvContent.split("\n").filter((line) => line.trim())
  const headers = parseCSVRow(lines[0])
  console.log("Headers:", headers)

  const meals = []
  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVRow(lines[i])
    if (row.length >= 4 && row[0].trim()) {
      meals.push({
        name: row[0].trim(),
        muscleGain: row[1].trim(),
        weightLoss: row[2].trim(),
        stayFit: row[3].trim(),
        category: row[4] ? row[4].trim() : "main",
        description: row[5] ? row[5].trim() : "",
      })
    }
  }

  console.log(`Found ${meals.length} meals`)

  // Connect to database
  const { neon } = await import("@neondatabase/serverless")
  const sql = neon(process.env.DATABASE_URL)

  // Clear existing meals
  await sql`DELETE FROM meals`
  console.log("Cleared existing meals")

  let count = 0

  // Insert each meal variation
  for (const meal of meals) {
    // Muscle Gain version
    await sql`
      INSERT INTO meals (name, description, "imageUrl", category, "createdAt", "updatedAt")
      VALUES (
        ${meal.name + " (Muscle Gain)"},
        ${meal.muscleGain + (meal.description ? "\n\n" + meal.description : "")},
        ${"/vibrant-nutrition-plate.png"},
        ${meal.category === "breakfast" ? "breakfast" : "main"},
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
        ${"/vibrant-nutrition-plate.png"},
        ${meal.category === "breakfast" ? "breakfast" : "main"},
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
        ${"/vibrant-nutrition-plate.png"},
        ${meal.category === "breakfast" ? "breakfast" : "main"},
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
