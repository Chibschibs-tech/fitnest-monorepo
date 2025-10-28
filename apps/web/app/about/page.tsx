import type { Metadata } from "next"
import Image from "next/image"

export const metadata: Metadata = {
  title: "About Us | Fitnest",
  description:
    "Learn about Fitnest, Morocco's premier meal prep delivery service dedicated to helping you achieve your health and fitness goals.",
}

export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <section className="mb-16">
        <h1 className="text-4xl font-bold mb-6 text-center">About Fitnest</h1>
        <div className="max-w-3xl mx-auto">
          <p className="text-lg mb-6">
            Fitnest is Morocco's premier health-focused lifestyle brand dedicated to helping you achieve your wellness
            goals through delicious, nutritionally balanced meals delivered right to your door.
          </p>
        </div>
      </section>

      {/* Vision Section */}
      <section className="mb-16 bg-green-50 py-12 rounded-lg">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Vision</h2>
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-lg mb-4">
              FitNest aims to become the leading health-focused lifestyle brand in Morocco, redefining how people eat,
              move, and live.
            </p>
            <p className="text-lg">
              We envision a future where healthy living is accessible, enjoyable, and deeply rooted in local
              culture—from what people eat daily to how they take care of their bodies. Through personalized nutrition,
              education, and sustainable food practices, FitNest aspires to shift long-term habits and become a symbol
              of well-being and positive transformation.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mb-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Mission</h2>
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-xl font-semibold mb-4">
              To make healthy eating simple, enjoyable, and part of everyday life.
            </p>
            <p className="text-lg">
              We deliver personalized, nutrient-rich meals straight to your door and support our customers with tools
              and content that help them build healthier routines. With a focus on freshness, transparency, and
              long-term wellness, FitNest empowers individuals to take charge of their health—one meal, one habit at a
              time.
            </p>
          </div>
        </div>
      </section>

      {/* Brand Values Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Our Values</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-2">💚</span>
              <h3 className="text-xl font-semibold text-green-600">Health First</h3>
            </div>
            <p>
              We put health at the core of every product and service. Every meal, ingredient, and experience is designed
              to fuel the body and promote long-term well-being.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-2">🔥</span>
              <h3 className="text-xl font-semibold text-green-600">Lifestyle-Driven</h3>
            </div>
            <p>
              We believe that healthy living is more than just eating well—it's a mindset. FitNest promotes a full
              lifestyle transformation through balanced routines, movement, mindfulness, and education.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-2">🌱</span>
              <h3 className="text-xl font-semibold text-green-600">Simplicity & Convenience</h3>
            </div>
            <p>
              We remove the barriers to healthy habits. From personalized meals to seamless delivery and clear guidance,
              we make nutrition and wellness easier for everyone.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-2">📚</span>
              <h3 className="text-xl font-semibold text-green-600">Empowerment Through Education</h3>
            </div>
            <p>
              Knowledge drives change. Through clear content, expert insights, and practical tips, we help our community
              make better choices and build sustainable habits.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-2">🌍</span>
              <h3 className="text-xl font-semibold text-green-600">Sustainability & Responsibility</h3>
            </div>
            <p>
              We care about the future. Our commitment to eco-friendly packaging, local sourcing, and self-sufficient
              farming solutions reflects our responsibility toward people and the planet.
            </p>
          </div>
        </div>
      </section>

      {/* Our Team Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Our Team</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="relative w-48 h-48 mx-auto mb-4 rounded-full overflow-hidden">
              <Image src="/professional-chef-portrait.png" alt="Executive Chef" fill className="object-cover" />
            </div>
            <h3 className="text-xl font-semibold">Karim Benali</h3>
            <p className="text-green-600">Executive Chef</p>
          </div>
          <div className="text-center">
            <div className="relative w-48 h-48 mx-auto mb-4 rounded-full overflow-hidden">
              <Image src="/placeholder.svg?key=c89xy" alt="Head Nutritionist" fill className="object-cover" />
            </div>
            <h3 className="text-xl font-semibold">Leila Tazi</h3>
            <p className="text-green-600">Head Nutritionist</p>
          </div>
          <div className="text-center">
            <div className="relative w-48 h-48 mx-auto mb-4 rounded-full overflow-hidden">
              <Image src="/placeholder.svg?key=dukkd" alt="Founder & CEO" fill className="object-cover" />
            </div>
            <h3 className="text-xl font-semibold">Omar Alaoui</h3>
            <p className="text-green-600">Founder & CEO</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section>
        <h2 className="text-3xl font-bold mb-8 text-center">Join Us on Our Mission</h2>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-lg mb-6">
            Whether you're looking to lose weight, build muscle, or simply maintain a healthy lifestyle, Fitnest is here
            to support your journey with delicious, nutritious meals delivered right to your door.
          </p>
          <a
            href="/order"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300"
          >
            Start Your Journey Today
          </a>
        </div>
      </section>
    </main>
  )
}
