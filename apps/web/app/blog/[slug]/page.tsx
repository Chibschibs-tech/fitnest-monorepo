"use client"

import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Clock } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { getTranslations, defaultLocale } from "@/lib/i18n"
import { useState, useEffect } from "react"

// Blog posts content with translations
const getBlogPostContent = (slug: string, locale: string) => {
  const posts: Record<string, Record<string, any>> = {
    "healthy-meal-delivery-morocco": {
      fr: {
        title: "Pourquoi la livraison de repas sains transforme votre quotidien au Maroc",
        excerpt: "Découvrez comment les repas préparés par des chefs peuvent vous faire gagner du temps tout en améliorant votre santé et votre bien-être.",
        category: "Nutrition",
        readTime: "5 min de lecture",
        date: "2 mai 2024",
        author: "Nadia Benali",
        authorTitle: "Nutritionniste & Spécialiste en Repas Sains",
        content: `
          <p>Au Maroc, la vie moderne est de plus en plus trépidante. Entre le travail, la famille et les responsabilités quotidiennes, trouver le temps de préparer des repas sains et équilibrés devient un défi majeur pour de nombreux professionnels. C'est là qu'intervient la livraison de repas sains, une solution qui transforme littéralement votre quotidien.</p>
          
          <h2>Le défi de l'alimentation saine au Maroc</h2>
          <p>Les professionnels marocains sont confrontés à un dilemme constant : comment maintenir une alimentation saine tout en gérant un emploi du temps chargé ? Les options traditionnelles - fast-food, plats à emporter, ou repas préparés à la hâte - compromettent souvent la qualité nutritionnelle.</p>
          
          <p>La livraison de repas sains résout ce problème en apportant directement à votre porte des repas préparés par des chefs, équilibrés sur le plan nutritionnel, et adaptés à vos objectifs de santé.</p>
          
          <h2>Les avantages de la livraison de repas sains</h2>
          
          <h3>1. Gain de temps considérable</h3>
          <p>Imaginez récupérer 5 à 10 heures par semaine que vous passiez normalement à faire les courses, cuisiner et nettoyer. Ce temps peut être réinvesti dans votre carrière, votre famille, ou simplement dans votre bien-être personnel.</p>
          
          <h3>2. Nutrition optimisée</h3>
          <p>Les repas livrés sont conçus par des nutritionnistes certifiés, garantissant un équilibre parfait entre protéines, glucides et lipides. Chaque repas est calibré pour répondre à vos besoins spécifiques, que vous cherchiez à perdre du poids, à prendre de la masse musculaire, ou simplement à maintenir un mode de vie sain.</p>
          
          <h3>3. Ingrédients frais et locaux</h3>
          <p>Au Maroc, nous avons la chance d'avoir accès à des produits locaux exceptionnels. Les services de livraison de repas sains s'approvisionnent directement auprès de producteurs locaux, garantissant la fraîcheur tout en soutenant l'économie locale.</p>
          
          <h3>4. Flexibilité et personnalisation</h3>
          <p>Que vous préfériez un plan Low Carb, Balanced, ou Protein Power, vous pouvez personnaliser votre abonnement selon vos besoins. Vous pouvez également spécifier des restrictions alimentaires, des allergies, ou des préférences culinaires.</p>
          
          <h3>5. Cohérence et discipline</h3>
          <p>L'un des plus grands défis de l'alimentation saine est la cohérence. Avec la livraison de repas, vous éliminez les décisions quotidiennes sur ce qu'il faut manger, réduisant ainsi les tentations et les écarts.</p>
          
          <h2>Comment ça fonctionne au Maroc</h2>
          <p>Les services de livraison de repas sains au Maroc, comme Fitnest.ma, fonctionnent selon un modèle simple :</p>
          <ul>
            <li><strong>Choisissez votre plan :</strong> Sélectionnez parmi différents plans nutritionnels adaptés à vos objectifs</li>
            <li><strong>Personnalisez votre livraison :</strong> Déterminez les jours et heures de livraison qui vous conviennent</li>
            <li><strong>Recevez des repas frais :</strong> Vos repas sont préparés quotidiennement et livrés directement à votre porte</li>
            <li><strong>Réchauffez et savourez :</strong> En moins de 3 minutes, vous avez un repas chaud et nutritif prêt à déguster</li>
          </ul>
          
          <h2>Impact sur votre santé et votre bien-être</h2>
          <p>Les études montrent que les personnes qui consomment des repas préparés de manière professionnelle et équilibrés sur le plan nutritionnel :</p>
          <ul>
            <li>Ont tendance à avoir un meilleur contrôle du poids</li>
            <li>Éprouvent plus d'énergie tout au long de la journée</li>
            <li>Dorment mieux grâce à une nutrition optimale</li>
            <li>Réduisent leur stress lié à la planification des repas</li>
          </ul>
          
          <h2>Conclusion</h2>
          <p>La livraison de repas sains n'est pas seulement une commodité - c'est un investissement dans votre santé, votre temps et votre qualité de vie. Au Maroc, où le rythme de vie s'accélère, cette solution offre une voie pratique vers une alimentation saine sans compromettre le goût ou la qualité.</p>
          
          <p>Si vous êtes un professionnel occupé cherchant à transformer votre relation avec la nourriture, la livraison de repas sains pourrait être la solution que vous recherchez.</p>
        `,
      },
      en: {
        title: "Why Healthy Meal Delivery Transforms Your Daily Life in Morocco",
        excerpt: "Discover how chef-prepared meals can save you time while improving your health and well-being.",
        category: "Nutrition",
        readTime: "5 min read",
        date: "May 2, 2024",
        author: "Nadia Benali",
        authorTitle: "Nutritionist & Healthy Meal Specialist",
        content: `
          <p>In Morocco, modern life is increasingly fast-paced. Between work, family, and daily responsibilities, finding time to prepare healthy, balanced meals becomes a major challenge for many professionals. This is where healthy meal delivery comes in - a solution that literally transforms your daily life.</p>
          
          <h2>The Challenge of Healthy Eating in Morocco</h2>
          <p>Moroccan professionals face a constant dilemma: how to maintain a healthy diet while managing a busy schedule? Traditional options - fast food, takeout, or hastily prepared meals - often compromise nutritional quality.</p>
          
          <p>Healthy meal delivery solves this problem by bringing chef-prepared, nutritionally balanced meals directly to your door, tailored to your health goals.</p>
          
          <h2>Benefits of Healthy Meal Delivery</h2>
          
          <h3>1. Significant Time Savings</h3>
          <p>Imagine reclaiming 5-10 hours per week that you normally spend grocery shopping, cooking, and cleaning. This time can be reinvested in your career, family, or simply in your personal well-being.</p>
          
          <h3>2. Optimized Nutrition</h3>
          <p>Delivered meals are designed by certified nutritionists, ensuring a perfect balance of proteins, carbohydrates, and fats. Each meal is calibrated to meet your specific needs, whether you're looking to lose weight, build muscle, or simply maintain a healthy lifestyle.</p>
          
          <h3>3. Fresh, Local Ingredients</h3>
          <p>In Morocco, we're fortunate to have access to exceptional local products. Healthy meal delivery services source directly from local producers, ensuring freshness while supporting the local economy.</p>
          
          <h3>4. Flexibility and Personalization</h3>
          <p>Whether you prefer a Low Carb, Balanced, or Protein Power plan, you can customize your subscription to your needs. You can also specify dietary restrictions, allergies, or culinary preferences.</p>
          
          <h3>5. Consistency and Discipline</h3>
          <p>One of the biggest challenges of healthy eating is consistency. With meal delivery, you eliminate daily decisions about what to eat, reducing temptations and deviations.</p>
          
          <h2>How It Works in Morocco</h2>
          <p>Healthy meal delivery services in Morocco, like Fitnest.ma, operate on a simple model:</p>
          <ul>
            <li><strong>Choose Your Plan:</strong> Select from different nutritional plans tailored to your goals</li>
            <li><strong>Customize Your Delivery:</strong> Determine the days and times that work for you</li>
            <li><strong>Receive Fresh Meals:</strong> Your meals are prepared daily and delivered directly to your door</li>
            <li><strong>Heat and Enjoy:</strong> In less than 3 minutes, you have a hot, nutritious meal ready to enjoy</li>
          </ul>
          
          <h2>Impact on Your Health and Well-being</h2>
          <p>Studies show that people who consume professionally prepared, nutritionally balanced meals:</p>
          <ul>
            <li>Tend to have better weight control</li>
            <li>Experience more energy throughout the day</li>
            <li>Sleep better thanks to optimal nutrition</li>
            <li>Reduce stress related to meal planning</li>
          </ul>
          
          <h2>Conclusion</h2>
          <p>Healthy meal delivery isn't just a convenience - it's an investment in your health, time, and quality of life. In Morocco, where the pace of life is accelerating, this solution offers a practical path to healthy eating without compromising taste or quality.</p>
          
          <p>If you're a busy professional looking to transform your relationship with food, healthy meal delivery might be the solution you're looking for.</p>
        `,
      },
    },
    // Keep other posts as they are relevant
    "nutrition-myths": {
      fr: {
        title: "5 mythes nutritionnels courants démystifiés",
        excerpt: "Séparer les faits de la fiction : des experts en nutrition se prononcent sur les allégations diététiques populaires et les idées fausses.",
        category: "Nutrition",
        readTime: "7 min de lecture",
        date: "18 avril 2024",
        author: "Dr. Karim Tazi",
        authorTitle: "Diététicien & Chercheur en Nutrition",
        content: `<p>À l'ère de la surcharge d'informations, les conseils nutritionnels sont partout. Malheureusement, tous ces conseils ne sont pas basés sur des données scientifiques solides. Examinons et démystifions cinq mythes nutritionnels courants qui persistent malgré les preuves du contraire.</p>
          <h2>Mythe 1 : Les glucides sont mauvais pour vous</h2>
          <p>L'un des mythes nutritionnels les plus répandus est que les glucides sont intrinsèquement engraissants ou malsains. Cependant, les glucides sont la source d'énergie préférée du corps et sont essentiels au bon fonctionnement du cerveau.</p>
          <p><strong>La vérité :</strong> Tous les glucides ne sont pas égaux. Les glucides hautement transformés comme le pain blanc, les pâtisseries et les boissons sucrées peuvent effectivement contribuer à la prise de poids. Cependant, les glucides complexes trouvés dans les grains entiers, les fruits, les légumes et les légumineuses sont riches en fibres, vitamines et minéraux essentiels à une bonne santé.</p>
          <h2>Mythe 2 : Manger des graisses vous fait grossir</h2>
          <p><strong>La vérité :</strong> Les graisses alimentaires sont un nutriment essentiel qui joue des rôles cruciaux dans la production d'hormones, l'absorption des vitamines et la santé du cerveau. Le type de graisse importe plus que la quantité totale.</p>
          <h2>Conclusion</h2>
          <p>La science de la nutrition est complexe et en constante évolution. La meilleure approche pour une alimentation saine est de se concentrer sur des aliments entiers, minimalement transformés, plutôt que de diaboliser ou de glorifier des nutriments spécifiques.</p>`,
      },
      en: {
        title: "5 Common Nutrition Myths Debunked",
        excerpt: "Separating fact from fiction: nutrition experts weigh in on popular diet claims and misconceptions.",
        category: "Nutrition",
        readTime: "7 min read",
        date: "April 18, 2024",
        author: "Dr. Karim Tazi",
        authorTitle: "Registered Dietitian & Nutrition Researcher",
        content: `<p>In the age of information overload, nutrition advice is everywhere. Unfortunately, not all of this advice is based on sound science. Let's examine and debunk five common nutrition myths that persist despite evidence to the contrary.</p>
          <h2>Myth 1: Carbs Are Bad for You</h2>
          <p>One of the most pervasive nutrition myths is that carbohydrates are inherently fattening or unhealthy. However, carbohydrates are the body's preferred source of energy and are essential for proper brain function.</p>
          <p><strong>The Truth:</strong> Not all carbs are created equal. Highly processed carbs can indeed contribute to weight gain. However, complex carbohydrates found in whole grains, fruits, vegetables, and legumes are packed with fiber, vitamins, and minerals vital for good health.</p>
          <h2>Myth 2: Eating Fat Makes You Fat</h2>
          <p><strong>The Truth:</strong> Dietary fat is an essential nutrient that plays crucial roles in hormone production, vitamin absorption, and brain health. The type of fat matters more than the total amount.</p>
          <h2>Conclusion</h2>
          <p>Nutrition science is complex and constantly evolving. The best approach to healthy eating is to focus on whole, minimally processed foods rather than vilifying or glorifying specific nutrients.</p>`,
      },
    },
  }

  return posts[slug]?.[locale] || posts[slug]?.[defaultLocale] || null
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const { locale } = useLanguage()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const t = getTranslations(mounted ? locale : defaultLocale)
  const postData = getBlogPostContent(params.slug, mounted ? locale : defaultLocale)

  if (!postData) {
    notFound()
  }

  // Get related posts
  const allPosts = [
    { id: 1, slug: "healthy-meal-delivery-morocco", title: t.blog.post1.title },
    { id: 2, slug: "nutrition-myths", title: t.blog.post2.title },
    { id: 3, slug: "weight-loss-plateau", title: t.blog.post3.title },
    { id: 4, slug: "protein-importance", title: t.blog.post4.title },
    { id: 5, slug: "mindful-eating", title: t.blog.post5.title },
  ]

  const relatedPosts = allPosts.filter((p) => p.slug !== params.slug).slice(0, 3)

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <div className="mb-8">
          <Link href="/blog">
            <Button variant="ghost" className="flex items-center text-fitnest-green hover:bg-gray-100">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t.blog.backToBlog}
            </Button>
          </Link>
        </div>

        {/* Article header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-sm font-semibold px-2 py-1 bg-fitnest-green/10 text-fitnest-green rounded-full">
              {postData.category}
            </span>
            <div className="flex items-center text-gray-500 text-sm">
              <Clock className="h-4 w-4 mr-1" />
              {postData.readTime}
            </div>
            <div className="flex items-center text-gray-500 text-sm">
              <Calendar className="h-4 w-4 mr-1" />
              {postData.date}
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-fitnest-green">{postData.title}</h1>
          <p className="text-xl text-gray-600 mb-6">{postData.excerpt}</p>

          {/* Author info */}
          <div className="flex items-center mb-6">
            <div className="bg-fitnest-green/10 rounded-full h-12 w-12 flex items-center justify-center text-fitnest-green font-bold mr-3">
              {postData.author.charAt(0)}
            </div>
            <div>
              <p className="font-semibold">{postData.author}</p>
              <p className="text-sm text-gray-500">{postData.authorTitle}</p>
            </div>
          </div>
        </div>

        {/* Featured image */}
        <div className="relative h-[250px] sm:h-[300px] md:h-[400px] mb-8 rounded-lg overflow-hidden">
          <Image
            src="/placeholder.svg?height=400&width=800"
            alt={postData.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
            priority
          />
        </div>

        {/* Article content */}
        <div 
          className="prose prose-lg max-w-none prose-headings:text-fitnest-green prose-a:text-fitnest-green prose-strong:text-gray-900"
          dangerouslySetInnerHTML={{ __html: postData.content }} 
        />

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-12 border-t pt-8">
            <h2 className="text-2xl font-bold mb-6 text-fitnest-green">{t.blog.youMightAlsoLike}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {relatedPosts.map((relatedPost) => (
                <div key={relatedPost.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  <div className="relative h-32 sm:h-40">
                    <Image
                      src="/placeholder.svg?height=400&width=600"
                      alt={relatedPost.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-3 md:p-4">
                    <h3 className="text-base md:text-lg font-bold mt-2 mb-1 line-clamp-2">{relatedPost.title}</h3>
                    <Link href={`/blog/${relatedPost.slug}`}>
                      <Button
                        variant="outline"
                        className="w-full mt-2 border-fitnest-green text-fitnest-green hover:bg-fitnest-green hover:text-white text-sm"
                      >
                        {t.blog.readArticle}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
