import type { Metadata } from "next"
import { Mail, Phone, MapPin, Clock } from "lucide-react"

export const metadata: Metadata = {
  title: "Contact Us | Fitnest",
  description:
    "Get in touch with Fitnest for any questions, feedback, or support regarding our meal prep delivery service.",
}

export default function ContactPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6 text-center">Contact Us</h1>

      <div className="max-w-5xl mx-auto mt-12 grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-semibold mb-6">Get In Touch</h2>
          <p className="mb-8">
            Have questions about our meal plans? Want to provide feedback? Or just want to say hello? We'd love to hear
            from you! Fill out the form or use our contact information below.
          </p>

          <div className="space-y-6">
            <div className="flex items-start">
              <Mail className="w-6 h-6 text-green-600 mr-4 mt-1" />
              <div>
                <h3 className="font-semibold">Email</h3>
                <p>contact@fitnest.ma</p>
              </div>
            </div>

            <div className="flex items-start">
              <Phone className="w-6 h-6 text-green-600 mr-4 mt-1" />
              <div>
                <h3 className="font-semibold">Phone</h3>
                <p>+212 522 123 456</p>
              </div>
            </div>

            <div className="flex items-start">
              <MapPin className="w-6 h-6 text-green-600 mr-4 mt-1" />
              <div>
                <h3 className="font-semibold">Address</h3>
                <p>123 Nutrition St, Casablanca, Morocco</p>
              </div>
            </div>

            <div className="flex items-start">
              <Clock className="w-6 h-6 text-green-600 mr-4 mt-1" />
              <div>
                <h3 className="font-semibold">Business Hours</h3>
                <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                <p>Saturday: 10:00 AM - 4:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <form className="bg-white p-8 rounded-lg shadow-md">
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Your name"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Your email"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Subject"
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                id="message"
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Your message"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition duration-300"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>

      <div className="mt-16 max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-center">Frequently Asked Questions</h2>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">What areas do you deliver to?</h3>
            <p>
              We currently deliver to all major areas in Casablanca, Rabat, and Marrakech. We're constantly expanding
              our delivery zones, so please check back if your area isn't currently covered.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">How far in advance should I place my order?</h3>
            <p>
              For the best service, we recommend placing your orders at least 24 hours in advance. This allows our chefs
              to prepare your meals fresh and ensures timely delivery.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Can I customize my meal plan?</h3>
            <p>
              We offer customization options for all our meal plans. You can specify dietary preferences, allergies, and
              even exclude certain ingredients when placing your order.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">How long do the meals stay fresh?</h3>
            <p>
              Our meals are prepared fresh and typically stay good for 3-4 days when properly refrigerated. Each meal
              container is labeled with a "best by" date for your convenience.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
