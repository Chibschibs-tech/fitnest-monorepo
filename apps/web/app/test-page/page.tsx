export default function TestPage() {
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <h1 className="text-3xl font-bold mb-6">Test Page</h1>
      <p>This is a simple test page to verify routing is working correctly.</p>
      <div className="mt-8 p-4 bg-green-100 rounded-lg inline-block">
        <p className="text-green-800">If you can see this page, basic routing is working!</p>
      </div>
    </div>
  )
}
