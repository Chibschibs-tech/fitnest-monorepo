export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { ensureProductsExist } from "@/lib/db-utils"

export async function GET() {
  try {
    await ensureProductsExist()
    return NextResponse.json({ success: true, message: "Products table checked and seeded if needed" })
  } catch (error) {
    console.error("Error ensuring products exist:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to ensure products exist",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
