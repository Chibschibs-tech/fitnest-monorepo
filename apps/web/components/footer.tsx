"use client"

import Link from "next/link"
import Image from "next/image"
import { useLanguage } from "@/components/language-provider"
import { getTranslations } from "@/lib/i18n"
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  const { locale } = useLanguage()
  const t = getTranslations(locale)

  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-10 sm:py-12 lg:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12">
            {/* Brand Column */}
            <div className="space-y-4 sm:space-y-5">
              <Link href="/" className="flex items-center">
                <Image
                  src="https://kjfqnhte2vxtsffe.public.blob.vercel-storage.com/Logo/Logo-Fitnest-Vert.png"
                  alt="Fitnest Logo"
                  width={150}
                  height={50}
                  className="h-10 sm:h-12 w-auto"
                  priority
                />
              </Link>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-xs">
                {t.footer.description}
              </p>

              {/* Social Media Links */}
              <div className="flex items-center gap-3 sm:gap-4 pt-2">
                <a
                  href="https://facebook.com/fitnest.ma"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-fitnest-orange transition-colors p-2 hover:bg-gray-100 rounded-full"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5 sm:h-6 sm:w-6" />
                </a>
                <a
                  href="https://instagram.com/fitnest.ma"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-fitnest-orange transition-colors p-2 hover:bg-gray-100 rounded-full"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5 sm:h-6 sm:w-6" />
                </a>
                <a
                  href="https://twitter.com/fitnest_ma"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-fitnest-orange transition-colors p-2 hover:bg-gray-100 rounded-full"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5 sm:h-6 sm:w-6" />
                </a>
              </div>
            </div>

            {/* Navigation Column */}
            <div className="space-y-4 sm:space-y-5">
              <h4 className="text-base sm:text-lg font-semibold text-gray-900">
                {t.footer.navigation}
              </h4>
              <ul className="space-y-2.5 sm:space-y-3">
                <li>
                  <Link
                    href="/plans"
                    className="text-sm sm:text-base text-gray-600 hover:text-fitnest-green transition-colors inline-block"
                  >
                    {t.footer.mealPlans}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/how-it-works"
                    className="text-sm sm:text-base text-gray-600 hover:text-fitnest-green transition-colors inline-block"
                  >
                    {t.footer.howItWorks}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/menu"
                    className="text-sm sm:text-base text-gray-600 hover:text-fitnest-green transition-colors inline-block"
                  >
                    {locale === 'fr' ? 'Menu' : 'Menu'}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/order"
                    className="text-sm sm:text-base text-gray-600 hover:text-fitnest-green transition-colors inline-block"
                  >
                    {locale === 'fr' ? 'S\'abonner' : 'Subscribe'}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Column */}
            <div className="space-y-4 sm:space-y-5">
              <h4 className="text-base sm:text-lg font-semibold text-gray-900">
                {t.footer.company}
              </h4>
              <ul className="space-y-2.5 sm:space-y-3">
                <li>
                  <Link
                    href="/about"
                    className="text-sm sm:text-base text-gray-600 hover:text-fitnest-green transition-colors inline-block"
                  >
                    {t.footer.about}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-sm sm:text-base text-gray-600 hover:text-fitnest-green transition-colors inline-block"
                  >
                    {t.footer.contactUs}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="text-sm sm:text-base text-gray-600 hover:text-fitnest-green transition-colors inline-block"
                  >
                    {t.footer.blog}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="text-sm sm:text-base text-gray-600 hover:text-fitnest-green transition-colors inline-block"
                  >
                    {locale === 'fr' ? 'FAQ' : 'FAQ'}
                  </Link>
                </li>
                <li>
                  <a
                    href="mailto:contact@fitnest.ma"
                    className="text-sm sm:text-base text-gray-600 hover:text-fitnest-green transition-colors flex items-center gap-2 group"
                  >
                    <Mail className="h-4 w-4 group-hover:text-fitnest-green flex-shrink-0" />
                    <span className="break-all">contact@fitnest.ma</span>
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+212600000000"
                    className="text-sm sm:text-base text-gray-600 hover:text-fitnest-green transition-colors flex items-center gap-2 group"
                  >
                    <Phone className="h-4 w-4 group-hover:text-fitnest-green flex-shrink-0" />
                    <span>+212 6XX XXX XXX</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal Column */}
            <div className="space-y-4 sm:space-y-5">
              <h4 className="text-base sm:text-lg font-semibold text-gray-900">
                {t.footer.legal}
              </h4>
              <ul className="space-y-2.5 sm:space-y-3">
                <li>
                  <Link
                    href="/terms"
                    className="text-sm sm:text-base text-gray-600 hover:text-fitnest-green transition-colors inline-block"
                  >
                    {t.footer.terms}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-sm sm:text-base text-gray-600 hover:text-fitnest-green transition-colors inline-block"
                  >
                    {t.footer.privacy}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/legal"
                    className="text-sm sm:text-base text-gray-600 hover:text-fitnest-green transition-colors inline-block"
                  >
                    {t.footer.legalMentions}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
              {t.footer.rights.replace('{year}', currentYear.toString())}
            </p>
            <div className="flex items-center gap-1.5 sm:gap-2 text-gray-500">
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">{locale === 'fr' ? 'Maroc' : 'Morocco'}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
