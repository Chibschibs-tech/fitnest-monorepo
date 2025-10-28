export const dynamic = "force-dynamic";
export const revalidate = 0;

import { type NextRequest, NextResponse } from "next/server"
import { sql, db } from "@/lib/db"
import { getSessionUser } from "@/lib/simple-auth"


export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("session-id")?.value
    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getSessionUser(sessionId)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Create sample snacks data since we don't have a products table yet
    const sampleSnacks = [
      {
        id: 1,
        name: "Protein Bar - Chocolate",
        description: "High-protein chocolate bar with 20g protein",
        price: 25.0,
        category: "protein_bars",
        status: "active",
        image_url: "/protein-bar.png",
        stock_quantity: 50,
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        name: "Berry Protein Bar",
        description: "Mixed berry protein bar with natural ingredients",
        price: 25.0,
        category: "protein_bars",
        status: "active",
        image_url: "/berry-protein-bar.png",
        stock_quantity: 30,
        created_at: new Date().toISOString(),
      },
      {
        id: 3,
        name: "Honey Almond Granola",
        description: "Crunchy granola with honey and almonds",
        price: 35.0,
        category: "healthy_snacks",
        status: "active",
        image_url: "/honey-almond-granola.png",
        stock_quantity: 25,
        created_at: new Date().toISOString(),
      },
      {
        id: 4,
        name: "Protein Powder - Vanilla",
        description: "Premium whey protein powder, vanilla flavor",
        price: 150.0,
        category: "supplements",
        status: "active",
        image_url: "/protein-powder-assortment.png",
        stock_quantity: 15,
        created_at: new Date().toISOString(),
      },
      {
        id: 5,
        name: "Energy Drink - Natural",
        description: "Natural energy drink with vitamins",
        price: 15.0,
        category: "beverages",
        status: "out_of_stock",
        image_url: "/vibrant-energy-drink.png",
        stock_quantity: 0,
        created_at: new Date().toISOString(),
      },
    ]

    return NextResponse.json({
      success: true,
      snacks: sampleSnacks,
    })
  } catch (error) {
    console.error("Error fetching snacks:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch snacks",
        snacks: [],
      },
      { status: 500 },
    )
  }
}
