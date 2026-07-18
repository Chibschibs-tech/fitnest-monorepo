"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export interface User {
  id: number
  name: string
  email: string
  role: string
}

export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch("/api/auth/session")
      const data = await response.json()
      setUser(data.user ?? null)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      if (data.success) {
        setUser(data.user)
        return true
      }
      return false
    } catch {
      return false
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
      router.push("/")
      router.refresh()
    } catch {}
  }

  return {
    user,
    loading,
    isLoading: loading,
    status: loading ? "loading" : user ? "authenticated" : "unauthenticated",
    isAuthenticated: !!user,
    login,
    logout,
    checkSession,
  }
}
