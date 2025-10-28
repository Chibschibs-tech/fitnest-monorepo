import Link from "next/link"
import Image from "next/image"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4">
              <Image
                src="https://obtmksfewry4ishp.public.blob.vercel-storage.com/Logo/Logo-Fitnest-Vert-v412yUnhxctld0VkvDHD8wXh8H2GMQ.png"
                alt="Fitnest.ma Logo"
                width={150}
                height={50}
                className="h-12 w-auto"
              />
            </div>
            <p className="text-sm text-gray-600">
              Healthy, delicious meals delivered to your door. Custom meal plans for your fitness goals.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase text-gray-500">Products</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/meal-plans" className="text-gray-600 hover:text-fitnest-green">
                  Meal Plans
                </Link>
              </li>
              <li>
                <Link href="/meals" className="text-gray-600 hover:text-fitnest-green">
                  Individual Meals
                </Link>
              </li>
              <li>
                <Link href="/express-shop" className="text-gray-600 hover:text-fitnest-green">
                  Express Shop
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase text-gray-500">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-gray-600 hover:text-fitnest-green">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-gray-600 hover:text-fitnest-green">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-600 hover:text-fitnest-green">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-600 hover:text-fitnest-green">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase text-gray-500">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-fitnest-green">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-600 hover:text-fitnest-green">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-fitnest-green">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-fitnest-green">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8 text-center text-sm text-gray-600">
          <p>&copy; {currentYear} Fitnest.ma. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

// Also export as named export for compatibility
export { Footer }
