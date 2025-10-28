import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function BlogPage() {
  // Sample blog posts data
  const blogPosts = [
    {
      id: 1,
      slug: "healthy-meal-prep",
      title: "10 Healthy Meal Prep Tips for Busy Professionals",
      excerpt: "Learn how to efficiently prepare nutritious meals for the entire week, even with a busy schedule.",
      category: "Meal Prep",
      readTime: "5 min read",
      date: "May 2, 2023",
      image: "/placeholder.svg?height=400&width=600",
    },
    {
      id: 2,
      slug: "nutrition-myths",
      title: "5 Common Nutrition Myths Debunked",
      excerpt: "Separating fact from fiction: nutrition experts weigh in on popular diet claims and misconceptions.",
      category: "Nutrition",
      readTime: "7 min read",
      date: "April 18, 2023",
      image: "/placeholder.svg?height=400&width=600",
    },
    {
      id: 3,
      slug: "weight-loss-plateau",
      title: "Breaking Through a Weight Loss Plateau",
      excerpt: "Effective strategies to overcome stalled progress and continue your weight loss journey.",
      category: "Fitness",
      readTime: "8 min read",
      date: "April 5, 2023",
      image: "/placeholder.svg?height=400&width=600",
    },
    {
      id: 4,
      slug: "protein-importance",
      title: "Why Protein is Essential for Muscle Building",
      excerpt: "Understanding the role of protein in muscle development and recovery, and how to optimize your intake.",
      category: "Nutrition",
      readTime: "6 min read",
      date: "March 22, 2023",
      image: "/placeholder.svg?height=400&width=600",
    },
    {
      id: 5,
      slug: "mindful-eating",
      title: "The Art of Mindful Eating: Improving Your Relationship with Food",
      excerpt: "How practicing mindfulness during meals can transform your eating habits and overall well-being.",
      category: "Wellness",
      readTime: "9 min read",
      date: "March 10, 2023",
      image: "/placeholder.svg?height=400&width=600",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Fitnest.ma Blog</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Expert advice on nutrition, fitness, and healthy living to help you achieve your wellness goals.
        </p>
      </div>

      {/* Featured Post */}
      <div className="mb-16">
        <div className="bg-white rounded-lg overflow-hidden shadow-lg grid grid-cols-1 md:grid-cols-2">
          <div className="relative h-64 md:h-auto order-2 md:order-1">
            <Image
              src={blogPosts[0].image || "/placeholder.svg"}
              alt={blogPosts[0].title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="p-6 md:p-8 flex flex-col justify-center order-1 md:order-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold px-2 py-1 bg-fitnest-green/10 text-fitnest-green rounded-full">
                {blogPosts[0].category}
              </span>
              <span className="text-xs text-gray-500">{blogPosts[0].readTime}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-3">{blogPosts[0].title}</h2>
            <p className="text-gray-600 mb-6 text-sm md:text-base">{blogPosts[0].excerpt}</p>
            <div className="mt-auto">
              <Link href={`/blog/${blogPosts[0].slug}`}>
                <Button className="bg-fitnest-green hover:bg-fitnest-green/90 text-white w-full md:w-auto">
                  Read Article
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* All Posts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.slice(1).map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-lg overflow-hidden shadow-md transition-transform hover:shadow-lg"
          >
            <div className="relative h-48">
              <Image
                src={post.image || "/placeholder.svg"}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold px-2 py-1 bg-fitnest-green/10 text-fitnest-green rounded-full">
                  {post.category}
                </span>
                <span className="text-xs text-gray-500">{post.readTime}</span>
              </div>
              <h3 className="text-xl font-bold mb-2">{post.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{post.date}</span>
                <Link href={`/blog/${post.slug}`}>
                  <Button
                    variant="outline"
                    className="border-fitnest-green text-fitnest-green hover:bg-fitnest-green hover:text-white"
                  >
                    Read More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
