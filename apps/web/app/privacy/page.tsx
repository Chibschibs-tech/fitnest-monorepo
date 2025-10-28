import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | Fitnest",
  description: "Learn about how Fitnest collects, uses, and protects your personal information.",
}

export default function PrivacyPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6 text-center">Privacy Policy</h1>

      <div className="max-w-4xl mx-auto prose prose-lg">
        <p className="text-gray-500 mb-8 text-center">Last updated: May 6, 2023</p>

        <section className="mb-8">
          <h2>1. Introduction</h2>
          <p>
            At Fitnest, we respect your privacy and are committed to protecting your personal data. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your information when you visit our website, use our
            mobile application, or use our meal delivery services.
          </p>
          <p>
            Please read this Privacy Policy carefully. If you do not agree with the terms of this Privacy Policy, please
            do not access our services.
          </p>
        </section>

        <section className="mb-8">
          <h2>2. Information We Collect</h2>
          <p>We collect several types of information from and about users of our services, including:</p>
          <h3>2.1 Personal Information</h3>
          <p>
            Personal information is data that can be used to identify you directly or indirectly. We may collect the
            following personal information:
          </p>
          <ul>
            <li>Contact information (such as name, email address, phone number, and delivery address)</li>
            <li>Account credentials (such as username and password)</li>
            <li>Payment information (such as credit card details, billing address)</li>
            <li>Dietary preferences and restrictions</li>
            <li>Health and fitness goals</li>
            <li>Order history and preferences</li>
          </ul>

          <h3>2.2 Non-Personal Information</h3>
          <p>We also collect non-personal information that does not directly identify you, including:</p>
          <ul>
            <li>Device information (such as IP address, browser type, device type)</li>
            <li>Usage data (such as pages visited, time spent on pages, links clicked)</li>
            <li>Location data (with your consent)</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2>3. How We Collect Information</h2>
          <p>We collect information through various methods, including:</p>
          <ul>
            <li>Direct interactions (when you create an account, place an order, or contact us)</li>
            <li>Automated technologies (cookies, server logs, and other tracking technologies)</li>
            <li>
              Third-party sources (payment processors, social media platforms if you choose to link your accounts)
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2>4. How We Use Your Information</h2>
          <p>We use the information we collect for various purposes, including:</p>
          <ul>
            <li>To provide and maintain our services</li>
            <li>To process and fulfill your orders</li>
            <li>To manage your account and subscription</li>
            <li>To personalize your experience and offer tailored meal recommendations</li>
            <li>To communicate with you about your orders, account, or customer service inquiries</li>
            <li>To send you marketing communications (with your consent)</li>
            <li>To improve our website, products, and services</li>
            <li>To protect our rights, property, or safety</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2>5. Disclosure of Your Information</h2>
          <p>We may share your personal information with:</p>
          <ul>
            <li>Service providers (such as payment processors, delivery partners, and IT service providers)</li>
            <li>Business partners (with your consent)</li>
            <li>Legal authorities (when required by law or to protect our rights)</li>
            <li>In the event of a merger, acquisition, or asset sale (in which case we will notify you)</li>
          </ul>
          <p>We do not sell your personal information to third parties.</p>
        </section>

        <section className="mb-8">
          <h2>6. Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information from unauthorized access,
            alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic
            storage is 100% secure, and we cannot guarantee absolute security.
          </p>
          <p>We encourage you to use a strong password and to keep your account information confidential.</p>
        </section>

        <section className="mb-8">
          <h2>7. Your Rights</h2>
          <p>Depending on your location, you may have certain rights regarding your personal information, including:</p>
          <ul>
            <li>The right to access your personal information</li>
            <li>The right to correct inaccurate or incomplete information</li>
            <li>The right to delete your personal information</li>
            <li>The right to restrict or object to processing</li>
            <li>The right to data portability</li>
            <li>The right to withdraw consent</li>
          </ul>
          <p>To exercise these rights, please contact us using the information provided in the "Contact Us" section.</p>
        </section>

        <section className="mb-8">
          <h2>8. Cookies and Tracking Technologies</h2>
          <p>
            We use cookies and similar tracking technologies to collect information about your browsing activities and
            to remember your preferences. You can instruct your browser to refuse all cookies or to indicate when a
            cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our
            Service.
          </p>
        </section>

        <section className="mb-8">
          <h2>9. Children's Privacy</h2>
          <p>
            Our Service is not intended for individuals under the age of 18. We do not knowingly collect personal
            information from children under 18. If you are a parent or guardian and you are aware that your child has
            provided us with personal information, please contact us so that we can take necessary actions.
          </p>
        </section>

        <section className="mb-8">
          <h2>10. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
            Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy
            Policy periodically for any changes.
          </p>
        </section>

        <section className="mb-8">
          <h2>11. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at:</p>
          <p>
            Email: contact@fitnest.ma
            <br />
            Phone: +212 522 123 456
            <br />
            Address: 123 Nutrition St, Casablanca, Morocco
          </p>
        </section>
      </div>
    </main>
  )
}
