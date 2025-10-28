export default function TestPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold">Test Page</h1>
      <p>This is a simple test page to verify routing is working.</p>

      <div className="mt-6">
        <a href="/api/test-simple" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Test API Endpoint
        </a>
      </div>
    </div>
  )
}
