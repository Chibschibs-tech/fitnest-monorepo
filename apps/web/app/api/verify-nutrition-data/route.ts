// app/api/verify-nutrition-data/route.ts
import { NextResponse } from "next/server";
import { getBaseUrl } from "@/lib/base-url";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const base = getBaseUrl();

  // Liste d'aliments à vérifier (tu peux garder/adapter la tienne)
  const items = [
    "Chicken Breast (skinless)",
    "Salmon Fillet",
    "Ground Turkey (lean)",
    "Lean Beef",
    "Fresh Tuna",
    "Whole Eggs",
    "Egg Whites",
    "Firm Tofu",
    "Quinoa (cooked)",
    "Brown Rice (cooked)",
    "Sweet Potato",
    "Rolled Oats",
    "Whole Wheat Tortilla",
    "Broccoli",
    "Spinach",
    "Bell Peppers",
    "Carrots",
    "Zucchini",
    "Asparagus",
    "Mushrooms",
    "Avocado",
    "Extra Virgin Olive Oil",
    "Almonds",
    "Walnuts",
    "Greek Yogurt (plain)",
    "Cottage Cheese (low-fat)",
    "Blueberries",
    "Strawberries",
    "Banana",
  ];

  const results: Array<{ name: string; ok: boolean; error?: string }> = [];

  for (const name of items) {
    try {
      const res = await fetch(
        `${base}/api/nutrition-lookup?query=${encodeURIComponent(name)}`,
        { cache: "no-store" }
      );
      results.push({ name, ok: res.ok });
    } catch (e: any) {
      results.push({ name, ok: false, error: e?.message ?? String(e) });
    }
  }

  return NextResponse.json({ ok: true, count: results.length, results });
}
