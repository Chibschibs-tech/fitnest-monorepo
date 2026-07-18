/**
 * "Compose ton plan" pricing (build-your-own-bowl model).
 *
 * Base price buys a slot allowance (e.g. 1 protein, 1 carb, 2 veg, 1 sauce).
 * Only three things add cost:
 *   1. premium pick inside the allowance -> surcharge_mad
 *   2. portion beyond the allowance      -> extra_portion_price_mad
 *   3. item from the "extra" slot        -> extra_portion_price_mad
 *
 * Base price, allowances, surcharges, max_extras and protein_required all live
 * in the DB and are edited from the admin panel. Nothing here is hardcoded.
 */

export type Slot = "protein" | "carb" | "veg" | "sauce" | "extra"

export interface ComposeComponent {
  id: number
  slot: Slot
  name: string
  portion_grams: number
  kcal: number | string
  protein_g: number | string
  carbs_g: number | string
  fat_g: number | string
  surcharge_mad: number | string
  extra_portion_price_mad: number | string
}

export interface ComposeSettings {
  meal_type: string
  base_price_mad: number | string
  included_protein: number
  included_carb: number
  included_veg: number
  included_sauce: number
  max_extras: number
  protein_required: boolean
}

export interface Pick {
  componentId: number
  qty: number
}

export interface ComposeLine {
  componentId: number
  name: string
  slot: Slot
  qty: number
  includedQty: number
  extraQty: number
  lineTotal: number
}

export interface ComposeResult {
  valid: boolean
  errors: string[]
  basePrice: number
  extrasPrice: number
  total: number
  kcal: number
  protein_g: number
  carbs_g: number
  fat_g: number
  extrasUsed: number
  maxExtras: number
  lines: ComposeLine[]
}

const n = (v: number | string | null | undefined) => parseFloat(String(v == null ? 0 : v)) || 0
const round2 = (v: number) => Math.round(v * 100) / 100

function allowanceFor(slot: Slot, s: ComposeSettings): number {
  if (slot === "protein") return s.included_protein
  if (slot === "carb") return s.included_carb
  if (slot === "veg") return s.included_veg
  if (slot === "sauce") return s.included_sauce
  return 0
}

export function priceComposedMeal(
  picks: Pick[],
  components: ComposeComponent[],
  settings: ComposeSettings,
): ComposeResult {
  const byId = new Map(components.map((c) => [c.id, c]))
  const errors: string[] = []
  const basePrice = n(settings.base_price_mad)
  let extrasPrice = 0
  let kcal = 0
  let protein_g = 0
  let carbs_g = 0
  let fat_g = 0
  let extrasUsed = 0
  let proteinUnits = 0

  const remaining: Record<Slot, number> = {
    protein: allowanceFor("protein", settings),
    carb: allowanceFor("carb", settings),
    veg: allowanceFor("veg", settings),
    sauce: allowanceFor("sauce", settings),
    extra: 0,
  }

  const lines: ComposeLine[] = []

  for (const pick of picks) {
    const c = byId.get(pick.componentId)
    if (!c) {
      errors.push("Composant introuvable: " + pick.componentId)
      continue
    }
    const qty = Math.max(0, Math.floor(pick.qty || 0))
    if (qty === 0) continue

    if (c.slot === "protein") proteinUnits += qty

    const free = Math.max(0, remaining[c.slot])
    const includedQty = Math.min(qty, free)
    const extraQty = qty - includedQty
    remaining[c.slot] = free - includedQty

    const includedCost = includedQty * n(c.surcharge_mad)
    const extraCost = extraQty * n(c.extra_portion_price_mad)

    extrasPrice += includedCost + extraCost
    extrasUsed += extraQty

    kcal += qty * n(c.kcal)
    protein_g += qty * n(c.protein_g)
    carbs_g += qty * n(c.carbs_g)
    fat_g += qty * n(c.fat_g)

    lines.push({
      componentId: c.id,
      name: c.name,
      slot: c.slot,
      qty,
      includedQty,
      extraQty,
      lineTotal: round2(includedCost + extraCost),
    })
  }

  if (settings.protein_required && proteinUnits === 0) {
    errors.push("Une protéine est obligatoire.")
  }
  if (extrasUsed > settings.max_extras) {
    errors.push("Maximum " + settings.max_extras + " supplements par plat.")
  }

  return {
    valid: errors.length === 0,
    errors,
    basePrice: round2(basePrice),
    extrasPrice: round2(extrasPrice),
    total: round2(basePrice + extrasPrice),
    kcal: Math.round(kcal),
    protein_g: round2(protein_g),
    carbs_g: round2(carbs_g),
    fat_g: round2(fat_g),
    extrasUsed,
    maxExtras: settings.max_extras,
    lines,
  }
}

export function weeklyTotal(
  meals: Array<{ price_mad: number | string; quantity_per_week: number }>,
): number {
  return round2(
    meals.reduce((sum, m) => sum + n(m.price_mad) * (m.quantity_per_week || 0), 0),
  )
}