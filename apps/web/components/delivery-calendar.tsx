"use client"

import "react-day-picker/dist/style.css"
import "./delivery-calendar.css"

import { useEffect, useMemo, useState } from "react"
import { DayPicker } from "react-day-picker"
import { enGB } from "date-fns/locale"
import { addDays, compareAsc, endOfDay, format, isSameDay, startOfDay, startOfWeek } from "date-fns"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants, Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type Props = {
  value: Date[]
  onChange: (dates: Date[]) => void
  /**
   * Final, already-adjusted week window passed from the parent:
   * - 1 Week => 2 (current week + next week)
   * - 2 Weeks => 3
   * - 1 Month => 4
   *
   * Do not add any extra week in this component.
   */
  allowedWeeks: number
  className?: string
}

/**
 * DeliveryCalendar
 * - 48h rule: today and tomorrow are disabled
 * - Week window: starts at current week's Monday and spans `allowedWeeks` weeks (inclusive)
 * - Two months side-by-side on ≥640px to reduce empty space
 * - Selected dates chips + Clear all
 * - No blue rings, solid green selection
 */
export function DeliveryCalendar({ value, onChange, allowedWeeks, className }: Props) {
  const today = new Date()

  // 48-hour rule: earliest selectable day is start-of-day, two days from now
  const minSelectable = startOfDay(addDays(today, 2))

  // Window anchor: start of THIS week (Monday), with day boundaries normalized
  const weekStartsOn = 1 as const // Monday
  const anchorStart = startOfDay(startOfWeek(today, { weekStartsOn }))

  // Respect the parent-provided weeks exactly; do NOT add any extra week here.
  const weeks = Math.max(1, allowedWeeks || 1)
  const allowedEnd = endOfDay(addDays(anchorStart, weeks * 7 - 1))

  // Responsive: 2 months on ≥640px, 1 month on small screens
  const [months, setMonths] = useState(2)
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 640px)")
    const update = () => setMonths(mql.matches ? 1 : 2)
    update()
    mql.addEventListener("change", update)
    return () => mql.removeEventListener("change", update)
  }, [])

  // Chips helpers
  const selectedSorted = useMemo(() => [...value].sort((a, b) => compareAsc(startOfDay(a), startOfDay(b))), [value])
  const removeDate = (d: Date) => onChange(value.filter((v) => !isSameDay(v, d)))
  const clearAll = () => onChange([])

  return (
    <div className={cn("rounded-xl border bg-white p-4", className)}>
      <DayPicker
        locale={enGB}
        mode="multiple"
        selected={value}
        onSelect={(days) => onChange(days || [])}
        // Disable: everything before 48h-min OR after the computed window end
        disabled={[{ before: minSelectable }, { after: allowedEnd }]}
        // Clamp navigation and start users on the first selectable month
        defaultMonth={minSelectable}
        fromDate={minSelectable}
        toDate={allowedEnd}
        showOutsideDays
        numberOfMonths={months}
        className="rdp fitnest-calendar"
        classNames={{
          // Layout
          months: "flex w-full flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-base font-semibold",

          // Navigation
          nav: "space-x-2 flex items-center",
          nav_button: cn(
            buttonVariants({ variant: "outline" }),
            "h-8 w-8 bg-transparent p-0 opacity-80 hover:opacity-100",
          ),
          nav_button_previous: "absolute left-2",
          nav_button_next: "absolute right-2",

          // Grid
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell:
            "text-muted-foreground rounded-md w-10 font-medium text-[0.8rem] text-center select-none tabular-nums",
          row: "flex w-full mt-1",
          cell: "h-10 w-10 text-center text-sm p-0 relative",

          // Day button (avoid ring utilities)
          day_button:
            "h-10 w-10 p-0 rounded-full font-medium cursor-pointer " +
            "focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 border-0",

          // States
          day_outside: "text-muted-foreground opacity-40",
          day_disabled: "opacity-60 cursor-not-allowed",
          day_hidden: "invisible",
        }}
        components={{
          IconLeft: () => <ChevronLeft className="h-4 w-4" />,
          IconRight: () => <ChevronRight className="h-4 w-4" />,
        }}
        // Extra safety overrides (no blue rings)
        styles={{
          day_button: {
            outline: "none",
            boxShadow: "none",
            border: "none",
            WebkitTapHighlightColor: "transparent",
            borderRadius: 9999,
          },
          day_selected: {
            backgroundColor: "#015033", // Fitnest green
            color: "#ffffff",
            border: "none",
            boxShadow: "none",
            outline: "none",
          },
          day_today: {
            border: "1px solid #d1d5db", // gray-300
            borderRadius: 9999,
          },
          day_disabled: {
            color: "#9ca3af", // gray-400
            backgroundColor: "#f3f4f6", // gray-100
            borderRadius: 9999,
          },
        }}
      />

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: "#015033" }} />
          Selected
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-gray-200" />
          Unavailable
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full border border-gray-300 bg-white" />
          Today
        </span>
      </div>

      {/* Selected date chips + Clear all */}
      <div className="mt-5 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-gray-700">Selected dates</p>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-gray-600 hover:text-gray-900"
            onClick={clearAll}
            disabled={selectedSorted.length === 0}
          >
            Clear all
          </Button>
        </div>

        {selectedSorted.length === 0 ? (
          <p className="text-sm text-gray-500">No dates selected yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedSorted.map((d) => {
              const key = format(d, "yyyy-MM-dd")
              const label = format(d, "EEE, MMM d") // e.g., Thu, Aug 14
              return (
                <Badge
                  key={key}
                  variant="secondary"
                  className="inline-flex items-center gap-2 rounded-full bg-gray-100 text-gray-800"
                >
                  {label}
                  <button
                    type="button"
                    onClick={() => removeDate(d)}
                    aria-label={`Remove ${label}`}
                    className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-gray-600 hover:text-gray-900 focus:outline-none"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
