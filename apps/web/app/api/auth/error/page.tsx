"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  let errorMessage = "An authentication error occurred"

  // Handle specific error types
  if (error === "CredentialsSignin") {
    errorMessage = "Invalid email or password. Please try again."
  } else if (error === "SessionRequired") {
    errorMessage = "You need to be signed in to access this page."
  } else if (error === "AccessDenied") {
    errorMessage = "You don't have permission to access this resource."
  } else if (error === "CallbackRouteError") {
    errorMessage = "There was a problem with the authentication callback."
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center px-4">
      <h2 className="text-2xl font-bold mb-4">Authentication Error</h2>
      <p className="text-gray-600 mb-6">{errorMessage}</p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/login">
          <Button className="bg-green-600 hover:bg-green-700">Return to login</Button>
        </Link>
        <Link href="/">
          <Button variant="outline">Return to home</Button>
        </Link>
      </div>
    </div>
  )
}
