"use client"

import { useEffect, useState } from "react"

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthStatus {
  user: User | null
  authenticated: boolean
}

export function AuthStatusChecker() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>({ user: null, authenticated: false })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuthStatus() {
      try {
        const response = await fetch("/api/auth-status")
        const data = await response.json()
        setAuthStatus(data)
      } catch (error) {
        console.error("Error checking auth status:", error)
        setAuthStatus({ user: null, authenticated: false })
      } finally {
        setLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  if (loading) {
    return <div>Checking authentication...</div>
  }

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold">Auth Status</h3>
      <p>Authenticated: {authStatus.authenticated ? "Yes" : "No"}</p>
      {authStatus.user && (
        <div>
          <p>User: {authStatus.user.name}</p>
          <p>Email: {authStatus.user.email}</p>
          <p>Role: {authStatus.user.role}</p>
        </div>
      )}
    </div>
  )
}
