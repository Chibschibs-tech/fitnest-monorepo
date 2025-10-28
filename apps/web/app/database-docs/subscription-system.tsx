"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function SubscriptionSystemDocs() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Subscription System Architecture</h1>
        <p className="text-lg text-gray-600">How the subscription tables work across different business types</p>
      </div>

      {/* Core Tables */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📋 subscription_plans
              <Badge variant="secondary">Definition</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">Defines what subscription packages you offer</p>

            <div className="space-y-2">
              <h4 className="font-semibold">Key Fields:</h4>
              <ul className="text-sm space-y-1">
                <li>
                  <code>product_id</code> - Links to main product
                </li>
                <li>
                  <code>billing_period</code> - weekly, monthly, yearly
                </li>
                <li>
                  <code>billing_interval</code> - every X periods
                </li>
                <li>
                  <code>price</code> - recurring charge amount
                </li>
                <li>
                  <code>trial_period_days</code> - free trial length
                </li>
                <li>
                  <code>items_per_delivery</code> - what they get each cycle
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm">
                <strong>Example:</strong> "Premium Meal Plan" - $299/week, 5 meals per delivery, 7-day trial
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔗 subscription_plan_items
              <Badge variant="secondary">Contents</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">What products are included in each plan</p>

            <div className="space-y-2">
              <h4 className="font-semibold">Key Fields:</h4>
              <ul className="text-sm space-y-1">
                <li>
                  <code>plan_id</code> - Which plan this belongs to
                </li>
                <li>
                  <code>product_id</code> - Which product is included
                </li>
                <li>
                  <code>quantity</code> - How many of this product
                </li>
                <li>
                  <code>is_optional</code> - Can customer opt out?
                </li>
                <li>
                  <code>delivery_week</code> - Which week of cycle
                </li>
                <li>
                  <code>additional_price</code> - Extra cost for premium items
                </li>
              </ul>
            </div>

            <div className="bg-green-50 p-3 rounded">
              <p className="text-sm">
                <strong>Example:</strong> Vegan Plan includes Buddha Bowl (qty: 1), Quinoa Peppers (qty: 1), optional
                protein bar (+$5)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ✅ active_subscriptions
              <Badge variant="secondary">Customer State</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">Individual customer subscription instances</p>

            <div className="space-y-2">
              <h4 className="font-semibold">Key Fields:</h4>
              <ul className="text-sm space-y-1">
                <li>
                  <code>customer_id</code> - Who owns this subscription
                </li>
                <li>
                  <code>plan_id</code> - Which plan they chose
                </li>
                <li>
                  <code>status</code> - active, paused, cancelled
                </li>
                <li>
                  <code>next_billing_date</code> - When to charge next
                </li>
                <li>
                  <code>next_delivery_date</code> - When to deliver next
                </li>
                <li>
                  <code>custom_items</code> - Customer modifications
                </li>
              </ul>
            </div>

            <div className="bg-purple-50 p-3 rounded">
              <p className="text-sm">
                <strong>Example:</strong> John's Vegan Plan subscription - active, next billing March 15, custom: no
                quinoa
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🚚 deliveries
              <Badge variant="secondary">Fulfillment</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">Individual delivery instances for subscriptions</p>

            <div className="space-y-2">
              <h4 className="font-semibold">Key Fields:</h4>
              <ul className="text-sm space-y-1">
                <li>
                  <code>subscription_id</code> - Which subscription this fulfills
                </li>
                <li>
                  <code>scheduled_date</code> - When it should be delivered
                </li>
                <li>
                  <code>status</code> - scheduled, in_transit, delivered
                </li>
                <li>
                  <code>items</code> - Snapshot of what's being delivered
                </li>
                <li>
                  <code>tracking_number</code> - Shipping tracking
                </li>
                <li>
                  <code>delivery_rating</code> - Customer feedback
                </li>
              </ul>
            </div>

            <div className="bg-orange-50 p-3 rounded">
              <p className="text-sm">
                <strong>Example:</strong> John's March 15 delivery - 3 meals, tracking #ABC123, delivered successfully,
                rated 5 stars
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business Examples */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">How It Works Across Different Businesses</h2>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Meal Delivery */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">🍽️ Meal Delivery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">subscription_plans:</h4>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p>
                    <strong>Keto Plan</strong>
                  </p>
                  <p>billing_period: weekly</p>
                  <p>price: $299.00</p>
                  <p>items_per_delivery: 5</p>
                  <p>delivery_frequency: weekly</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">subscription_plan_items:</h4>
                <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
                  <p>• Keto Salmon Bowl (qty: 1)</p>
                  <p>• Avocado Chicken Salad (qty: 1)</p>
                  <p>• Cauliflower Rice Bowl (qty: 1)</p>
                  <p>• Protein Bar (qty: 2, optional)</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">deliveries:</h4>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p>scheduled_date: Every Monday</p>
                  <p>delivery_window: 9AM-12PM</p>
                  <p>items: Fresh meals in insulated box</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Software SaaS */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">💻 Software SaaS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">subscription_plans:</h4>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p>
                    <strong>Pro Plan</strong>
                  </p>
                  <p>billing_period: monthly</p>
                  <p>price: $49.00</p>
                  <p>items_per_delivery: N/A</p>
                  <p>delivery_frequency: N/A</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">subscription_plan_items:</h4>
                <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
                  <p>• CRM Access (qty: 1)</p>
                  <p>• Email Marketing (qty: 1)</p>
                  <p>• Analytics Dashboard (qty: 1)</p>
                  <p>• API Access (qty: 1000 calls)</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">deliveries:</h4>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p>scheduled_date: Feature releases</p>
                  <p>delivery_window: N/A</p>
                  <p>items: Software updates, new features</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Beauty Box */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">💄 Beauty Box</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">subscription_plans:</h4>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p>
                    <strong>Glam Box</strong>
                  </p>
                  <p>billing_period: monthly</p>
                  <p>price: $25.00</p>
                  <p>items_per_delivery: 5</p>
                  <p>delivery_frequency: monthly</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">subscription_plan_items:</h4>
                <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
                  <p>• Lipstick (qty: 1, random color)</p>
                  <p>• Face Mask (qty: 2)</p>
                  <p>• Nail Polish (qty: 1)</p>
                  <p>• Skincare Sample (qty: 3)</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">deliveries:</h4>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p>scheduled_date: 1st of each month</p>
                  <p>delivery_window: Standard shipping</p>
                  <p>items: Curated beauty products</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle>🔑 Key Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Universal Concepts:</h4>
              <ul className="text-sm space-y-1">
                <li>
                  • <strong>Plan</strong> = What you're selling as a subscription
                </li>
                <li>
                  • <strong>Items</strong> = What's included in each plan
                </li>
                <li>
                  • <strong>Active Subscription</strong> = Customer's current subscription state
                </li>
                <li>
                  • <strong>Delivery</strong> = Individual fulfillment instances
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Business Adaptations:</h4>
              <ul className="text-sm space-y-1">
                <li>
                  • <strong>Physical goods</strong> = Use delivery scheduling
                </li>
                <li>
                  • <strong>Digital services</strong> = "Delivery" = feature releases
                </li>
                <li>
                  • <strong>Service business</strong> = "Delivery" = appointments
                </li>
                <li>
                  • <strong>No subscriptions?</strong> = Simply don't use these tables
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
