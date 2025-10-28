import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Clock, Gift, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function WaitlistSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-fitnest-green/5 to-fitnest-orange/5 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full shadow-2xl border-0">
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 bg-fitnest-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-fitnest-green" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Welcome to the Waitlist! 🎉</h1>

          <p className="text-lg text-gray-600 mb-8">
            You're officially on the Fitnest.ma exclusive waitlist. We'll notify you as soon as a spot opens up!
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-fitnest-orange/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="h-6 w-6 text-fitnest-orange" />
              </div>
              <h3 className="font-semibold mb-1">Average Wait</h3>
              <p className="text-sm text-gray-600">2-3 weeks</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-fitnest-green/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Gift className="h-6 w-6 text-fitnest-green" />
              </div>
              <h3 className="font-semibold mb-1">Your Benefits</h3>
              <p className="text-sm text-gray-600">15% off + perks</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-fitnest-orange/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-fitnest-orange" />
              </div>
              <h3 className="font-semibold mb-1">Next Steps</h3>
              <p className="text-sm text-gray-600">We'll email you</p>
            </div>
          </div>

          <div className="bg-fitnest-green/5 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-fitnest-green mb-3">What happens next?</h3>
            <ul className="text-sm text-gray-700 space-y-2 text-left">
              <li>✅ You'll receive a confirmation email shortly</li>
              <li>📧 We'll notify you when a spot opens (usually 2-3 weeks)</li>
              <li>⏰ You'll have 48 hours to confirm your subscription</li>
              <li>🎁 Your exclusive benefits will be automatically applied</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button
                variant="outline"
                className="border-fitnest-green text-fitnest-green hover:bg-fitnest-green hover:text-white"
              >
                Back to Home
              </Button>
            </Link>
            <Link href="/blog">
              <Button className="bg-fitnest-green hover:bg-fitnest-green/90 text-white">
                Read Nutrition Tips
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
