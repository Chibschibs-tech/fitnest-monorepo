"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"

type Slot = "protein" | "carb" | "veg" | "sauce" | "extra"

interface Component {
  id: number
  slot: Slot
  name: string
  portion_grams: number
  kcal: number
  protein_g: number
  carbs_g: number
  fat_g: number
  surcharge_mad: number
  extra_portion_price_mad: number
}

interface Settings {
  meal_type: string
  base_price_mad: number
  included_protein: number
  included_carb: number
  included_veg: number
  included_sauce: number
  max_extras: number
  protein_required: boolean
}

interface Priced {
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
}

interface SavedMeal {
  id: number
  name: string
  meal_type: string
  kcal: number
  protein_g: number
  price_mad: number
  quantity_per_week: number
}

const SLOT_LABEL: Record<Slot, string> = {
  protein: "Proteine",
  carb: "Feculent",
  veg: "Legumes",
  sauce: "Sauce",
  extra: "Supplements",
}

const MEAL_LABEL: Record<string, string> = {
  Breakfast: "Petit-dejeuner",
  Lunch: "Dejeuner",
  Dinner: "Diner",
  Snack: "Collation",
}

const SLOTS: Slot[] = ["protein", "carb", "veg", "sauce", "extra"]
const MEAL_ORDER = ["Breakfast", "Lunch", "Dinner", "Snack"]
const mealRank = (t: string) => {
  const i = MEAL_ORDER.indexOf(t)
  return i === -1 ? 99 : i
}
const num = (v: unknown) => Number(v) || 0
export function Composer() {
  const [components, setComponents] = useState<Component[]>([])
  const [settingsList, setSettingsList] = useState<Settings[]>([])
  const [mealType, setMealType] = useState("Lunch")
  const [picks, setPicks] = useState<Record<number, number>>({})
  const [priced, setPriced] = useState<Priced | null>(null)
  const [meals, setMeals] = useState<SavedMeal[]>([])
  const [name, setName] = useState("")
  const [qty, setQty] = useState(5)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const settings = useMemo(
    () => settingsList.find((s) => s.meal_type === mealType),
    [settingsList, mealType],
  )

  const loadMeals = useCallback(async () => {
    const res = await fetch("/api/compose/meals")
    const data = await res.json()
    if (data.success) setMeals(data.meals || [])
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch("/api/compose")
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error || "Chargement impossible")
        setComponents(data.components || [])
        setSettingsList(data.settings || [])
        await loadMeals()
      } catch (e) {
        setError(e instanceof Error ? e.message : "Chargement impossible")
      } finally {
        setLoading(false)
      }
    })()
  }, [loadMeals])

  useEffect(() => {
    const list = Object.entries(picks)
      .map(([id, q]) => ({ componentId: Number(id), qty: q }))
      .filter((p) => p.qty > 0)
    if (list.length === 0) {
      setPriced(null)
      return
    }
    let ignore = false
    ;(async () => {
      const res = await fetch("/api/compose/price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mealType, picks: list }),
      })
      const data = await res.json()
      if (!ignore && res.ok) setPriced(data)
    })()
    return () => {
      ignore = true
    }
  }, [picks, mealType])

  const bump = (id: number, delta: number) =>
    setPicks((p) => {
      const next = Math.max(0, (p[id] || 0) + delta)
      const copy = { ...p }
      if (next === 0) delete copy[id]
      else copy[id] = next
      return copy
    })

  const pickList = () =>
    Object.entries(picks)
      .map(([id, q]) => ({ componentId: Number(id), qty: q }))
      .filter((p) => p.qty > 0)

  const save = async () => {
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/compose/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, mealType, picks: pickList(), quantityPerWeek: qty }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Enregistrement impossible")
      setName("")
      setPicks({})
      setPriced(null)
      await loadMeals()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Enregistrement impossible")
    } finally {
      setSaving(false)
    }
  }

  const setWeekly = async (id: number, quantityPerWeek: number) => {
    await fetch("/api/compose/meals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, quantityPerWeek }),
    })
    await loadMeals()
  }

  const weekTotal = meals.reduce((s, m) => s + num(m.price_mad) * num(m.quantity_per_week), 0)
  const weekMeals = meals.reduce((s, m) => s + num(m.quantity_per_week), 0)

  if (loading) return <p className="text-sm text-gray-500">Chargement...</p>
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-xl border bg-white p-5">
          <label className="block text-sm font-medium mb-2">Type de repas</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[...settingsList].sort((a, b) => mealRank(a.meal_type) - mealRank(b.meal_type)).map((s) => (
              <button
                key={s.meal_type}
                onClick={() => { setMealType(s.meal_type); setPicks({}) }}
                className={mealType === s.meal_type ? "rounded-md border-2 px-3 py-2 text-sm border-fitnest-green bg-fitnest-green/5 font-medium" : "rounded-md border-2 px-3 py-2 text-sm border-gray-200"}
              >
                {MEAL_LABEL[s.meal_type] || s.meal_type}
              </button>
            ))}
          </div>
          {settings && (
            <p className="text-xs text-gray-500 mt-3">
              Prix de base {num(settings.base_price_mad).toFixed(0)} MAD. Inclus : {settings.included_protein} proteine, {settings.included_carb} feculent, {settings.included_veg} legumes, {settings.included_sauce} sauce. Maximum {settings.max_extras} supplements.
            </p>
          )}
        </div>

        {SLOTS.map((slot) => {
          const list = components.filter((c) => c.slot === slot)
          if (list.length === 0) return null
          return (
            <div key={slot} className="rounded-xl border bg-white p-5">
              <p className="text-sm font-medium mb-3">{SLOT_LABEL[slot]}</p>
              <div className="space-y-2">
                {list.map((c) => {
                  const q = picks[c.id] || 0
                  return (
                    <div key={c.id} className={q > 0 ? "flex items-center justify-between gap-3 rounded-md border p-3 border-fitnest-green bg-fitnest-green/5" : "flex items-center justify-between gap-3 rounded-md border p-3 border-gray-200"}>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {c.name} <span className="text-gray-500 font-normal">{c.portion_grams} g</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          {num(c.kcal)} kcal - {num(c.protein_g)}g P
                          {num(c.surcharge_mad) > 0 ? " - premium +" + num(c.surcharge_mad) + " MAD" : ""}
                          {" - portion sup. +" + num(c.extra_portion_price_mad) + " MAD"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button variant="outline" size="sm" onClick={() => bump(c.id, -1)} disabled={q === 0} aria-label="Retirer">-</Button>
                        <span className="w-6 text-center text-sm">{q}</span>
                        <Button variant="outline" size="sm" onClick={() => bump(c.id, 1)} aria-label="Ajouter">+</Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
      <div className="lg:col-span-1">
        <div className="sticky top-20 space-y-4">
          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm font-medium mb-3">Ton plat</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-md bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Calories</p>
                <p className="text-xl font-semibold">{priced ? priced.kcal : 0}</p>
              </div>
              <div className="rounded-md bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Proteines</p>
                <p className="text-xl font-semibold">{priced ? priced.protein_g : 0} g</p>
              </div>
              <div className="rounded-md bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Glucides</p>
                <p className="text-xl font-semibold">{priced ? priced.carbs_g : 0} g</p>
              </div>
              <div className="rounded-md bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Lipides</p>
                <p className="text-xl font-semibold">{priced ? priced.fat_g : 0} g</p>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Base</span>
              <span>{priced ? priced.basePrice.toFixed(2) : num(settings?.base_price_mad).toFixed(2)} MAD</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Supplements</span>
              <span>{priced ? priced.extrasPrice.toFixed(2) : "0.00"} MAD</span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t mt-2 pt-2">
              <span>Prix du plat</span>
              <span>{priced ? priced.total.toFixed(2) : "0.00"} MAD</span>
            </div>
            {priced && (
              <p className="text-xs text-gray-500 mt-1">{priced.extrasUsed} / {priced.maxExtras} supplements utilises</p>
            )}
            {priced && !priced.valid && <p className="text-sm text-red-600 mt-2">{priced.errors[0]}</p>}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom de ton plat"
              className="w-full mt-4 rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <div className="flex items-center gap-2 mt-2">
              <label className="text-sm text-gray-600">Fois par semaine</label>
              <input
                type="number"
                min={1}
                max={21}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm"
              />
            </div>
            <Button
              onClick={save}
              disabled={saving || !name.trim() || !priced || !priced.valid}
              className="w-full mt-3 bg-fitnest-orange hover:bg-fitnest-orange/90"
            >
              Enregistrer dans mes plats
            </Button>
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm font-medium mb-3">Mes plats - ma semaine</p>
            {meals.length === 0 ? (
              <p className="text-sm text-gray-500">Aucun plat enregistre pour le moment.</p>
            ) : (
              <div className="space-y-2">
                {meals.map((m) => (
                  <div key={m.id} className="flex items-center justify-between gap-2 border-b pb-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{m.name}</p>
                      <p className="text-xs text-gray-500">
                        {num(m.kcal)} kcal - {num(m.protein_g)}g P - {num(m.price_mad).toFixed(2)} MAD
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="outline" size="sm" onClick={() => setWeekly(m.id, num(m.quantity_per_week) - 1)}>-</Button>
                      <span className="w-6 text-center text-sm">{m.quantity_per_week}</span>
                      <Button variant="outline" size="sm" onClick={() => setWeekly(m.id, num(m.quantity_per_week) + 1)}>+</Button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between font-semibold pt-2">
                  <span>Total semaine - {weekMeals} plats</span>
                  <span>{weekTotal.toFixed(2)} MAD</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
