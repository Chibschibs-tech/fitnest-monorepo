'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function MealPlansPage() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/admin/meal-plans')
      if (!res.ok) {
        throw new Error(`Failed to fetch meal plans: ${res.status}`)
      }
      const data = await res.json()
      // Handle both array response and error response
      const plansArray = Array.isArray(data) ? data : (data.plans || data.data || [])
      setPlans(plansArray.filter((p: any) => p.is_active !== false))
    } catch (error) {
      console.error('Error fetching meal plans:', error)
      setPlans([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8 sm:py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4">Nos Plans Repas</h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600">Choisissez le plan adapté à vos objectifs</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {plans.map((plan: any) => (
            <div 
              key={plan.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              {plan.image_url && (
                <div className="h-48 sm:h-56 md:h-64 overflow-hidden">
                  <img 
                    src={plan.image_url} 
                    alt={plan.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
              )}
              
              <div className="p-4 sm:p-6 md:p-8">
                <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">{plan.name}</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">{plan.description}</p>
                
                <Link 
                  href="/order"
                  className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg text-sm sm:text-base font-semibold transition-colors"
                >
                  Choisir ce plan
                  <ArrowRight size={18} className="sm:w-5 sm:h-5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
