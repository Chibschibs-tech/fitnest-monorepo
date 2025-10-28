import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "FAQ - Fitnest.ma",
  description: "Frequently asked questions about Fitnest.ma meal delivery service",
}

export default function FAQPage() {
  const faqs = [
    {
      question: "How does meal delivery work?",
      answer:
        "We prepare fresh, healthy meals and deliver them to your doorstep according to your chosen schedule. You can customize your meal plan based on your dietary preferences and fitness goals.",
    },
    {
      question: "What areas do you deliver to?",
      answer:
        "We currently deliver throughout Morocco, including major cities like Casablanca, Rabat, Marrakech, and Fez. Delivery times may vary by location.",
    },
    {
      question: "Can I customize my meals?",
      answer:
        "Yes! You can choose from various meal plans including weight loss, muscle gain, keto, and balanced nutrition. You can also specify dietary restrictions and preferences.",
    },
    {
      question: "How fresh are the meals?",
      answer:
        "All meals are prepared fresh daily using high-quality ingredients. We use proper packaging to maintain freshness during delivery.",
    },
    {
      question: "Can I pause or cancel my subscription?",
      answer:
        "Yes, you can pause or cancel your subscription at any time through your dashboard. Changes take effect from the next delivery cycle.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "Currently, we accept cash on delivery. We're working on adding credit card and mobile payment options soon.",
    },
    {
      question: "What if I'm not satisfied with my meal?",
      answer:
        "Customer satisfaction is our priority. If you're not happy with any meal, please contact our support team and we'll make it right.",
    },
    {
      question: "How do I track my order?",
      answer:
        "You can track your orders through your dashboard. You'll also receive email notifications about order status updates.",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4">Frequently Asked Questions</h1>
        <p className="text-gray-600 text-center mb-12">
          Find answers to common questions about our meal delivery service
        </p>

        <div className="space-y-8">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{faq.question}</h3>
              <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-semibold mb-4">Still have questions?</h2>
          <p className="text-gray-600 mb-6">Can't find what you're looking for? Our support team is here to help.</p>
          <a
            href="/contact"
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  )
}
