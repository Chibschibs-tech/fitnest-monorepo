import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms and Conditions | Fitnest",
  description:
    "Read the terms and conditions for using Fitnest services, including meal delivery, subscriptions, and website usage.",
}

export default function TermsPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6 text-center">Terms and Conditions</h1>

      <div className="max-w-4xl mx-auto prose prose-lg">
        <p className="text-gray-500 mb-8 text-center">Last updated: May 6, 2023</p>

        <section className="mb-8">
          <h2>1. Introduction</h2>
          <p>
            Welcome to Fitnest. These Terms and Conditions govern your use of our website, mobile application, and
            services. By accessing or using Fitnest, you agree to be bound by these Terms. If you disagree with any part
            of these terms, you may not access our services.
          </p>
        </section>

        <section className="mb-8">
          <h2>2. Definitions</h2>
          <p>
            <strong>"Service"</strong> refers to the meal preparation and delivery service provided by Fitnest.
          </p>
          <p>
            <strong>"User"</strong> refers to the individual who accesses or uses the Service, whether as a registered
            user or guest.
          </p>
          <p>
            <strong>"Subscription"</strong> refers to the recurring meal plan service offered by Fitnest.
          </p>
        </section>

        <section className="mb-8">
          <h2>3. Account Registration</h2>
          <p>
            To use certain features of our Service, you may be required to register for an account. You agree to provide
            accurate, current, and complete information during the registration process and to update such information
            to keep it accurate, current, and complete.
          </p>
          <p>
            You are responsible for safeguarding the password that you use to access the Service and for any activities
            or actions under your password. We encourage you to use a strong password (using a combination of upper and
            lower case letters, numbers, and symbols) with your account.
          </p>
        </section>

        <section className="mb-8">
          <h2>4. Subscriptions and Orders</h2>
          <p>By subscribing to our meal plans, you agree to the following terms:</p>
          <ul>
            <li>
              Subscription fees will be charged automatically according to the plan you select (weekly, bi-weekly, or
              monthly).
            </li>
            <li>
              You may modify or cancel your subscription at any time through your account settings or by contacting our
              customer service at least 48 hours before your next scheduled delivery.
            </li>
            <li>
              Changes to your subscription, including delivery address, meal preferences, or delivery schedule, must be
              made at least 48 hours before your scheduled delivery.
            </li>
            <li>We reserve the right to adjust pricing for our subscriptions with reasonable notice to subscribers.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2>5. Delivery</h2>
          <p>
            Fitnest will deliver meals to the address provided by the User during the ordering process. By using our
            Service, you agree to the following:
          </p>
          <ul>
            <li>You will provide accurate delivery information, including address and contact details.</li>
            <li>
              You or someone authorized by you will be available to receive the delivery during the specified delivery
              window.
            </li>
            <li>
              If no one is available to receive the delivery, we will leave the package at the door if it's safe to do
              so, or follow your delivery instructions if provided.
            </li>
            <li>Fitnest is not responsible for theft, damage, or spoilage after delivery has been completed.</li>
            <li>
              Delivery times are estimates and may vary based on traffic, weather conditions, or other unforeseen
              circumstances.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2>6. Food Safety and Allergies</h2>
          <p>
            While we take all reasonable precautions to ensure the safety and quality of our meals, we cannot guarantee
            that our meals are free from allergens. Users with severe allergies should be aware that our meals are
            prepared in a kitchen that processes common allergens including but not limited to nuts, gluten, dairy,
            eggs, soy, and shellfish.
          </p>
          <p>By using our Service, you acknowledge that:</p>
          <ul>
            <li>You are responsible for checking the ingredients list for each meal.</li>
            <li>
              You will refrigerate meals promptly upon delivery and consume them by the "best by" date indicated on the
              packaging.
            </li>
            <li>
              Fitnest is not liable for any adverse reactions or health issues resulting from the consumption of our
              meals.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2>7. Payment and Refunds</h2>
          <p>
            By using our Service, you agree to pay all charges at the prices listed for your selected meals and
            delivery. Payment must be made using one of our accepted payment methods. If we are unable to charge your
            payment method, we reserve the right to cancel your order or subscription.
          </p>
          <p>Refund Policy:</p>
          <ul>
            <li>
              If you are not satisfied with your meal for any reason, please contact our customer service within 24
              hours of delivery.
            </li>
            <li>Refunds or credits may be issued at our discretion based on the nature of the complaint.</li>
            <li>
              No refunds will be issued for meals that have been consumed or for complaints received more than 24 hours
              after delivery.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2>8. Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality are and will remain the exclusive property
            of Fitnest and its licensors. The Service is protected by copyright, trademark, and other laws of Morocco
            and foreign countries.
          </p>
          <p>
            Our trademarks and trade dress may not be used in connection with any product or service without the prior
            written consent of Fitnest.
          </p>
        </section>

        <section className="mb-8">
          <h2>9. Limitation of Liability</h2>
          <p>
            In no event shall Fitnest, nor its directors, employees, partners, agents, suppliers, or affiliates, be
            liable for any indirect, incidental, special, consequential or punitive damages, including without
            limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
          </p>
          <ul>
            <li>Your access to or use of or inability to access or use the Service;</li>
            <li>Any conduct or content of any third party on the Service;</li>
            <li>Any content obtained from the Service; and</li>
            <li>Unauthorized access, use or alteration of your transmissions or content.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2>10. Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is
            material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What
            constitutes a material change will be determined at our sole discretion.
          </p>
          <p>
            By continuing to access or use our Service after those revisions become effective, you agree to be bound by
            the revised terms. If you do not agree to the new terms, please stop using the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2>11. Contact Us</h2>
          <p>If you have any questions about these Terms, please contact us at:</p>
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
