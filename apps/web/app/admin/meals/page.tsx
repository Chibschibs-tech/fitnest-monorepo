'use client'

import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'

export default function AdminMealsPage() {
  const [meals, setMeals] = useState([])
  const [plans, setPlans] = useState([])
  const [selectedPlan, setSelectedPlan] = useState('')

  useEffect(() => {
    fetchPlans()
    fetchMeals()
  }, [])

  const fetchPlans = async () => {
    const res = await fetch('/api/admin/meal-plans')
    const data = await res.json()
    setPlans(data)
  }

  const fetchMeals = async () => {
    const url = selectedPlan 
      ? `/api/admin/meals?plan_id=${selectedPlan}`
      : '/api/admin/meals'
    const res = await fetch(url)
    const data = await res.json()
    setMeals(data)
  }

  useEffect(() => {
    fetchMeals()
  }, [selectedPlan])

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Repas</h1>
        <button className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2">
          <Plus size={20} />
          Nouveau Repas
        </button>
      </div>

      <div className="mb-6">
        <select 
          value={selectedPlan}
          onChange={(e) => setSelectedPlan(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          <option value="">Tous les plans</option>
          {plans.map((plan: any) => (
            <option key={plan.id} value={plan.id}>{plan.name}</option>
          ))}
        </select>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {meals.map((meal: any) => (
          <div key={meal.id} className="bg-white rounded-lg shadow overflow-hidden">
            {meal.image_url && (
              <img src={meal.image_url} alt={meal.name} className="w-full h-48 object-cover" />
            )}
            <div className="p-4">
              <h3 className="font-bold text-lg">{meal.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{meal.description}</p>
              <div className="flex gap-2 text-xs">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{meal.meal_type}</span>
                <span className="bg-gray-100 px-2 py-1 rounded">{meal.calories} cal</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
