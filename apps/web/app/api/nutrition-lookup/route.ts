export const dynamic = "force-dynamic";
export const revalidate = 0;

import { type NextRequest, NextResponse } from "next/server"

// USDA FoodData Central API integration - EXCLUSIVE SOURCE
const USDA_API_KEY = process.env.USDA_API_KEY
const USDA_BASE_URL = "https://api.nal.usda.gov/fdc/v1"

interface USDAFoodItem {
  fdcId: number
  description: string
  foodNutrients: Array<{
    nutrientId: number
    nutrientName: string
    value: number
    unitName: string
  }>
  dataType: string
  publicationDate: string
}

// USDA Nutrient ID mapping
const USDA_NUTRIENT_MAPPING = {
  calories: 1008, // Energy (kcal)
  protein: 1003, // Protein
  carbs: 1005, // Carbohydrate, by difference
  fat: 1004, // Total lipid (fat)
  fiber: 1079, // Fiber, total dietary
  sugar: 2000, // Total sugars
  sodium: 1093, // Sodium, Na
  calcium: 1087, // Calcium, Ca
  iron: 1089, // Iron, Fe
  vitaminC: 1162, // Vitamin C, total ascorbic acid
  vitaminA: 1106, // Vitamin A, RAE
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query")
  const fdcId = searchParams.get("fdcId")

  if (!USDA_API_KEY) {
    return NextResponse.json(
      {
        error: "USDA API key not configured",
        message: "Please add USDA_API_KEY to environment variables",
      },
      { status: 500 },
    )
  }

  if (!query && !fdcId) {
    return NextResponse.json({ error: "Query or fdcId parameter required" }, { status: 400 })
  }

  try {
    let url: string

    if (fdcId) {
      // Get specific food by FDC ID
      url = `${USDA_BASE_URL}/food/${fdcId}?api_key=${USDA_API_KEY}&nutrients=${Object.values(USDA_NUTRIENT_MAPPING).join(",")}`
    } else {
      // Search for foods - prioritize SR Legacy and Foundation Foods
      url = `${USDA_BASE_URL}/foods/search?query=${encodeURIComponent(query!)}&api_key=${USDA_API_KEY}&pageSize=20&dataType=SR%20Legacy,Foundation&sortBy=dataType.keyword&sortOrder=asc`
    }

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`USDA API error: ${response.status} - ${response.statusText}`)
    }

    const data = await response.json()

    if (fdcId) {
      // Single food item
      const nutritionData = parseUSDANutrition(data)
      return NextResponse.json({
        status: "success",
        data: {
          ...nutritionData,
          fdcId: data.fdcId,
          description: data.description,
          dataType: data.dataType,
          publicationDate: data.publicationDate,
        },
        source: "USDA FoodData Central",
        confidence: getConfidenceLevel(data.dataType),
        lastUpdated: new Date().toISOString(),
      })
    } else {
      // Search results - filter and sort by quality
      const foods =
        data.foods
          ?.filter((food: USDAFoodItem) => food.foodNutrients && food.foodNutrients.length > 0)
          ?.map((food: USDAFoodItem) => ({
            fdcId: food.fdcId,
            description: food.description,
            dataType: food.dataType,
            nutrition: parseUSDANutrition(food),
            confidence: getConfidenceLevel(food.dataType),
          }))
          ?.sort((a: any, b: any) => {
            // Prioritize by data type quality
            const typeOrder = { Foundation: 1, "SR Legacy": 2, "Survey (FNDDS)": 3, Branded: 4 }
            return (
              (typeOrder[a.dataType as keyof typeof typeOrder] || 5) -
              (typeOrder[b.dataType as keyof typeof typeOrder] || 5)
            )
          }) || []

      return NextResponse.json({
        status: "success",
        data: foods,
        source: "USDA FoodData Central",
        totalResults: data.totalHits,
        searchQuery: query,
        lastUpdated: new Date().toISOString(),
      })
    }
  } catch (error) {
    console.error("USDA nutrition lookup error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        source: "USDA FoodData Central",
        fallback: "Using local database values",
      },
      { status: 500 },
    )
  }
}

function parseUSDANutrition(foodData: USDAFoodItem) {
  const nutrition = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    calcium: 0,
    iron: 0,
    vitaminC: 0,
    vitaminA: 0,
  }

  foodData.foodNutrients?.forEach((nutrient) => {
    switch (nutrient.nutrientId) {
      case USDA_NUTRIENT_MAPPING.calories:
        nutrition.calories = Math.round(nutrient.value * 100) / 100
        break
      case USDA_NUTRIENT_MAPPING.protein:
        nutrition.protein = Math.round(nutrient.value * 100) / 100
        break
      case USDA_NUTRIENT_MAPPING.carbs:
        nutrition.carbs = Math.round(nutrient.value * 100) / 100
        break
      case USDA_NUTRIENT_MAPPING.fat:
        nutrition.fat = Math.round(nutrient.value * 100) / 100
        break
      case USDA_NUTRIENT_MAPPING.fiber:
        nutrition.fiber = Math.round(nutrient.value * 100) / 100
        break
      case USDA_NUTRIENT_MAPPING.sugar:
        nutrition.sugar = Math.round(nutrient.value * 100) / 100
        break
      case USDA_NUTRIENT_MAPPING.sodium:
        nutrition.sodium = Math.round(nutrient.value * 100) / 100
        break
      case USDA_NUTRIENT_MAPPING.calcium:
        nutrition.calcium = Math.round(nutrient.value * 100) / 100
        break
      case USDA_NUTRIENT_MAPPING.iron:
        nutrition.iron = Math.round(nutrient.value * 100) / 100
        break
      case USDA_NUTRIENT_MAPPING.vitaminC:
        nutrition.vitaminC = Math.round(nutrient.value * 100) / 100
        break
      case USDA_NUTRIENT_MAPPING.vitaminA:
        nutrition.vitaminA = Math.round(nutrient.value * 100) / 100
        break
    }
  })

  return nutrition
}

function getConfidenceLevel(dataType: string): "high" | "medium" | "low" {
  switch (dataType) {
    case "Foundation":
    case "SR Legacy":
      return "high"
    case "Survey (FNDDS)":
      return "medium"
    case "Branded":
      return "low"
    default:
      return "medium"
  }
}
