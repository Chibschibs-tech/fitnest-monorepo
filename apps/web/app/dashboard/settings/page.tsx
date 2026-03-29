import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { getSessionUser } from "@/lib/simple-auth"
import { SettingsContent } from "./settings-content"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const cookieStore = cookies()
  const sessionId = cookieStore.get("session-id")?.value

  if (!sessionId) {
    redirect("/login?redirect=/dashboard/settings")
  }

  const user = await getSessionUser(sessionId)

  if (!user) {
    redirect("/login?redirect=/dashboard/settings")
  }

  return <SettingsContent user={user} />
}
