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

    // Fetch all snacks
    const snacks = await sql`
      SELECT 
        id,
        name,
        description,
        price,
        saleprice as sale_price,
        category,
        imageurl as image_url,
        isactive as is_available,
        stock as stock_quantity,
        created_at
      FROM products
      WHERE category IN ('protein_bars', 'supplements', 'healthy_snacks', 'beverages')
      ORDER BY created_at DESC
    `

    if (format === "json") {
      return NextResponse.json({
        success: true,
        snacks: snacks.map((snack: any) => ({
          id: snack.id,
          name: snack.name,
          description: snack.description || "",
          price: Number(snack.price) || 0,
          sale_price: snack.sale_price ? Number(snack.sale_price) : null,
          category: snack.category || "",
          image_url: snack.image_url || "",
          is_available: Boolean(snack.is_available),
          stock_quantity: Number(snack.stock_quantity) || 0,
          status: snack.is_available
            ? snack.stock_quantity > 0
              ? "active"
              : "out_of_stock"
            : "inactive",
          created_at: snack.created_at,
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
      "Stock Quantity",
      "Status",
      "Image URL",
      "Created At",
    ]
    const csvRows = [headers.join(",")]

    snacks.forEach((snack: any) => {
      const status = snack.is_available
        ? snack.stock_quantity > 0
          ? "active"
          : "out_of_stock"
        : "inactive"
      const row = [
        snack.id,
        `"${(snack.name || "").replace(/"/g, '""')}"`,
        `"${(snack.description || "").replace(/"/g, '""')}"`,
        snack.price || 0,
        snack.sale_price || "",
        snack.category || "",
        snack.stock_quantity || 0,
        status,
        snack.image_url || "",
        `"${new Date(snack.created_at).toLocaleString()}"`,
      ]
      csvRows.push(row.join(","))
    })

    const csvContent = csvRows.join("\n")

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="snacks-export.csv"',
      },
    })
  } catch (error) {
    console.error("Error exporting snacks:", error)
    return NextResponse.json({ error: "Failed to export snacks" }, { status: 500 })
  }
}




