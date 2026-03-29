"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { getTranslations, defaultLocale } from "@/lib/i18n"
import { useState, useEffect } from "react"

export default function BlogPage() {
  const { locale } = useLanguage()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const t = getTranslations(mounted ? locale : defaultLocale)

  // Blog posts data with translations
  const blogPosts = [
    {
      id: 1,
      slug: "healthy-meal-delivery-morocco",
      title: t.home.blog.post1.title,
      excerpt: t.home.blog.post1.description,
      category: t.home.blog.post1.category,
      readTime: t.home.blog.post1.readTime,
      date: locale === "fr" ? "2 mai 2024" : "May 2, 2024",
      image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop",
    },
    {
      id: 2,
      slug: "nutrition-myths",
      title: t.home.blog.post2.title,
      excerpt: t.home.blog.post2.description,
      category: t.home.blog.post2.category,
      readTime: t.home.blog.post2.readTime,
      date: locale === "fr" ? "18 avril 2024" : "April 18, 2024",
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop",
    },
    {
      id: 3,
      slug: "weight-loss-plateau",
      title: t.home.blog.post3.title,
      excerpt: t.home.blog.post3.description,
      category: t.home.blog.post3.category,
      readTime: t.home.blog.post3.readTime,
      date: locale === "fr" ? "5 avril 2024" : "April 5, 2024",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop",
    },
    {
      id: 4,
      slug: "protein-importance",
      title: t.home.blog.post4.title,
      excerpt: t.home.blog.post4.description,
      category: t.home.blog.post4.category,
      readTime: t.home.blog.post4.readTime,
      date: locale === "fr" ? "22 mars 2024" : "March 22, 2024",
      image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600&h=400&fit=crop",
    },
    {
      id: 5,
      slug: "mindful-eating",
      title: t.home.blog.post5.title,
      excerpt: t.home.blog.post5.description,
      category: t.home.blog.post5.category,
      readTime: t.home.blog.post5.readTime,
      date: locale === "fr" ? "10 mars 2024" : "March 10, 2024",
      image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&h=400&fit=crop",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-fitnest-green">Fitnest.ma Blog</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {t.home.blog.subtitle}
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
                  {t.home.blog.readArticle}
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
            className="bg-white rounded-lg overflow-hidden shadow-md transition-transform hover:shadow-lg hover:scale-105"
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
                    {t.home.blog.readMore}
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
