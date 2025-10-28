'use client'

import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([])

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    const res = await fetch('/api/admin/coupons')
    const data = await res.json()
    setCoupons(data)
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Coupons</h1>
        <button className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2">
          <Plus size={20} />
          Nouveau Coupon
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">Code</th>
              <th className="px-6 py-3 text-left">Type</th>
              <th className="px-6 py-3 text-left">Valeur</th>
              <th className="px-6 py-3 text-left">Utilisations</th>
              <th className="px-6 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon: any) => (
              <tr key={coupon.id} className="border-t">
                <td className="px-6 py-4 font-mono font-bold">{coupon.code}</td>
                <td className="px-6 py-4">{coupon.discount_type}</td>
                <td className="px-6 py-4">{coupon.discount_value}</td>
                <td className="px-6 py-4">{coupon.current_uses}/{coupon.max_uses || '∞'}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded text-sm ${
                    coupon.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100'
                  }`}>
                    {coupon.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
