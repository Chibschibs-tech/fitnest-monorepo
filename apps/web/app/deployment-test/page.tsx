import { sql } from "@/lib/db"

export default async function DeploymentTest() {
  let dbStatus = "Unknown"
  let error = null

  try {
    // Test database connection
    const result = await sql`SELECT 1 as test`
    dbStatus = result[0]?.test === 1 ? "Connected" : "Error"
  } catch (err: any) {
    dbStatus = "Error"
    error = err.message
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Deployment Test</h1>

      <div className="mb-4">
        <h2 className="text-xl font-semibold">Database Status</h2>
        <p className={`mt-2 ${dbStatus === "Connected" ? "text-green-600" : "text-red-600"}`}>{dbStatus}</p>
        {error && (
          <div className="mt-2 p-4 bg-red-50 text-red-800 rounded">
            <p className="font-mono text-sm">{error}</p>
          </div>
        )}
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold">Environment Variables</h2>
        <ul className="mt-2 space-y-1">
          <li>DATABASE_URL: {process.env.DATABASE_URL ? "✅ Set" : "❌ Missing"}</li>
          <li>NEXTAUTH_URL: {process.env.NEXTAUTH_URL ? "✅ Set" : "❌ Missing"}</li>
          <li>NEXTAUTH_SECRET: {process.env.NEXTAUTH_SECRET ? "✅ Set" : "❌ Missing"}</li>
        </ul>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold">Node.js Version</h2>
        <p className="mt-2">{process.version}</p>
      </div>
    </div>
  )
}
