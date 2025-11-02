import { NextRequest, NextResponse } from "next/server"

// Type definitions
interface MealTypePrice {
  id?: string
  name: string
  basePrice: number
  description?: string
  active: boolean
  createdAt?: Date
  updatedAt?: Date
}

// In-memory database (temporary - will be replaced with Supabase)
let mealTypes: MealTypePrice[] = [
  {
    id: "1",
    name: "Economy",
    basePrice: 45,
    description: "Budget-friendly option",
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "Standard",
    basePrice: 65,
    description: "Popular choice",
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    name: "Premium",
    basePrice: 90,
    description: "High-quality ingredients",
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

// GET - Retrieve all meal types
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(
      {
        success: true,
        data: mealTypes,
        count: mealTypes.length,
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch meal types",
      },
      { status: 500 }
    )
  }
}

// POST - Create new meal type
export async function POST(request: NextRequest) {
  try {
    const body: MealTypePrice = await request.json()

    // Validation
    if (!body.name || typeof body.basePrice !== "number") {
      return NextResponse.json(
        {
          success: false,
          error: "Missing or invalid required fields",
        },
        { status: 400 }
      )
    }

    const newMealType: MealTypePrice = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    mealTypes.push(newMealType)

    return NextResponse.json(
      {
        success: true,
        data: newMealType,
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create meal type",
      },
      { status: 500 }
    )
  }
}

// PUT - Update meal type
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "ID is required",
        },
        { status: 400 }
      )
    }

    const index = mealTypes.findIndex((m) => m.id === id)
    if (index === -1) {
      return NextResponse.json(
        {
          success: false,
          error: "Meal type not found",
        },
        { status: 404 }
      )
    }

    mealTypes[index] = {
      ...mealTypes[index],
      ...updateData,
      updatedAt: new Date(),
    }

    return NextResponse.json(
      {
        success: true,
        data: mealTypes[index],
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update meal type",
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete meal type
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "ID is required",
        },
        { status: 400 }
      )
    }

    const index = mealTypes.findIndex((m) => m.id === id)
    if (index === -1) {
      return NextResponse.json(
        {
          success: false,
          error: "Meal type not found",
        },
        { status: 404 }
      )
    }

    const deleted = mealTypes.splice(index, 1)[0]

    return NextResponse.json(
      {
        success: true,
        data: deleted,
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete meal type",
      },
      { status: 500 }
    )
  }
}
