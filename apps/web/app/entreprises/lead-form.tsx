"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Loader2 } from "lucide-react"

type NeedType = "event" | "daily" | "both"

const NEEDS: Array<{ v: NeedType; label: string }> = [
  { v: "event", label: "Evenement ponctuel" },
  { v: "daily", label: "Repas quotidiens" },
  { v: "both", label: "Les deux" },
]

const F =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fitnest-green"

export function LeadForm({ whatsappUrl }: { whatsappUrl: string }) {
  const [needType, setNeedType] = useState<NeedType>("daily")
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")
    const fd = new FormData(e.currentTarget)
    try {
      const res = await fetch("/api/company-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fd.get("fullName"),
          company: fd.get("company"),
          jobRole: fd.get("jobRole"),
          email: fd.get("email"),
          phone: fd.get("phone"),
          needType,
          headcount: fd.get("headcount"),
          eventDate: fd.get("eventDate") || null,
          message: fd.get("message"),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Une erreur est survenue.")
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.")
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-fitnest-green/10">
          <Check className="h-6 w-6 text-fitnest-green" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Demande bien recue</h3>
        <p className="text-gray-600">Notre equipe vous repond sous 24h ouvrees.</p>
        <Button asChild variant="outline" className="mt-4">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">Discuter sur WhatsApp</a>
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border bg-white p-6 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium mb-1">Nom complet *</label>
          <input id="fullName" name="fullName" required className={F} />
        </div>
        <div>
          <label htmlFor="company" className="block text-sm font-medium mb-1">Entreprise *</label>
          <input id="company" name="company" required className={F} />
        </div>
      </div>
      <div>
        <label htmlFor="jobRole" className="block text-sm font-medium mb-1">Fonction</label>
        <input id="jobRole" name="jobRole" className={F} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1">Telephone *</label>
          <input id="phone" name="phone" type="tel" required className={F} />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email *</label>
          <input id="email" name="email" type="email" required className={F} />
        </div>
      </div>
      <fieldset>
        <legend className="block text-sm font-medium mb-2">Type de besoin *</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {NEEDS.map((o) => (
            <label key={o.v} className={needType === o.v ? "cursor-pointer rounded-md border-2 px-3 py-2 text-sm text-center border-fitnest-green bg-fitnest-green/5" : "cursor-pointer rounded-md border-2 px-3 py-2 text-sm text-center border-gray-200"}>
              <input type="radio" name="needType" value={o.v} checked={needType === o.v} onChange={() => setNeedType(o.v)} className="sr-only" />
              {o.label}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="headcount" className="block text-sm font-medium mb-1">Nombre de personnes</label>
          <select id="headcount" name="headcount" defaultValue="10-20" className={F}>
            <option value="10-20">10 a 20</option>
            <option value="20-50">20 a 50</option>
            <option value="50+">Plus de 50</option>
          </select>
        </div>
        {(needType === "event" || needType === "both") && (
          <div>
            <label htmlFor="eventDate" className="block text-sm font-medium mb-1">Date approximative</label>
            <input id="eventDate" name="eventDate" type="date" className={F} />
          </div>
        )}
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-1">Message (optionnel)</label>
        <textarea id="message" name="message" rows={3} className={F} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit" disabled={submitting} className="bg-fitnest-orange hover:bg-fitnest-orange/90">
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Demander une offre
        </Button>
        <Button asChild type="button" variant="outline">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">Discuter sur WhatsApp</a>
        </Button>
      </div>
      <p className="text-xs text-gray-500">Reponse sous 24h ouvrees.</p>
    </form>
  )
}
