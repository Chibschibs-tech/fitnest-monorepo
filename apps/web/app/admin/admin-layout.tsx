"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Package,
  Truck,
  Settings,
  Mail,
  Apple,
  ChevronDown,
  ChevronRight,
  ShoppingCart,
} from "lucide-react"
import { useState } from "react"

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
  {
    name: "Products",
    icon: ShoppingCart,
    isGroup: true,
    children: [
      { name: "Meal Plans", href: "/admin/products/meal-plans", icon: Apple },
      { name: "Individual Meals", href: "/admin/products/meals", icon: Package },
      { name: "Snacks & Supplements", href: "/admin/products/snacks", icon: Package },
      { name: "Accessories", href: "/admin/products/accessories", icon: Package },
      { name: "Express Shop", href: "/admin/products/express-shop", icon: ShoppingCart },
    ],
  },
  {
    name: "General Orders",
    icon: ShoppingBag,
    isGroup: true,
    children: [
      { name: "Subscriptions", href: "/admin/orders/subscriptions", icon: Package },
      { name: "Orders", href: "/admin/orders/orders", icon: ShoppingBag },
    ],
  },
  {
    name: "Deliveries",
    href: "/admin/deliveries",
    icon: Truck,
  },
  {
    name: "Nutrition Manager",
    href: "/admin/nutrition-manager",
    icon: Apple,
  },
  {
    name: "Add Meals",
    href: "/admin/meals/add",
    icon: Apple,
  },
  {
    name: "Email Diagnostic",
    href: "/admin/email-diagnostic",
    icon: Mail,
  },
  {
    name: "System Diagnostic",
    href: "/admin/system-diagnostic",
    icon: Settings,
  },
]

function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["General Orders", "Products"])

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupName) ? prev.filter((name) => name !== groupName) : [...prev, groupName],
    )
  }

  const isGroupExpanded = (groupName: string) => expandedGroups.includes(groupName)

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white border-r">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          </div>
          <div className="mt-5 flex-grow flex flex-col">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {navigation.map((item) => {
                if (item.isGroup && item.children) {
                  const isExpanded = isGroupExpanded(item.name)
                  const hasActiveChild = item.children.some((child) => pathname === child.href)

                  return (
                    <div key={item.name}>
                      <button
                        onClick={() => toggleGroup(item.name)}
                        className={cn(
                          "w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-left",
                          hasActiveChild
                            ? "bg-green-50 text-green-900"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                        )}
                      >
                        <item.icon
                          className={cn(
                            hasActiveChild ? "text-green-500" : "text-gray-400 group-hover:text-gray-500",
                            "mr-3 flex-shrink-0 h-5 w-5",
                          )}
                        />
                        {item.name}
                        {isExpanded ? (
                          <ChevronDown className="ml-auto h-4 w-4" />
                        ) : (
                          <ChevronRight className="ml-auto h-4 w-4" />
                        )}
                      </button>
                      {isExpanded && (
                        <div className="ml-6 mt-1 space-y-1">
                          {item.children.map((child) => {
                            const isActive = pathname === child.href
                            return (
                              <Link
                                key={child.name}
                                href={child.href}
                                className={cn(
                                  isActive
                                    ? "bg-green-100 text-green-900"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                                )}
                              >
                                <child.icon
                                  className={cn(
                                    isActive ? "text-green-500" : "text-gray-400 group-hover:text-gray-500",
                                    "mr-3 flex-shrink-0 h-4 w-4",
                                  )}
                                />
                                {child.name}
                              </Link>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                }

                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      isActive ? "bg-green-100 text-green-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                      "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                    )}
                  >
                    <item.icon
                      className={cn(
                        isActive ? "text-green-500" : "text-gray-400 group-hover:text-gray-500",
                        "mr-3 flex-shrink-0 h-5 w-5",
                      )}
                    />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 relative overflow-y-auto focus:outline-none">{children}</main>
      </div>
    </div>
  )
}

export default AdminLayout
