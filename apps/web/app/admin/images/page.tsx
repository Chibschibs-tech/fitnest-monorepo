import { cookies } from "next/headers"
import { getSessionUser } from "@/lib/simple-auth"
import { redirect } from "next/navigation"
import { ImageManager } from "./image-manager"

export const dynamic = "force-dynamic"

export default async function AdminImagesPage() {
  const cookieStore = cookies()
  const sessionId = cookieStore.get("session-id")?.value
  if (!sessionId) {
    redirect("/login")
  }
  const user = await getSessionUser(sessionId)
  if (!user || user.role !== "admin") {
    redirect("/login")
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Image Management</h1>
      <ImageManager />
    </div>
  )
}
