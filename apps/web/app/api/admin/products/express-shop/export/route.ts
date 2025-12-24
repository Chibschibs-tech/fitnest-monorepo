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

    // Fetch all express shop products
    const products = await sql`
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
      ORDER BY created_at DESC
    `

    if (format === "json") {
      return NextResponse.json({
        success: true,
        products: products.map((product: any) => ({
          id: product.id,
          name: product.name,
          description: product.description || "",
          price: Number(product.price) || 0,
          sale_price: product.sale_price ? Number(product.sale_price) : null,
          category: product.category || "",
          brand: product.brand || "",
          image_url: product.image_url || "",
          is_available: Boolean(product.is_available),
          stock_quantity: Number(product.stock_quantity) || 0,
          created_at: product.created_at,
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

    products.forEach((product: any) => {
      const row = [
        product.id,
        `"${(product.name || "").replace(/"/g, '""')}"`,
        `"${(product.description || "").replace(/"/g, '""')}"`,
        product.price || 0,
        product.sale_price || "",
        product.category || "",
        product.brand || "",
        product.stock_quantity || 0,
        product.is_available ? "Yes" : "No",
        product.image_url || "",
        `"${new Date(product.created_at).toLocaleString()}"`,
      ]
      csvRows.push(row.join(","))
    })

    const csvContent = csvRows.join("\n")

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="express-shop-export.csv"',
      },
    })
  } catch (error) {
    console.error("Error exporting express shop products:", error)
    return NextResponse.json({ error: "Failed to export products" }, { status: 500 })
  }
}




