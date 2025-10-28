"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, Package, ShoppingCart, Truck, Settings, Database, Mail, Repeat } from "lucide-react"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
  {
    title: "Products",
    icon: Package,
    children: [
      {
        title: "Meals",
        href: "/admin/products/meals",
      },
      {
        title: "Meal Plans",
        href: "/admin/products/meal-plans",
      },
      {
        title: "Snacks",
        href: "/admin/products/snacks",
      },
      {
        title: "Express Shop",
        href: "/admin/products/express-shop",
      },
      {
        title: "Accessories",
        href: "/admin/products/accessories",
      },
    ],
  },
  {
    title: "Orders",
    icon: ShoppingCart,
    children: [
      {
        title: "All Orders",
        href: "/admin/orders/orders",
      },
      {
        title: "Subscriptions",
        href: "/admin/orders/subscriptions",
      },
    ],
  },
  {
    title: "Subscription System",
    icon: Repeat,
    children: [
      {
        title: "Subscription Plans",
        href: "/admin/subscription-plans",
      },
      {
        title: "Active Subscriptions",
        href: "/admin/subscriptions/active",
      },
      {
        title: "Paused Subscriptions",
        href: "/admin/subscriptions/paused",
      },
    ],
  },
  {
    title: "Deliveries",
    href: "/admin/deliveries",
    icon: Truck,
  },
  {
    title: "Waitlist",
    href: "/admin/waitlist",
    icon: Mail,
  },
  {
    title: "System Setup",
    icon: Database,
    children: [
      {
        title: "Check Tables",
        href: "/admin/check-subscription-tables",
      },
      {
        title: "Create Tables",
        href: "/admin/create-subscription-tables",
      },
      {
        title: "Initialize Plans",
        href: "/admin/init-subscription-plans",
      },
    ],
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
      </div>
      <nav className="px-4 pb-4">
        <ul className="space-y-2">
          {sidebarItems.map((item) => (
            <li key={item.title}>
              {item.children ? (
                <div>
                  <div className="flex items-center px-3 py-2 text-sm font-medium text-gray-700">
                    <item.icon className="mr-3 h-4 w-4" />
                    {item.title}
                  </div>
                  <ul className="ml-6 space-y-1">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className={cn(
                            "block px-3 py-2 text-sm rounded-md transition-colors",
                            pathname === child.href
                              ? "bg-blue-100 text-blue-700 font-medium"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                          )}
                        >
                          {child.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    pathname === item.href
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                  )}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.title}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
