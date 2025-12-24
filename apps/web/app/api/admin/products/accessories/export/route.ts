import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSessionUser } from "@/lib/simple-auth"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const sessionId = cookieStore.get("session-id")?.value

    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getSessionUser(sessionId)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "csv"

    // Fetch all accessories
    const accessories = await sql`
      SELECT 
        id,
        name,
        description,
        price,
        saleprice as sale_price,
        category,
        brand,
        imageurl as image_url,
        isactive as is_available,
        stock as stock_quantity,
        created_at
      FROM products
      WHERE category IN ('bag', 'bottle', 'apparel', 'equipment', 'accessory')
      ORDER BY created_at DESC
    `

    if (format === "json") {
      return NextResponse.json({
        success: true,
        accessories: accessories.map((acc: any) => ({
          id: acc.id,
          name: acc.name,
          description: acc.description || "",
          price: Number(acc.price) || 0,
          sale_price: acc.sale_price ? Number(acc.sale_price) : null,
          category: acc.category || "",
          brand: acc.brand || "",
          image_url: acc.image_url || "",
          is_available: Boolean(acc.is_available),
          stock_quantity: Number(acc.stock_quantity) || 0,
          created_at: acc.created_at,
        })),
        exported_at: new Date().toISOString(),
      })
    }

    // CSV format
    const headers = [
      "ID",
      "Name",
      "Description",
      "Price (MAD)",
      "Sale Price (MAD)",
      "Category",
      "Brand",
      "Stock Quantity",
      "Available",
      "Image URL",
      "Created At",
    ]
    const csvRows = [headers.join(",")]

    accessories.forEach((acc: any) => {
      const row = [
        acc.id,
        `"${(acc.name || "").replace(/"/g, '""')}"`,
        `"${(acc.description || "").replace(/"/g, '""')}"`,
        acc.price || 0,
        acc.sale_price || "",
        acc.category || "",
        acc.brand || "",
        acc.stock_quantity || 0,
        acc.is_available ? "Yes" : "No",
        acc.image_url || "",
        `"${new Date(acc.created_at).toLocaleString()}"`,
      ]
      csvRows.push(row.join(","))
    })

    const csvContent = csvRows.join("\n")

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="accessories-export.csv"',
      },
    })
  } catch (error) {
    console.error("Error exporting accessories:", error)
    return NextResponse.json({ error: "Failed to export accessories" }, { status: 500 })
  }
}




