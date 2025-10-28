interface CSVMealData {
  name: string
  muscleGainIngredients: string
  weightLossIngredients: string
  stayFitIngredients: string
}

interface ProcessedMeal {
  name: string
  description: string
  ingredients: Array<{
    name: string
    amount: number
    unit: string
    displayText: string
  }>
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  mealType: string
  planType: string
  tags: string[]
  dietaryInfo: string[]
}

export class MealImportService {
  private usdaApiKey: string

  constructor() {
    this.usdaApiKey = process.env.USDA_API_KEY || ""
  }

  /**
   * Parse CSV content and extract meal data
   */
  parseCSV(csvContent: string): CSVMealData[] {
    const lines = csvContent.split("\n").filter((line) => line.trim())
    const headers = this.parseCSVRow(lines[0])

    const meals: CSVMealData[] = []

    for (let i = 1; i < lines.length; i++) {
      const row = this.parseCSVRow(lines[i])
      if (row.length >= 4) {
        meals.push({
          name: row[0]?.trim() || "",
          muscleGainIngredients: row[1]?.trim() || "",
          weightLossIngredients: row[2]?.trim() || "",
          stayFitIngredients: row[3]?.trim() || "",
        })
      }
    }

    return meals.filter((meal) => meal.name)
  }

  /**
   * Parse CSV row handling quoted fields
   */
  private parseCSVRow(row: string): string[] {
    const result: string[] = []
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

  /**
   * Parse ingredient string into structured data
   */
  parseIngredients(ingredientString: string): Array<{
    name: string
    amount: number
    unit: string
    displayText: string
  }> {
    const ingredients = ingredientString.split("\n").filter((line) => line.trim())
    const parsed = []

    for (const ingredient of ingredients) {
      const match = ingredient.match(/^(.+?):\s*(\d+(?:\.\d+)?)\s*(\w+)/)
      if (match) {
        const [, name, amount, unit] = match
        const displayText = this.formatIngredientForCustomer(name.trim(), Number.parseFloat(amount), unit)

        parsed.push({
          name: name.trim(),
          amount: Number.parseFloat(amount),
          unit: unit,
          displayText,
        })
      }
    }

    return parsed
  }

  /**
   * Format ingredients for customer-friendly display
   */
  private formatIngredientForCustomer(name: string, amount: number, unit: string): string {
    // Convert grams to more customer-friendly measurements
    if (unit === "grams") {
      // Common conversions for better customer understanding
      const conversions: Record<string, (amount: number) => string> = {
        "chia seeds": (g) => (g >= 30 ? `${Math.round(g / 15)} tablespoons` : `${Math.round(g / 5)} teaspoons`),
        "greek yogurt": (g) => (g >= 125 ? `${Math.round(g / 125)} cup` : `${Math.round(g / 30)} tablespoons`),
        "mixed berries": (g) => (g >= 150 ? `${Math.round(g / 150)} cup` : `${Math.round(g / 75)} half cup`),
        "almond milk": (g) => (g >= 240 ? `${Math.round(g / 240)} cup` : `${Math.round(g / 60)} quarter cup`),
        "coconut milk": (g) => (g >= 240 ? `${Math.round(g / 240)} cup` : `${Math.round(g / 60)} quarter cup`),
        "olive oil": (g) => (g >= 15 ? `${Math.round(g / 15)} tablespoon` : `${Math.round(g / 5)} teaspoon`),
        "chicken breast": (g) => `${Math.round(g / 28)} oz`,
        salmon: (g) => `${Math.round(g / 28)} oz`,
        quinoa: (g) => (g >= 185 ? `${Math.round(g / 185)} cup cooked` : `${Math.round(g / 45)} quarter cup cooked`),
        "brown rice": (g) =>
          g >= 195 ? `${Math.round(g / 195)} cup cooked` : `${Math.round(g / 50)} quarter cup cooked`,
        broccoli: (g) => (g >= 150 ? `${Math.round(g / 150)} cup` : `${Math.round(g / 75)} half cup`),
        spinach: (g) => (g >= 30 ? `${Math.round(g / 30)} cup` : `${Math.round(g / 15)} half cup`),
      }

      const lowerName = name.toLowerCase()
      for (const [key, converter] of Object.entries(conversions)) {
        if (lowerName.includes(key)) {
          return converter(amount)
        }
      }

      // Default gram conversion
      if (amount >= 1000) {
        return `${(amount / 1000).toFixed(1)} kg`
      } else if (amount >= 100) {
        return `${Math.round(amount)} grams`
      } else {
        return `${amount} grams`
      }
    }

    return `${amount} ${unit}`
  }

  /**
   * Calculate nutrition using USDA API
   */
  async calculateNutrition(ingredients: Array<{ name: string; amount: number; unit: string }>): Promise<{
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
  }> {
    let totalCalories = 0
    let totalProtein = 0
    let totalCarbs = 0
    let totalFat = 0
    let totalFiber = 0

    for (const ingredient of ingredients) {
      try {
        const nutrition = await this.getUSDANutrition(ingredient.name, ingredient.amount, ingredient.unit)
        if (nutrition) {
          totalCalories += nutrition.calories
          totalProtein += nutrition.protein
          totalCarbs += nutrition.carbs
          totalFat += nutrition.fat
          totalFiber += nutrition.fiber
        }
      } catch (error) {
        console.warn(`Could not get nutrition for ${ingredient.name}:`, error)
        // Use fallback nutrition estimation
        const fallback = this.getFallbackNutrition(ingredient.name, ingredient.amount)
        totalCalories += fallback.calories
        totalProtein += fallback.protein
        totalCarbs += fallback.carbs
        totalFat += fallback.fat
        totalFiber += fallback.fiber
      }
    }

    return {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
      fat: Math.round(totalFat * 10) / 10,
      fiber: Math.round(totalFiber * 10) / 10,
    }
  }

  /**
   * Get nutrition data from USDA API
   */
  private async getUSDANutrition(ingredientName: string, amount: number, unit: string) {
    if (!this.usdaApiKey) {
      throw new Error("USDA API key not configured")
    }

    // Search for the ingredient
    const searchUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(ingredientName)}&api_key=${this.usdaApiKey}&dataType=Foundation,SR%20Legacy&pageSize=1`

    const searchResponse = await fetch(searchUrl)
    const searchData = await searchResponse.json()

    if (!searchData.foods || searchData.foods.length === 0) {
      throw new Error(`No USDA data found for ${ingredientName}`)
    }

    const foodId = searchData.foods[0].fdcId

    // Get detailed nutrition data
    const detailUrl = `https://api.nal.usda.gov/fdc/v1/food/${foodId}?api_key=${this.usdaApiKey}`
    const detailResponse = await fetch(detailUrl)
    const detailData = await detailResponse.json()

    // Extract nutrition per 100g and convert to requested amount
    const nutrients = detailData.foodNutrients || []
    const multiplier = this.getAmountMultiplier(amount, unit)

    const calories = (this.findNutrient(nutrients, "Energy") * multiplier) / 100
    const protein = (this.findNutrient(nutrients, "Protein") * multiplier) / 100
    const carbs = (this.findNutrient(nutrients, "Carbohydrate, by difference") * multiplier) / 100
    const fat = (this.findNutrient(nutrients, "Total lipid (fat)") * multiplier) / 100
    const fiber = (this.findNutrient(nutrients, "Fiber, total dietary") * multiplier) / 100

    return { calories, protein, carbs, fat, fiber }
  }

  /**
   * Find specific nutrient value from USDA data
   */
  private findNutrient(nutrients: any[], nutrientName: string): number {
    const nutrient = nutrients.find((n) => n.nutrient?.name?.toLowerCase().includes(nutrientName.toLowerCase()))
    return nutrient?.amount || 0
  }

  /**
   * Convert amount and unit to grams multiplier
   */
  private getAmountMultiplier(amount: number, unit: string): number {
    const unitConversions: Record<string, number> = {
      grams: 1,
      g: 1,
      kg: 1000,
      oz: 28.35,
      lb: 453.592,
      cup: 240, // approximate for liquids
      tbsp: 15,
      tsp: 5,
    }

    return amount * (unitConversions[unit.toLowerCase()] || 1)
  }

  /**
   * Fallback nutrition estimation when USDA API fails
   */
  private getFallbackNutrition(ingredientName: string, amount: number) {
    const fallbackData: Record<
      string,
      { calories: number; protein: number; carbs: number; fat: number; fiber: number }
    > = {
      "chia seeds": { calories: 486, protein: 17, carbs: 42, fat: 31, fiber: 34 },
      "greek yogurt": { calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0 },
      "mixed berries": { calories: 57, protein: 0.7, carbs: 14, fat: 0.3, fiber: 2.4 },
      "almond milk": { calories: 17, protein: 0.6, carbs: 1.5, fat: 1.1, fiber: 0.1 },
      "chicken breast": { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
      salmon: { calories: 208, protein: 25, carbs: 0, fat: 12, fiber: 0 },
      quinoa: { calories: 120, protein: 4.4, carbs: 22, fat: 1.9, fiber: 2.8 },
      "brown rice": { calories: 112, protein: 2.6, carbs: 23, fat: 0.9, fiber: 1.8 },
      broccoli: { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6 },
      spinach: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2 },
    }

    const lowerName = ingredientName.toLowerCase()
    for (const [key, nutrition] of Object.entries(fallbackData)) {
      if (lowerName.includes(key)) {
        const multiplier = amount / 100 // assuming grams
        return {
          calories: nutrition.calories * multiplier,
          protein: nutrition.protein * multiplier,
          carbs: nutrition.carbs * multiplier,
          fat: nutrition.fat * multiplier,
          fiber: nutrition.fiber * multiplier,
        }
      }
    }

    // Default fallback
    return { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  }

  /**
   * Determine meal type based on name and ingredients
   */
  determineMealType(mealName: string, ingredients: string[]): string {
    const name = mealName.toLowerCase()

    if (name.includes("breakfast") || name.includes("pudding") || name.includes("oats") || name.includes("pancake")) {
      return "breakfast"
    }

    if (name.includes("snack") || name.includes("bar") || name.includes("smoothie")) {
      return "snack"
    }

    if (name.includes("lunch") || name.includes("dinner") || name.includes("main")) {
      return "main"
    }

    // Default based on typical calorie content
    return "main"
  }

  /**
   * Generate tags based on meal content
   */
  generateTags(mealName: string, ingredients: string[], nutrition: any): string[] {
    const tags = []
    const name = mealName.toLowerCase()
    const ingredientText = ingredients.join(" ").toLowerCase()

    // Protein content tags
    if (nutrition.protein >= 25) tags.push("high-protein")
    if (nutrition.protein >= 15 && nutrition.protein < 25) tags.push("protein-rich")

    // Dietary tags
    if (!ingredientText.includes("meat") && !ingredientText.includes("chicken") && !ingredientText.includes("beef")) {
      tags.push("vegetarian")
    }

    if (!ingredientText.includes("dairy") && !ingredientText.includes("milk") && !ingredientText.includes("yogurt")) {
      tags.push("dairy-free")
    }

    // Meal type tags
    if (name.includes("breakfast")) tags.push("breakfast")
    if (name.includes("post-workout") || nutrition.protein >= 20) tags.push("post-workout")

    // Calorie tags
    if (nutrition.calories < 300) tags.push("light")
    if (nutrition.calories >= 500) tags.push("hearty")

    return tags
  }

  /**
   * Generate dietary information
   */
  generateDietaryInfo(ingredients: string[]): string[] {
    const dietary = []
    const ingredientText = ingredients.join(" ").toLowerCase()

    if (!ingredientText.includes("gluten") && !ingredientText.includes("wheat")) {
      dietary.push("gluten-free")
    }

    if (!ingredientText.includes("meat") && !ingredientText.includes("chicken") && !ingredientText.includes("beef")) {
      dietary.push("vegetarian")
    }

    if (!ingredientText.includes("dairy") && !ingredientText.includes("milk") && !ingredientText.includes("cheese")) {
      dietary.push("dairy-free")
    }

    if (ingredientText.includes("keto") || (ingredientText.includes("fat") && !ingredientText.includes("carb"))) {
      dietary.push("keto-friendly")
    }

    return dietary
  }

  /**
   * Process all meals from CSV data
   */
  async processAllMeals(csvData: CSVMealData[]): Promise<ProcessedMeal[]> {
    const processedMeals: ProcessedMeal[] = []

    for (const csvMeal of csvData) {
      // Process each plan variation
      const planTypes = [
        { type: "muscle-gain", ingredients: csvMeal.muscleGainIngredients, calorieRange: "2200-2500" },
        { type: "weight-loss", ingredients: csvMeal.weightLossIngredients, calorieRange: "1200-1500" },
        { type: "stay-fit", ingredients: csvMeal.stayFitIngredients, calorieRange: "1600-1900" },
      ]

      for (const plan of planTypes) {
        if (plan.ingredients) {
          try {
            const ingredients = this.parseIngredients(plan.ingredients)
            const nutrition = await this.calculateNutrition(ingredients)
            const mealType = this.determineMealType(
              csvMeal.name,
              ingredients.map((i) => i.name),
            )
            const tags = this.generateTags(
              csvMeal.name,
              ingredients.map((i) => i.name),
              nutrition,
            )
            const dietaryInfo = this.generateDietaryInfo(ingredients.map((i) => i.name))

            processedMeals.push({
              name: `${csvMeal.name} (${plan.type.replace("-", " ")})`,
              description: `Delicious ${csvMeal.name.toLowerCase()} optimized for ${plan.type.replace("-", " ")} goals. ${plan.calorieRange} kcal/day plan.`,
              ingredients: ingredients.map((ing) => ({
                name: ing.name,
                amount: ing.amount,
                unit: ing.unit,
                displayText: ing.displayText,
              })),
              calories: nutrition.calories,
              protein: nutrition.protein,
              carbs: nutrition.carbs,
              fat: nutrition.fat,
              fiber: nutrition.fiber,
              mealType,
              planType: plan.type,
              tags,
              dietaryInfo,
            })

            console.log(`✅ Processed: ${csvMeal.name} (${plan.type})`)
          } catch (error) {
            console.error(`❌ Error processing ${csvMeal.name} (${plan.type}):`, error)
          }
        }
      }
    }

    return processedMeals
  }
}
