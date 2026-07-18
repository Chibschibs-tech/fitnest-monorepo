import { priceComposedMeal, weeklyTotal, type ComposeComponent, type ComposeSettings } from "../lib/compose-pricing.ts"

const C: ComposeComponent[] = [
  { id: 1, slot: "protein", name: "Poulet", portion_grams: 150, kcal: 248, protein_g: 46.5, carbs_g: 0, fat_g: 5.4, surcharge_mad: 0, extra_portion_price_mad: 25 },
  { id: 5, slot: "protein", name: "Boeuf", portion_grams: 150, kcal: 326, protein_g: 39, carbs_g: 0, fat_g: 18, surcharge_mad: 10, extra_portion_price_mad: 30 },
  { id: 7, slot: "carb", name: "Riz", portion_grams: 180, kcal: 234, protein_g: 4.8, carbs_g: 50, fat_g: 0.5, surcharge_mad: 0, extra_portion_price_mad: 10 },
  { id: 11, slot: "veg", name: "Brocoli", portion_grams: 100, kcal: 34, protein_g: 2.8, carbs_g: 7, fat_g: 0.4, surcharge_mad: 0, extra_portion_price_mad: 5 },
  { id: 12, slot: "veg", name: "Melange", portion_grams: 100, kcal: 45, protein_g: 2, carbs_g: 9, fat_g: 0.3, surcharge_mad: 0, extra_portion_price_mad: 5 },
  { id: 13, slot: "veg", name: "Epinards", portion_grams: 100, kcal: 23, protein_g: 2.9, carbs_g: 3.6, fat_g: 0.4, surcharge_mad: 0, extra_portion_price_mad: 5 },
  { id: 16, slot: "sauce", name: "Sauce", portion_grams: 50, kcal: 30, protein_g: 1, carbs_g: 6, fat_g: 0.3, surcharge_mad: 0, extra_portion_price_mad: 5 },
  { id: 20, slot: "extra", name: "Avocat", portion_grams: 70, kcal: 112, protein_g: 1.4, carbs_g: 6, fat_g: 10, surcharge_mad: 12, extra_portion_price_mad: 12 },
]

const LUNCH: ComposeSettings = {
  meal_type: "Lunch", base_price_mad: 65,
  included_protein: 1, included_carb: 1, included_veg: 2, included_sauce: 1,
  max_extras: 3, protein_required: true,
}

let pass = 0, fail = 0
function eq(name: string, got: unknown, exp: unknown) {
  const ok = got === exp
  console.log((ok ? "PASS  " : "FAIL  ") + name + ": got " + String(got) + " expected " + String(exp))
  if (ok) { pass++ } else { fail++ }
}

const P = (picks: Array<[number, number]>, s = LUNCH) =>
  priceComposedMeal(picks.map(([componentId, qty]) => ({ componentId, qty })), C, s)

const A = P([[1,1],[7,1],[11,1],[12,1],[16,1]])
eq("A total base only", A.total, 65)
eq("A extrasUsed", A.extrasUsed, 0)
eq("A kcal", A.kcal, 591)
eq("A valid", A.valid, true)

const B = P([[1,2],[7,1],[11,1],[12,1],[16,1]])
eq("B double protein total", B.total, 90)
eq("B extrasUsed", B.extrasUsed, 1)
eq("B kcal", B.kcal, 839)
eq("B protein_g", B.protein_g, 103.6)

const Cc = P([[5,1],[7,1]])
eq("C premium in allowance", Cc.total, 75)
eq("C extrasUsed", Cc.extrasUsed, 0)

const D = P([[5,2],[7,1]])
eq("D premium doubled", D.total, 105)

const E = P([[1,1],[11,1],[12,1],[13,1]])
eq("E third veg", E.total, 70)
eq("E extrasUsed", E.extrasUsed, 1)

const F = P([[1,1],[20,1]])
eq("F extra slot never free", F.total, 77)

const G = P([[7,1]])
eq("G protein required", G.valid, false)

const H = P([[1,5]])
eq("H extrasUsed", H.extrasUsed, 4)
eq("H over max_extras", H.valid, false)

const I = P([[1,5]], { ...LUNCH, max_extras: 4 })
eq("I configurable max_extras", I.valid, true)

eq("J weekly total", weeklyTotal([{ price_mad: 90, quantity_per_week: 5 }, { price_mad: 70, quantity_per_week: 6 }]), 870)

console.log("\n" + pass + " passed, " + fail + " failed")
process.exit(fail ? 1 : 0)