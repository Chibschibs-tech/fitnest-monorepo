import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { AuthStatusChecker } from "@/components/auth-status-checker"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { validateAuthEnvironment } from "@/lib/auth-utils"

export default async function AuthDebugPage() {
  const session = await getServerSession()

  // Only allow admins to access this page
  if (!session || session.user?.role !== "admin") {
    redirect("/login")
  }

  // Check environment variables on the server
  const envCheck = validateAuthEnvironment()

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
            <CardDescription>Checking required environment variables for authentication</CardDescription>
          </CardHeader>
          <CardContent>
            {envCheck.valid ? (
              <div className="text-green-600">All required environment variables are set</div>
            ) : (
              <div className="text-red-600">Missing environment variables: {envCheck.missing.join(", ")}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Client-Side Authentication Status</CardTitle>
            <CardDescription>Check the current authentication status and test the auth health endpoint</CardDescription>
          </CardHeader>
          <CardContent>
            <AuthStatusChecker />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
