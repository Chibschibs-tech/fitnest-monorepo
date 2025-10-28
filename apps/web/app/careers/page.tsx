import type { Metadata } from "next"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Careers | Fitnest",
  description:
    "Join the Fitnest team and help us revolutionize healthy eating in Morocco. Explore current job openings and career opportunities.",
}

export default function CareersPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <section className="mb-16">
        <h1 className="text-4xl font-bold mb-6 text-center">Join Our Team</h1>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-lg mb-6">
            At Fitnest, we're on a mission to revolutionize healthy eating in Morocco. We're looking for passionate,
            talented individuals to join our growing team.
          </p>
        </div>
      </section>

      <section className="mb-16 bg-gray-50 py-12 rounded-lg">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Why Work With Us</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative h-80 rounded-lg overflow-hidden">
              <Image src="/placeholder.svg?key=6lowv" alt="Fitnest team" fill className="object-cover" />
            </div>
            <div>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="bg-green-600 text-white p-1 rounded-full mr-3 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Meaningful Work</h3>
                    <p>Be part of a mission to improve health and wellness across Morocco through better nutrition.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-green-600 text-white p-1 rounded-full mr-3 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Growth Opportunities</h3>
                    <p>
                      As a growing startup, we offer abundant opportunities for professional development and career
                      advancement.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-green-600 text-white p-1 rounded-full mr-3 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Collaborative Culture</h3>
                    <p>
                      Work in a supportive environment where your ideas are valued and your contributions make a
                      difference.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-green-600 text-white p-1 rounded-full mr-3 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Competitive Benefits</h3>
                    <p>Enjoy competitive salaries, health benefits, and employee meal discounts.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Current Openings</h2>
        <div className="max-w-5xl mx-auto grid gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Nutritionist</h3>
            <p className="text-green-600 mb-4">Full-time | Casablanca</p>
            <p className="mb-4">
              We're looking for a qualified nutritionist to join our team and help develop balanced, healthy meal plans
              for our customers.
            </p>
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Requirements:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Bachelor's degree in Nutrition, Dietetics, or related field</li>
                <li>Minimum 2 years of experience in meal planning</li>
                <li>Knowledge of various dietary needs and restrictions</li>
                <li>Excellent communication skills</li>
                <li>Fluency in Arabic and French, English is a plus</li>
              </ul>
            </div>
            <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition duration-300">
              Apply Now
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Chef</h3>
            <p className="text-green-600 mb-4">Full-time | Casablanca</p>
            <p className="mb-4">
              We're seeking a talented chef with experience in preparing healthy, nutritious meals at scale.
            </p>
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Requirements:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Culinary degree or equivalent experience</li>
                <li>Minimum 3 years of experience in a professional kitchen</li>
                <li>Knowledge of various cuisines and dietary requirements</li>
                <li>Experience with meal prep and batch cooking</li>
                <li>Strong organizational and time management skills</li>
              </ul>
            </div>
            <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition duration-300">
              Apply Now
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Delivery Driver</h3>
            <p className="text-green-600 mb-4">Full-time & Part-time | Casablanca, Rabat</p>
            <p className="mb-4">
              Join our logistics team to ensure our customers receive their meals fresh and on time.
            </p>
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Requirements:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Valid driver's license</li>
                <li>Reliable transportation</li>
                <li>Knowledge of local streets and routes</li>
                <li>Customer service orientation</li>
                <li>Ability to work flexible hours</li>
              </ul>
            </div>
            <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition duration-300">
              Apply Now
            </button>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-8 text-center">Don't See a Fit?</h2>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-lg mb-6">
            We're always looking for talented individuals to join our team. If you don't see a position that matches
            your skills but believe you can contribute to our mission, we'd love to hear from you.
          </p>
          <a
            href="/contact"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300"
          >
            Send Us Your Resume
          </a>
        </div>
      </section>
    </main>
  )
}
