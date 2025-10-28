'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash } from 'lucide-react'

export default function AdminMealPlansPage() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    const res = await fetch('/api/admin/meal-plans')
    const data = await res.json()
    setPlans(data)
    setLoading(false)
  }

  const deletePlan = async (id: string) => {
    if (!confirm('Supprimer ce plan ?')) return
    
    await fetch(`/api/admin/meal-plans/${id}`, { method: 'DELETE' })
    fetchPlans()
  }

  if (loading) return <div className="p-8">Chargement...</div>

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Meal Plans</h1>
        <button className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2">
          <Plus size={20} />
          Nouveau Plan
        </button>
      </div>

      <div className="grid gap-4">
        {plans.map((plan: any) => (
          <div key={plan.id} className="bg-white p-6 rounded-lg shadow flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <p className="text-gray-600">{plan.description}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded text-sm ${
                plan.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {plan.is_active ? 'Actif' : 'Inactif'}
              </span>
            </div>
            <div className="flex gap-2">
              <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                <Edit size={20} />
              </button>
              <button 
                onClick={() => deletePlan(plan.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
