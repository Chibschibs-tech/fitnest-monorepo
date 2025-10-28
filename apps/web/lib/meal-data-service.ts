import { calculateMealNutrition, type MealIngredient } from "./macro-calculator"

export interface MealData {
  id: number
  name: string
  description: string
  ingredients: MealIngredient[]
  mealType: string
  dietaryInfo: string[]
  tags: string[]
  imageUrl: string
  isActive: boolean
  // Calculated properties
  nutrition: ReturnType<typeof calculateMealNutrition>
  calories: number
  protein: number
  carbs: number
  fat: number
}

// Mashed Potato with Meatballs and Salad - USDA Calculated
export const mashedPotatoMeatballsSalad: MealData = {
  id: 1,
  name: "Mashed Potato with Meatballs and Salad",
  description:
    "A comforting and balanced plate featuring creamy mashed potatoes, savory meatballs, and fresh salad. A nutritious meal that satisfies both taste and nutritional needs.",
  mealType: "lunch",
  dietaryInfo: [],
  tags: ["comfort-food", "balanced"],
  imageUrl: "/grilled-chicken-vegetable-medley.png",
  isActive: true,
  ingredients: [
    // Mashed Potato Components
    { ingredientId: "potato-russet", amount: 90, displayText: "90g potatoes (¾ small potato)" },
    { ingredientId: "butter", amount: 8, displayText: "8g butter (½ tablespoon)" },
    { ingredientId: "milk-whole", amount: 25, displayText: "25ml milk or cream (1½ tablespoons)" },

    // Meatball Components
    { ingredientId: "ground-beef-80-20", amount: 70, displayText: "70g ground beef" },
    { ingredientId: "breadcrumbs", amount: 7, displayText: "1 tablespoon breadcrumbs" },
    { ingredientId: "egg-whole", amount: 12, displayText: "¼ large egg" },
    { ingredientId: "onion", amount: 15, displayText: "⅛ small onion, finely chopped" },
    { ingredientId: "garlic", amount: 1.5, displayText: "½ clove garlic, minced" },
    { ingredientId: "parsley", amount: 2, displayText: "½ tablespoon parsley (optional)" },
    { ingredientId: "olive-oil", amount: 7, displayText: "½ tablespoon olive oil (for cooking)" },

    // Salad Components
    { ingredientId: "lettuce-iceberg", amount: 60, displayText: "60g lettuce, chopped" },
    { ingredientId: "tomato", amount: 90, displayText: "1 small tomato, diced" },
    { ingredientId: "cucumber", amount: 75, displayText: "½ medium cucumber, sliced" },
    { ingredientId: "bell-peppers", amount: 25, displayText: "¼ small bell pepper, chopped" },
    { ingredientId: "olive-oil", amount: 8, displayText: "1 tablespoon olive oil (for dressing)" },
    { ingredientId: "vinegar-balsamic", amount: 7, displayText: "1 tablespoon balsamic vinegar" },
  ],
  get nutrition() {
    return calculateMealNutrition(this.ingredients)
  },
  get calories() {
    return this.nutrition.calories
  },
  get protein() {
    return this.nutrition.protein
  },
  get carbs() {
    return this.nutrition.carbs
  },
  get fat() {
    return this.nutrition.fat
  },
}

// Export all meals with calculated nutrition
export const allMeals: MealData[] = [
  mashedPotatoMeatballsSalad,
  // Add more meals here...
]

export function getMealById(id: number): MealData | undefined {
  return allMeals.find((meal) => meal.id === id)
}

export function getMealsByType(mealType: string): MealData[] {
  return allMeals.filter((meal) => meal.mealType === mealType && meal.isActive)
}
