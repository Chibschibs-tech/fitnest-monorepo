"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

interface Component {
  id: number
  slot: string
  name: string
  portion_grams: number
  kcal: number
  protein_g: number
  carbs_g: number
  fat_g: number
  surcharge_mad: number
  extra_portion_price_mad: number
  is_active: boolean
  sort_order: number
}

interface Setting {
  id: number
  meal_type: string
  base_price_mad: number
  included_protein: number
  included_carb: number
  included_veg: number
  included_sauce: number
  max_extras: number
  protein_required: boolean
  is_active: boolean
}

const SLOT_LABEL: Record<string, string> = {
  protein: "Protéines",
  carb: "Féculents",
  veg: "Légumes",
  sauce: "Sauces",
  extra: "Suppléments",
}
const SLOTS = ["protein", "carb", "veg", "sauce", "extra"]
const num = (v: unknown) => Number(v) || 0
const cell = "w-20 rounded-md border border-gray-300 px-2 py-1 text-sm"
export default function ComposeAdminPage() {
  const [components, setComponents] = useState<Component[]>([])
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState("")
  const [newItem, setNewItem] = useState({ slot: "protein", name: "", portion_grams: 150, kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0, surcharge_mad: 0, extra_portion_price_mad: 0 })

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/compose")
    const data = await res.json()
    if (data.success) {
      setComponents(data.components || [])
      setSettings(data.settings || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const flash = (t: string) => { setMsg(t); setTimeout(() => setMsg(""), 2500) }

  const saveComponent = async (c: Component) => {
    const res = await fetch("/api/admin/compose/components/" + c.id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(c),
    })
    flash(res.ok ? "Enregistre" : "Erreur")
  }

  const saveSetting = async (s: Setting) => {
    const res = await fetch("/api/admin/compose/settings/" + s.id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(s),
    })
    flash(res.ok ? "Enregistre" : "Erreur")
  }

  const archive = async (id: number) => {
    await fetch("/api/admin/compose/components/" + id, { method: "DELETE" })
    await load()
    flash("Retiré du catalogue")
  }

  const create = async () => {
    const res = await fetch("/api/admin/compose", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    })
    if (res.ok) {
      setNewItem({ ...newItem, name: "" })
      await load()
      flash("Ingrédient ajouté")
    } else {
      flash("Erreur")
    }
  }

  const patch = (id: number, field: keyof Component, value: unknown) =>
    setComponents((list) => list.map((c) => (c.id === id ? { ...c, [field]: value } : c)))

  const patchSetting = (id: number, field: keyof Setting, value: unknown) =>
    setSettings((list) => list.map((s) => (s.id === id ? { ...s, [field]: value } : s)))

  if (loading) return <div className="p-8">Chargement…</div>
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Compose ton plan</h1>
          <p className="text-gray-600 mt-1">Prix de base, règles par repas et catalogue d'ingrédients. Toute modification est immédiatement visible sur le site.</p>
        </div>

        {msg && <div className="mb-4 rounded-md bg-green-50 border border-green-200 px-4 py-2 text-sm text-green-800">{msg}</div>}

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-1">Règles par type de repas</h2>
          <p className="text-sm text-gray-600 mb-3">Le prix de base couvre les quantités incluses ci-dessous. Au-delà, le client paie un supplément.</p>
          <div className="overflow-x-auto rounded-xl border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="p-3">Repas</th>
                  <th className="p-3">Prix de base</th>
                  <th className="p-3">Protéines incl.</th>
                  <th className="p-3">Féculents incl.</th>
                  <th className="p-3">Légumes incl.</th>
                  <th className="p-3">Sauces incl.</th>
                  <th className="p-3">Max suppléments</th>
                  <th className="p-3">Protéine obligatoire</th>
                  <th className="p-3">Actif</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {settings.map((s) => (
                  <tr key={s.id} className="border-t">
                    <td className="p-3 font-medium">{s.meal_type}</td>
                    <td className="p-3"><input type="number" className={cell} value={num(s.base_price_mad)} onChange={(e) => patchSetting(s.id, "base_price_mad", Number(e.target.value))} /></td>
                    <td className="p-3"><input type="number" className={cell} value={s.included_protein} onChange={(e) => patchSetting(s.id, "included_protein", Number(e.target.value))} /></td>
                    <td className="p-3"><input type="number" className={cell} value={s.included_carb} onChange={(e) => patchSetting(s.id, "included_carb", Number(e.target.value))} /></td>
                    <td className="p-3"><input type="number" className={cell} value={s.included_veg} onChange={(e) => patchSetting(s.id, "included_veg", Number(e.target.value))} /></td>
                    <td className="p-3"><input type="number" className={cell} value={s.included_sauce} onChange={(e) => patchSetting(s.id, "included_sauce", Number(e.target.value))} /></td>
                    <td className="p-3"><input type="number" className={cell} value={s.max_extras} onChange={(e) => patchSetting(s.id, "max_extras", Number(e.target.value))} /></td>
                    <td className="p-3"><input type="checkbox" checked={s.protein_required} onChange={(e) => patchSetting(s.id, "protein_required", e.target.checked)} /></td>
                    <td className="p-3"><input type="checkbox" checked={s.is_active} onChange={(e) => patchSetting(s.id, "is_active", e.target.checked)} /></td>
                    <td className="p-3"><Button size="sm" onClick={() => saveSetting(s)}>Enregistrer</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-1">Catalogue d'ingrédients</h2>
          <p className="text-sm text-gray-600 mb-3">Premium = supplément payé même dans la portion incluse. Portion sup. = prix d'une portion au-delà de l'inclus.</p>

          <div className="rounded-xl border bg-white p-4 mb-6">
            <p className="text-sm font-medium mb-3">Ajouter un ingrédient</p>
            <div className="flex flex-wrap gap-2 items-end">
              <select value={newItem.slot} onChange={(e) => setNewItem({ ...newItem, slot: e.target.value })} className="rounded-md border border-gray-300 px-2 py-1 text-sm">
                {SLOTS.map((s) => <option key={s} value={s}>{SLOT_LABEL[s]}</option>)}
              </select>
              <input placeholder="Nom" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} className="rounded-md border border-gray-300 px-2 py-1 text-sm" />
              <input type="number" title="Portion (g)" value={newItem.portion_grams} onChange={(e) => setNewItem({ ...newItem, portion_grams: Number(e.target.value) })} className={cell} />
              <input type="number" title="kcal" value={newItem.kcal} onChange={(e) => setNewItem({ ...newItem, kcal: Number(e.target.value) })} className={cell} />
              <input type="number" title="Protéines (g)" value={newItem.protein_g} onChange={(e) => setNewItem({ ...newItem, protein_g: Number(e.target.value) })} className={cell} />
              <input type="number" title="Glucides (g)" value={newItem.carbs_g} onChange={(e) => setNewItem({ ...newItem, carbs_g: Number(e.target.value) })} className={cell} />
              <input type="number" title="Lipides (g)" value={newItem.fat_g} onChange={(e) => setNewItem({ ...newItem, fat_g: Number(e.target.value) })} className={cell} />
              <input type="number" title="Supplement premium (MAD)" value={newItem.surcharge_mad} onChange={(e) => setNewItem({ ...newItem, surcharge_mad: Number(e.target.value) })} className={cell} />
              <input type="number" title="Prix portion supplementaire (MAD)" value={newItem.extra_portion_price_mad} onChange={(e) => setNewItem({ ...newItem, extra_portion_price_mad: Number(e.target.value) })} className={cell} />
              <Button onClick={create} disabled={!newItem.name.trim()}>Ajouter</Button>
            </div>
          </div>
          {SLOTS.map((slot) => {
            const list = components.filter((c) => c.slot === slot)
            if (list.length === 0) return null
            return (
              <div key={slot} className="mb-6">
                <h3 className="text-base font-medium mb-2">{SLOT_LABEL[slot]}</h3>
                <div className="overflow-x-auto rounded-xl border bg-white">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-left">
                      <tr>
                        <th className="p-3">Nom</th>
                        <th className="p-3">Portion</th>
                        <th className="p-3">kcal</th>
                        <th className="p-3">P</th>
                        <th className="p-3">G</th>
                        <th className="p-3">L</th>
                        <th className="p-3">Premium</th>
                        <th className="p-3">Sup.</th>
                        <th className="p-3">Actif</th>
                        <th className="p-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.map((c) => (
                        <tr key={c.id} className={c.is_active ? "border-t" : "border-t opacity-50"}>
                          <td className="p-3"><input value={c.name} onChange={(e) => patch(c.id, "name", e.target.value)} className="w-44 rounded-md border border-gray-300 px-2 py-1 text-sm" /></td>
                          <td className="p-3"><input type="number" className={cell} value={num(c.portion_grams)} onChange={(e) => patch(c.id, "portion_grams", Number(e.target.value))} /></td>
                          <td className="p-3"><input type="number" className={cell} value={num(c.kcal)} onChange={(e) => patch(c.id, "kcal", Number(e.target.value))} /></td>
                          <td className="p-3"><input type="number" className={cell} value={num(c.protein_g)} onChange={(e) => patch(c.id, "protein_g", Number(e.target.value))} /></td>
                          <td className="p-3"><input type="number" className={cell} value={num(c.carbs_g)} onChange={(e) => patch(c.id, "carbs_g", Number(e.target.value))} /></td>
                          <td className="p-3"><input type="number" className={cell} value={num(c.fat_g)} onChange={(e) => patch(c.id, "fat_g", Number(e.target.value))} /></td>
                          <td className="p-3"><input type="number" className={cell} value={num(c.surcharge_mad)} onChange={(e) => patch(c.id, "surcharge_mad", Number(e.target.value))} /></td>
                          <td className="p-3"><input type="number" className={cell} value={num(c.extra_portion_price_mad)} onChange={(e) => patch(c.id, "extra_portion_price_mad", Number(e.target.value))} /></td>
                          <td className="p-3"><input type="checkbox" checked={c.is_active} onChange={(e) => patch(c.id, "is_active", e.target.checked)} /></td>
                          <td className="p-3 whitespace-nowrap">
                            <Button size="sm" onClick={() => saveComponent(c)}>Enregistrer</Button>{" "}
                            <Button size="sm" variant="outline" onClick={() => archive(c.id)}>Retirer</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}
        </section>
      </div>
    </div>
  )
}
