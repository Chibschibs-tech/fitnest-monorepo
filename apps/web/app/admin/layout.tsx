import type React from "react"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { getSessionUser } from "@/lib/simple-auth"
import AdminLayout from "./admin-layout"

export const dynamic = "force-dynamic"

export default async function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const sessionId = cookieStore.get("session-id")?.value

  if (!sessionId) {
    redirect("/login?redirect=/admin")
  }

  const user = await getSessionUser(sessionId)

  if (!user || user.role !== "admin") {
    redirect("/login?redirect=/admin")
  }

  return <AdminLayout>{children}</AdminLayout>
}
