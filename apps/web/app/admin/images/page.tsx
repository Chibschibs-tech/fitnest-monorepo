import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { ImageManager } from "./image-manager"

export const dynamic = "force-dynamic"

export default async function AdminImagesPage() {
  const session = await getServerSession(authOptions)

  // Check if user is admin
  if (!session || session.user.role !== "admin") {
    redirect("/login")
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Image Management</h1>
      <ImageManager />
    </div>
  )
}
