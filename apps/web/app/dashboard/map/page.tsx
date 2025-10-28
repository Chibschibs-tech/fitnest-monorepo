import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type Status = "working" | "present-not-wired" | "missing" | "needs-fix"

type Item = {
  name: string
  path?: string
  status: Status
  note?: string
}

function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, { label: string; className: string }> = {
    working: {
      label: "Working",
      className: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    },
    "present-not-wired": {
      label: "Present • Not wired",
      className: "bg-amber-100 text-amber-800 border border-amber-200",
    },
    "needs-fix": {
      label: "Needs fix",
      className: "bg-red-100 text-red-700 border border-red-200",
    },
    missing: {
      label: "Missing",
      className: "bg-gray-100 text-gray-700 border border-gray-200",
    },
  }
  const cfg = map[status]
  return <Badge className={cfg.className}>{cfg.label}</Badge>
}

function Section({
  title,
  description,
  items,
}: {
  title: string
  description?: string
  items: Item[]
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((it) => (
          <div key={it.name} className="flex items-start justify-between gap-3 border-b pb-3 last:border-b-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {it.path ? (
                  <Link href={it.path} className="font-medium text-green-700 hover:underline truncate">
                    {it.name}
                  </Link>
                ) : (
                  <span className="font-medium">{it.name}</span>
                )}
                <StatusBadge status={it.status} />
              </div>
              {it.note ? <p className="text-sm text-muted-foreground">{it.note}</p> : null}
            </div>
            {it.path ? (
              <Link href={it.path}>
                <Button size="sm" variant="outline" className="whitespace-nowrap bg-transparent">
                  Open
                </Button>
              </Link>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default function DashboardMapPage() {
  // Pages & routes currently in the app
  const pages: Item[] = [
    {
      name: "Overview",
      path: "/dashboard",
      status: "working",
      note: "Cards + recent orders",
    },
    {
      name: "Orders (client)",
      path: "/orders",
      status: "working",
      note: "Lists subscription orders",
    },
    {
      name: "Orders (dashboard)",
      path: "/dashboard/orders",
      status: "working",
      note: "Dashboard‑scoped list",
    },
    {
      name: "Order details",
      path: "/dashboard/orders/26",
      status: "needs-fix",
      note: "Some IDs error due to payload mismatch",
    },
    {
      name: "My Meal Plans",
      path: "/dashboard/meal-plans",
      status: "missing",
      note: "Not implemented yet",
    },
    {
      name: "Delivery Schedule",
      path: "/dashboard/schedule",
      status: "missing",
      note: "Planned, not created",
    },
    { name: "Payment Methods", path: "/dashboard/payment", status: "missing" },
    {
      name: "Notifications",
      path: "/dashboard/notifications",
      status: "missing",
    },
    { name: "Account Settings", path: "/dashboard/settings", status: "missing" },
  ]

  // UI components present in the repo
  const components: Item[] = [
    {
      name: "DashboardContent (client)",
      status: "working",
      note: "Fetches /api/user/dashboard and renders overview",
    },
    {
      name: "Active Subscription (card)",
      status: "present-not-wired",
      note: "Standalone card exists; not consistently used",
    },
    {
      name: "Upcoming Deliveries (card)",
      status: "present-not-wired",
      note: "UI exists; waiting on data source",
    },
    {
      name: "Order History (card)",
      status: "present-not-wired",
      note: "UI available; overview uses a simpler list",
    },
    {
      name: "Dashboard Layout (sidebar shell)",
      status: "present-not-wired",
      note: "Adopt across all dashboard routes",
    },
  ]

  // APIs powering the dashboard
  const apis: Item[] = [
    {
      name: "GET /api/user/dashboard",
      path: "/api/user/dashboard",
      status: "working",
      note: "Returns user, orderHistory; subscriptions derived from orders with plan_id",
    },
    {
      name: "GET /api/orders",
      path: "/api/orders",
      status: "working",
      note: "Backs /orders and /dashboard/orders",
    },
    {
      name: "GET /api/orders/[id]",
      path: "/api/orders/26",
      status: "needs-fix",
      note: "Normalize payload so details page renders reliably",
    },
  ]

  // Data model & derived state
  const dataModel: Item[] = [
    {
      name: "orders",
      status: "working",
      note: "Source of truth for placed subscriptions and totals",
    },
    {
      name: "subscriptions (derived)",
      status: "working",
      note: "Any order with plan_id and not cancelled/failed is a subscription",
    },
    {
      name: "deliveries",
      status: "missing",
      note: "No table yet; upcomingDeliveries UI is placeholder",
    },
  ]

  // Prioritized gaps to close
  const gaps: Item[] = [
    {
      name: "Active Subscription tile shows 'No Plan'",
      status: "needs-fix",
      note: "Ensure /dashboard reads derived subscriptions from /api/user/dashboard",
    },
    {
      name: "Order details error for some IDs",
      status: "needs-fix",
      note: "Standardize /api/orders/[id] output and details page props",
    },
    {
      name: "Adopt Dashboard Layout shell",
      status: "present-not-wired",
      note: "Apply shared layout across dashboard routes",
    },
    {
      name: "Add 'My Meal Plans' page",
      status: "missing",
      note: "List active plan(s) and manage actions; link from overview",
    },
    {
      name: "Add deliveries persistence",
      status: "missing",
      note: "Create deliveries table/view; hydrate upcoming deliveries",
    },
  ]

  return (
    <div className="container mx-auto max-w-6xl p-6 space-y-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold">Client Dashboard Map</h1>
        <p className="text-muted-foreground">
          Current structure of pages, components, APIs and data model. Use this to validate what exists, what is wired,
          and where to focus next.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Section title="Pages & Routes" description="User‑facing routes under /dashboard and /orders" items={pages} />
        <Section title="UI Components" description="Available dashboard components in the repo" items={components} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Section title="APIs powering the dashboard" items={apis} />
        <Section title="Data model & derived state" items={dataModel} />
      </div>

      <Section title="Gaps to close" description="Targeted items to stabilize the dashboard UX" items={gaps} />

      <footer className="pt-6 text-sm text-muted-foreground">
        Tip: Keep this page updated while we iterate. It helps verify progress without digging through code.
      </footer>
    </div>
  )
}
