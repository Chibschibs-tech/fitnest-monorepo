import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { getSessionUser } from "@/lib/simple-auth"
import { DashboardLayout } from "./dashboard-layout"

export const dynamic = "force-dynamic"

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const sessionId = cookieStore.get("session-id")?.value

  if (!sessionId) {
    redirect("/login?redirect=/dashboard")
  }

  const user = await getSessionUser(sessionId)

  if (!user) {
    redirect("/login?redirect=/dashboard")
  }

  return <DashboardLayout>{children}</DashboardLayout>
}
