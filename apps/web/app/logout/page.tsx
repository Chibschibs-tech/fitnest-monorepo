"use client"

import { useEffect } from "react"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    const performLogout = async () => {
      try {
        await signOut({ redirect: false })
        router.push("/")
      } catch (error) {
        console.error("Logout error:", error)
        // Fallback manual logout
        document.cookie = "next-auth.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
        document.cookie = "next-auth.csrf-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
        document.cookie = "next-auth.callback-url=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
        router.push("/")
      }
    }

    performLogout()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Logging out...</h1>
        <p className="mt-2 text-gray-600">Please wait while we log you out.</p>
      </div>
    </div>
  )
}
