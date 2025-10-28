import { sql, db } from "@/lib/db"


// =============================================
// PRODUCT MANAGEMENT
// =============================================

export interface Product {
  id: number
  name: string
  slug: string
  description?: string
  product_type: "simple" | "variable" | "subscription" | "bundle" | "service"
  base_price: number
  sale_price?: number
  stock_quantity: number
  status: "active" | "inactive" | "draft"
  nutritional_info?: any
  dietary_tags?: string[]
  created_at: string
}

export interface ProductCategory {
  id: number
  name: string
  slug: string
  description?: string
  parent_id?: number
}

export interface SubscriptionPlan {
  id: number
  product_id: number
  name: string
  description?: string
  billing_period: "weekly" | "monthly" | "quarterly" | "yearly"
  price: number
  trial_period_days: number
  items_per_delivery: number
  is_active: boolean
}

export interface Customer {
  id: number
  first_name?: string
  last_name?: string
  email: string
  phone?: string
  total_orders: number
  total_spent: number
  status: "active" | "inactive" | "suspended"
  created_at: string
}

export interface Order {
  id: number
  order_number: string
  customer_id?: number
  order_type: "one_time" | "subscription" | "subscription_renewal"
  subtotal: number
  total_amount: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  created_at: string
}

export interface ActiveSubscription {
  id: number
  customer_id: number
  plan_id: number
  status: "active" | "paused" | "cancelled" | "expired"
  next_billing_date: string
  billing_amount: number
  created_at: string
}

// =============================================
// PRODUCT SERVICES
// =============================================

export async function getProducts(filters?: {
  category?: string
  type?: string
  status?: string
  limit?: number
  offset?: number
}): Promise<Product[]> {
  try {
    let whereClause = "WHERE 1=1"
    const params: any[] = []

    if (filters?.category) {
      whereClause += ` AND EXISTS (
        SELECT 1 FROM product_category_relationships pcr 
        JOIN product_categories pc ON pcr.category_id = pc.id 
        WHERE pcr.product_id = p.id AND pc.slug = $${params.length + 1}
      )`
      params.push(filters.category)
    }

    if (filters?.type) {
      whereClause += ` AND p.product_type = $${params.length + 1}`
      params.push(filters.type)
    }

    if (filters?.status) {
      whereClause += ` AND p.status = $${params.length + 1}`
      params.push(filters.status)
    }

    const limitClause = filters?.limit ? `LIMIT ${filters.limit}` : ""
    const offsetClause = filters?.offset ? `OFFSET ${filters.offset}` : ""

    const query = `
      SELECT * FROM products p 
      ${whereClause} 
      ORDER BY p.created_at DESC 
      ${limitClause} ${offsetClause}
    `

    const result = await q(query, params)
    return result.rows as Product[]
  } catch (error) {
    console.error("Error fetching products:", error)
    return []
  }
}

export async function getProductById(id: number): Promise<Product | null> {
  try {
    const result = await sql`
      SELECT * FROM products WHERE id = ${id}
    `
    return (result[0] as Product) || null
  } catch (error) {
    console.error("Error fetching product:", error)
    return null
  }
}

export async function createProduct(productData: Partial<Product>): Promise<Product | null> {
  try {
    const result = await sql`
      INSERT INTO products (
        name, slug, description, product_type, base_price, 
        sale_price, stock_quantity, status, nutritional_info, dietary_tags
      ) VALUES (
        ${productData.name}, ${productData.slug}, ${productData.description},
        ${productData.product_type}, ${productData.base_price}, ${productData.sale_price},
        ${productData.stock_quantity}, ${productData.status}, 
        ${JSON.stringify(productData.nutritional_info)}, ${productData.dietary_tags}
      ) RETURNING *
    `
    return result[0] as Product
  } catch (error) {
    console.error("Error creating product:", error)
    return null
  }
}

// =============================================
// SUBSCRIPTION SERVICES
// =============================================

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  try {
    const result = await sql`
      SELECT sp.*, p.name as product_name 
      FROM subscription_plans sp
      JOIN products p ON sp.product_id = p.id
      WHERE sp.is_active = true
      ORDER BY sp.price ASC
    `
    return result as SubscriptionPlan[]
  } catch (error) {
    console.error("Error fetching subscription plans:", error)
    return []
  }
}

export async function getActiveSubscriptions(filters?: {
  customer_id?: number
  status?: string
  limit?: number
}): Promise<ActiveSubscription[]> {
  try {
    let whereClause = "WHERE 1=1"
    const params: any[] = []

    if (filters?.customer_id) {
      whereClause += ` AND s.customer_id = $${params.length + 1}`
      params.push(filters.customer_id)
    }

    if (filters?.status) {
      whereClause += ` AND s.status = $${params.length + 1}`
      params.push(filters.status)
    }

    const limitClause = filters?.limit ? `LIMIT ${filters.limit}` : ""

    const query = `
      SELECT s.*, c.first_name, c.last_name, c.email, sp.name as plan_name
      FROM active_subscriptions s
      JOIN customers c ON s.customer_id = c.id
      JOIN subscription_plans sp ON s.plan_id = sp.id
      ${whereClause}
      ORDER BY s.created_at DESC
      ${limitClause}
    `

    const result = await q(query, params)
    return result.rows as ActiveSubscription[]
  } catch (error) {
    console.error("Error fetching active subscriptions:", error)
    return []
  }
}

// =============================================
// CUSTOMER SERVICES
// =============================================

export async function getCustomers(filters?: {
  status?: string
  search?: string
  limit?: number
  offset?: number
}): Promise<Customer[]> {
  try {
    let whereClause = "WHERE 1=1"
    const params: any[] = []

    if (filters?.status) {
      whereClause += ` AND status = $${params.length + 1}`
      params.push(filters.status)
    }

    if (filters?.search) {
      whereClause += ` AND (first_name ILIKE $${params.length + 1} OR last_name ILIKE $${params.length + 1} OR email ILIKE $${params.length + 1})`
      params.push(`%${filters.search}%`)
    }

    const limitClause = filters?.limit ? `LIMIT ${filters.limit}` : ""
    const offsetClause = filters?.offset ? `OFFSET ${filters.offset}` : ""

    const query = `
      SELECT * FROM customers 
      ${whereClause} 
      ORDER BY created_at DESC 
      ${limitClause} ${offsetClause}
    `

    const result = await q(query, params)
    return result.rows as Customer[]
  } catch (error) {
    console.error("Error fetching customers:", error)
    return []
  }
}

// =============================================
// ORDER SERVICES
// =============================================

export async function getOrders(filters?: {
  customer_id?: number
  status?: string
  type?: string
  limit?: number
  offset?: number
}): Promise<Order[]> {
  try {
    let whereClause = "WHERE 1=1"
    const params: any[] = []

    if (filters?.customer_id) {
      whereClause += ` AND customer_id = $${params.length + 1}`
      params.push(filters.customer_id)
    }

    if (filters?.status) {
      whereClause += ` AND status = $${params.length + 1}`
      params.push(filters.status)
    }

    if (filters?.type) {
      whereClause += ` AND order_type = $${params.length + 1}`
      params.push(filters.type)
    }

    const limitClause = filters?.limit ? `LIMIT ${filters.limit}` : ""
    const offsetClause = filters?.offset ? `OFFSET ${filters.offset}` : ""

    const query = `
      SELECT o.*, c.first_name, c.last_name, c.email
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      ${whereClause}
      ORDER BY o.created_at DESC
      ${limitClause} ${offsetClause}
    `

    const result = await q(query, params)
    return result.rows as Order[]
  } catch (error) {
    console.error("Error fetching orders:", error)
    return []
  }
}

// =============================================
// ANALYTICS SERVICES
// =============================================

export async function getDashboardStats() {
  try {
    const [customerStats] = await sql`
      SELECT 
        COUNT(*) as total_customers,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_customers,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_customers_30d
      FROM customers
    `

    const [orderStats] = await sql`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as completed_orders,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(AVG(total_amount), 0) as avg_order_value
      FROM orders
    `

    const [subscriptionStats] = await sql`
      SELECT 
        COUNT(*) as total_subscriptions,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_subscriptions,
        COUNT(CASE WHEN status = 'paused' THEN 1 END) as paused_subscriptions,
        COALESCE(SUM(billing_amount), 0) as monthly_recurring_revenue
      FROM active_subscriptions
    `

    const [productStats] = await sql`
      SELECT 
        COUNT(*) as total_products,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_products,
        COUNT(CASE WHEN stock_quantity <= low_stock_threshold THEN 1 END) as low_stock_products
      FROM products
    `

    return {
      customers: {
        total: Number.parseInt(customerStats.total_customers || "0"),
        active: Number.parseInt(customerStats.active_customers || "0"),
        new_30d: Number.parseInt(customerStats.new_customers_30d || "0"),
      },
      orders: {
        total: Number.parseInt(orderStats.total_orders || "0"),
        completed: Number.parseInt(orderStats.completed_orders || "0"),
        revenue: Number.parseFloat(orderStats.total_revenue || "0"),
        avg_value: Number.parseFloat(orderStats.avg_order_value || "0"),
      },
      subscriptions: {
        total: Number.parseInt(subscriptionStats.total_subscriptions || "0"),
        active: Number.parseInt(subscriptionStats.active_subscriptions || "0"),
        paused: Number.parseInt(subscriptionStats.paused_subscriptions || "0"),
        mrr: Number.parseFloat(subscriptionStats.monthly_recurring_revenue || "0"),
      },
      products: {
        total: Number.parseInt(productStats.total_products || "0"),
        active: Number.parseInt(productStats.active_products || "0"),
        low_stock: Number.parseInt(productStats.low_stock_products || "0"),
      },
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return {
      customers: { total: 0, active: 0, new_30d: 0 },
      orders: { total: 0, completed: 0, revenue: 0, avg_value: 0 },
      subscriptions: { total: 0, active: 0, paused: 0, mrr: 0 },
      products: { total: 0, active: 0, low_stock: 0 },
    }
  }
}
