"use client"

import { useState, useEffect } from "react"

export function useSafeSession() {
  const [session, setSession] = useState<any>(null)
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading")

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/auth/session")
        const data = await res.json()

        if (data.user) {
          setSession({ user: data.user })
          setStatus("authenticated")
        } else {
          setStatus("unauthenticated")
        }
      } catch (error) {
        console.error("Failed to fetch session:", error)
        setStatus("unauthenticated")
      }
    }

    fetchSession()
  }, [])

  return {
    data: session,
    status,
  }
}

export default useSafeSession
