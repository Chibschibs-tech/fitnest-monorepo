// Fetch and analyze the meals CSV file
async function analyzeMealsCSV() {
  try {
    console.log("Fetching meals CSV file...")
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Meals%20to%20upload-sy0jp5AbCZaqrP316g5GSKYTXg1xFj.csv",
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const csvText = await response.text()
    console.log("CSV file fetched successfully")
    console.log("File size:", csvText.length, "characters")

    // Parse CSV manually (simple approach)
    const lines = csvText.split("\n")
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

    console.log("\n=== CSV HEADERS ===")
    headers.forEach((header, index) => {
      console.log(`${index + 1}. "${header}"`)
    })

    console.log("\n=== SAMPLE MEALS DATA ===")

    // Process first 5 meals as examples
    for (let i = 1; i <= Math.min(5, lines.length - 1); i++) {
      if (lines[i].trim()) {
        console.log(`\n--- MEAL ${i} ---`)

        // Parse CSV row (handle quoted fields)
        const row = parseCSVRow(lines[i])

        headers.forEach((header, index) => {
          if (row[index]) {
            console.log(`${header}:`)
            console.log(`  ${row[index].substring(0, 200)}${row[index].length > 200 ? "..." : ""}`)
          }
        })
      }
    }

    console.log(`\n=== SUMMARY ===`)
    console.log(`Total meals in CSV: ${lines.length - 1}`)
    console.log(`Headers count: ${headers.length}`)

    // Analyze meal plan columns
    const mealPlanColumns = headers.filter((h) => h.includes("kcal/day"))
    console.log(`\nMeal plan variations found:`)
    mealPlanColumns.forEach((col) => console.log(`- ${col}`))

    return {
      totalMeals: lines.length - 1,
      headers,
      sampleData: lines.slice(1, 6).map((line) => parseCSVRow(line)),
    }
  } catch (error) {
    console.error("Error analyzing CSV:", error)
    return null
  }
}

// Simple CSV row parser that handles quoted fields
function parseCSVRow(row) {
  const result = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < row.length; i++) {
    const char = row[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      result.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }

  result.push(current.trim())
  return result
}

// Run the analysis
analyzeMealsCSV()
