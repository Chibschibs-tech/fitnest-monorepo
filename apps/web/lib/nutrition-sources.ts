export interface NutritionSource {
  id: string
  name: string
  url: string
  reliability: "high" | "medium" | "low"
  lastUpdated: string
  description: string
}

export const NUTRITION_SOURCES: Record<string, NutritionSource> = {
  usda: {
    id: "usda",
    name: "USDA FoodData Central",
    url: "https://fdc.nal.usda.gov/",
    reliability: "high",
    lastUpdated: "2024-01-01",
    description: "Official US Department of Agriculture nutritional database - Primary authoritative source",
  },
  ciqual: {
    id: "ciqual",
    name: "CIQUAL (French Food Database)",
    url: "https://ciqual.anses.fr/",
    reliability: "high",
    lastUpdated: "2024-01-01",
    description: "French Agency for Food, Environmental and Occupational Health & Safety - Secondary reference",
  },
  morocco_health: {
    id: "morocco_health",
    name: "Morocco Ministry of Health",
    url: "https://www.sante.gov.ma/",
    reliability: "high",
    lastUpdated: "2024-01-01",
    description: "Official Moroccan health ministry nutritional guidelines - For local foods",
  },
}

// Enhanced ingredient interface with USDA-focused source tracking
export interface IngredientWithSource {
  id: string
  name: string
  nameArabic?: string
  nameFrench?: string
  category: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sugar: number
  sodium: number
  // USDA-focused source tracking
  usdaFdcId?: number // Primary USDA FoodData Central ID
  sourceReferences: Array<{
    sourceId: "usda" | "ciqual" | "morocco_health"
    fdcId?: number // USDA FoodData Central ID
    verified: boolean
    lastChecked: string
    confidence: "high" | "medium" | "low"
  }>
  // Additional metadata
  isOrganic?: boolean
  allergens?: string[]
  localAvailability?: "high" | "medium" | "low"
  seasonality?: string[]
}
