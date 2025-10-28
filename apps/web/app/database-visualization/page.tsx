"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DatabaseVisualizationPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Database Structure Visualization</h1>
        <p className="text-gray-600">Understanding how meals link to meal plans</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meal to Meal Plan Relationship</CardTitle>
          <CardDescription>How individual meals connect to subscription plans</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Step 1: Create the Meal Plan (Product)</h3>
              <pre className="bg-blue-100 p-3 rounded text-sm overflow-x-auto">
                {`-- Meal Plan is a PRODUCT with type 'subscription'
INSERT INTO products (name, slug, product_type, base_price) 
VALUES ('Vegan Plan', 'vegan-plan', 'subscription', 299.00);
-- This creates product_id = 1`}
              </pre>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Step 2: Create Subscription Details</h3>
              <pre className="bg-green-100 p-3 rounded text-sm overflow-x-auto">
                {`-- Link the product to subscription system
INSERT INTO subscription_plans (product_id, name, billing_period, price) 
VALUES (1, 'Vegan Plan', 'weekly', 299.00);
-- This creates plan_id = 1`}
              </pre>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">Step 3: Create Individual Meals (Products)</h3>
              <pre className="bg-purple-100 p-3 rounded text-sm overflow-x-auto">
                {`-- Each meal is a separate PRODUCT with type 'simple'
INSERT INTO products (name, slug, product_type, base_price) VALUES
('Vegan Buddha Bowl', 'vegan-buddha-bowl', 'simple', 45.00),      -- product_id = 2
('Quinoa Stuffed Peppers', 'quinoa-stuffed-peppers', 'simple', 42.00), -- product_id = 3
('Lentil Curry', 'lentil-curry', 'simple', 38.00);               -- product_id = 4`}
              </pre>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-900 mb-2">Step 4: Link Meals to Plan</h3>
              <pre className="bg-orange-100 p-3 rounded text-sm overflow-x-auto">
                {`-- The BRIDGE TABLE that connects meals to meal plans
INSERT INTO subscription_plan_items (plan_id, product_id, quantity) VALUES
(1, 2, 1), -- Vegan Plan includes 1x Vegan Buddha Bowl
(1, 3, 1), -- Vegan Plan includes 1x Quinoa Stuffed Peppers  
(1, 4, 1); -- Vegan Plan includes 1x Lentil Curry`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>The Key Relationship</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold mb-4">subscription_plan_items is the BRIDGE TABLE</h3>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="bg-blue-100 p-4 rounded">
                <h4 className="font-semibold text-blue-900">Meal Plan</h4>
                <p className="text-sm">products table</p>
                <p className="text-xs text-gray-600">type: subscription</p>
              </div>
              <div className="bg-yellow-100 p-4 rounded">
                <h4 className="font-semibold text-yellow-900">BRIDGE</h4>
                <p className="text-sm">subscription_plan_items</p>
                <p className="text-xs text-gray-600">Links plan_id to product_id</p>
              </div>
              <div className="bg-green-100 p-4 rounded">
                <h4 className="font-semibold text-green-900">Individual Meals</h4>
                <p className="text-sm">products table</p>
                <p className="text-xs text-gray-600">type: simple</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Query Examples</CardTitle>
          <CardDescription>How to fetch meals for a specific plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Get all meals in "Vegan Plan":</h4>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                {`SELECT 
  p.name as meal_name,
  p.base_price,
  p.nutritional_info,
  spi.quantity,
  spi.delivery_week
FROM subscription_plans sp
JOIN subscription_plan_items spi ON sp.id = spi.plan_id  
JOIN products p ON spi.product_id = p.id
WHERE sp.name = 'Vegan Plan'
ORDER BY spi.delivery_week, spi.sort_order;`}
              </pre>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Get all plans that include "Vegan Buddha Bowl":</h4>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                {`SELECT 
  sp.name as plan_name,
  sp.price,
  sp.billing_period
FROM products meal
JOIN subscription_plan_items spi ON meal.id = spi.product_id
JOIN subscription_plans sp ON spi.plan_id = sp.id  
WHERE meal.name = 'Vegan Buddha Bowl';`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Flexibility Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-green-700">✅ What This Enables:</h4>
              <ul className="space-y-2 text-sm">
                <li>• Same meal in multiple plans</li>
                <li>• Meals sold individually AND in plans</li>
                <li>• Easy plan customization</li>
                <li>• Consistent pricing across contexts</li>
                <li>• Optional meals (customers can opt out)</li>
                <li>• Delivery scheduling per meal</li>
                <li>• Add-on meals to existing plans</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-blue-700">🔄 Real Examples:</h4>
              <ul className="space-y-2 text-sm">
                <li>• "Grilled Chicken" in both Weight Loss & Muscle plans</li>
                <li>• Customer buys "Salmon Bowl" individually</li>
                <li>• Later subscribes to plan that includes same meal</li>
                <li>• Consistent nutrition data everywhere</li>
                <li>• Easy inventory management</li>
                <li>• Simple pricing updates</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
