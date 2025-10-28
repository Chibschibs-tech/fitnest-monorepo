import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function BlogPostNotFound() {
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
        <p className="text-gray-600 mb-8">
          Sorry, the blog post you're looking for doesn't exist or may have been moved.
        </p>
        <Link href="/blog">
          <Button className="bg-logo-green hover:bg-logo-green/90 text-white">Browse All Articles</Button>
        </Link>
      </div>
    </div>
  )
}
