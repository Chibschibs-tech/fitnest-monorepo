"use client"

import { useState, useEffect, useContext } from "react"
import { useRouter } from "next/navigation"
import { AuthContext } from "@/components/auth-provider"

export function useAuth() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const { user, loading, setUser } = useContext(AuthContext)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setError(null)
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        if (setUser) setUser(data.user)
        router.push("/dashboard")
        router.refresh()
        return true
      } else {
        setError(data.error || "Invalid email or password")
        return false
      }
    } catch (error) {
      setError("An unexpected error occurred")
      return false
    }
  }

  const logout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })

      if (response.ok) {
        if (setUser) setUser(null)
        router.push("/")
        router.refresh()
        return true
      }
      return false
    } catch (error) {
      return false
    }
  }

  // If not mounted yet, return a safe placeholder
  if (!mounted) {
    return {
      user: null,
      status: "loading",
      login,
      logout,
      error: null,
      isAuthenticated: false,
    }
  }

  return {
    user,
    status: loading ? "loading" : user ? "authenticated" : "unauthenticated",
    login,
    logout,
    error,
    isAuthenticated: !!user,
  }
}
