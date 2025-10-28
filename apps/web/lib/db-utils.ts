import { sql, db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"

// Define product type
interface Product {
  id: string
  name: string
  description: string
  price: number
  salePrice?: number
  category: string
  imageUrl?: string
  stock: number
}

// Basic cart item type
export type CartItem = {
  id: number
  productId: number
  quantity: number
  product?: Product
}

// Get database connection
export function getDb() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    throw new Error("DATABASE_URL is not defined")
  }
  return neon(dbUrl)
}

// Get cart ID from cookies or create a new one
export function getCartId() {
  const cookieStore = cookies()
  let cartId = cookieStore.get("cartId")?.value

  if (!cartId) {
    cartId = Math.random().toString(36).substring(2, 15)
    cookieStore.set("cartId", cartId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })
  }

  return cartId
}

// Get authenticated user ID
export async function getAuthenticatedUserId() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    // For guest users, use cart ID from cookie
    const cookieStore = cookies()
    let cartId = cookieStore.get("cartId")?.value

    if (!cartId) {
      cartId = uuidv4()
      // Note: We can't set cookies here since this is a server function
    }

    return cartId
  }

  return session.user.id
}

// Ensure products table exists
export async function ensureProductsTable() {
  const sql = getDb()

  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      sale_price DECIMAL(10, 2),
      category TEXT NOT NULL,
      image_url TEXT,
      stock INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `
}

// Ensure cart table exists
export async function ensureCartTable() {
  const sql = getDb()

  await sql`
    CREATE TABLE IF NOT EXISTS cart_items (
      id SERIAL PRIMARY KEY,
      cart_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `
}

// Sample products data
const sampleProducts = [
  {
    id: "protein-bar-1",
    name: "Protein Bar - Chocolate",
    description: "Delicious chocolate protein bar with 20g of protein.",
    price: 25.99,
    salePrice: null,
    category: "protein_bars",
    imageUrl: "/protein-bar.png",
    stock: 100,
  },
  {
    id: "protein-bar-2",
    name: "Protein Bar - Berry",
    description: "Delicious berry protein bar with 18g of protein.",
    price: 25.99,
    salePrice: 19.99,
    category: "protein_bars",
    imageUrl: "/berry-protein-bar.png",
    stock: 75,
  },
  {
    id: "granola-1",
    name: "Honey Almond Granola",
    description: "Crunchy granola with honey and almonds.",
    price: 45.99,
    salePrice: null,
    category: "granola",
    imageUrl: "/honey-almond-granola.png",
    stock: 50,
  },
  {
    id: "protein-pancake-1",
    name: "Protein Pancake Mix",
    description: "Make delicious protein pancakes at home.",
    price: 89.99,
    salePrice: 79.99,
    category: "breakfast",
    imageUrl: "/healthy-protein-pancake-mix.png",
    stock: 30,
  },
  {
    id: "protein-bar-pack-1",
    name: "Protein Bar Variety Pack",
    description: "Try all our delicious protein bar flavors.",
    price: 119.99,
    salePrice: null,
    category: "protein_bars",
    imageUrl: "/protein-bar-pack.png",
    stock: 25,
  },
  {
    id: "protein-bar-3",
    name: "Chocolate Peanut Butter Protein Bars",
    description: "Rich chocolate and peanut butter protein bars with 22g of protein.",
    price: 29.99,
    salePrice: null,
    category: "protein_bars",
    imageUrl: "/chocolate-peanut-butter-protein-bars.png",
    stock: 60,
  },
  {
    id: "protein-bar-variety-1",
    name: "Protein Bar Variety Box",
    description: "Box of 12 assorted protein bars with different flavors.",
    price: 249.99,
    salePrice: 199.99,
    category: "protein_bars",
    imageUrl: "/protein-bar-variety-pack.png",
    stock: 15,
  },
  {
    id: "granola-2",
    name: "Maple Pecan Granola - Medium",
    description: "Crunchy granola with maple syrup and pecans.",
    price: 49.99,
    salePrice: null,
    category: "granola",
    imageUrl: "/maple-pecan-granola-medium-pack.png",
    stock: 40,
  },
  {
    id: "granola-3",
    name: "Maple Pecan Granola - Large",
    description: "Large pack of crunchy granola with maple syrup and pecans.",
    price: 79.99,
    salePrice: 69.99,
    category: "granola",
    imageUrl: "/maple-pecan-granola-large-pack.png",
    stock: 35,
  },
]

// Seed products
export async function seedProducts() {
  const sql = getDb()

  // Check if products already exist
  const existingProducts = await sql`SELECT COUNT(*) FROM products`

  if (Number.parseInt(existingProducts[0].count) === 0) {
    // Insert sample products
    for (const product of sampleProducts) {
      await sql`
        INSERT INTO products (id, name, description, price, sale_price, category, image_url, stock)
        VALUES (${product.id}, ${product.name}, ${product.description}, ${product.price}, ${product.salePrice}, ${product.category}, ${product.imageUrl}, ${product.stock})
      `
    }
  }
}

// Ensure products exist
export async function ensureProductsExist() {
  await ensureProductsTable()
  await ensureCartTable()
  await seedProducts()
}

// Get all products
export async function getProducts(): Promise<Product[]> {
  const sql = getDb()

  const products = await sql`
    SELECT 
      id, 
      name, 
      description, 
      price, 
      sale_price as "salePrice", 
      category, 
      image_url as "imageUrl", 
      stock
    FROM products
    ORDER BY name
  `

  return products
}

// Get product by ID
export async function getProductById(id: string): Promise<Product | null> {
  const sql = getDb()

  const products = await sql`
    SELECT 
      id, 
      name, 
      description, 
      price, 
      sale_price as "salePrice", 
      category, 
      image_url as "imageUrl", 
      stock
    FROM products
    WHERE id = ${id}
  `

  return products.length > 0 ? products[0] : null
}

// Get cart items
export async function getCartItems(cartId: string) {
  const sql = getDb()

  const cartItems = await sql`
    SELECT 
      ci.id,
      ci.product_id as "productId",
      ci.quantity,
      p.name,
      p.price,
      p.sale_price as "salePrice",
      p.image_url as "imageUrl"
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.cart_id = ${cartId}
    ORDER BY ci.created_at DESC
  `

  return cartItems
}

// Add item to cart
export async function addToCart(cartId: string, productId: string, quantity: number) {
  const sql = getDb()

  // Check if product exists
  const product = await getProductById(productId)
  if (!product) {
    throw new Error("Product not found")
  }

  // Check if item already in cart
  const existingItem = await sql`
    SELECT id, quantity FROM cart_items
    WHERE cart_id = ${cartId} AND product_id = ${productId}
  `

  if (existingItem.length > 0) {
    // Update quantity
    const newQuantity = existingItem[0].quantity + quantity
    await sql`
      UPDATE cart_items
      SET quantity = ${newQuantity}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${existingItem[0].id}
    `
  } else {
    // Add new item
    await sql`
      INSERT INTO cart_items (cart_id, product_id, quantity)
      VALUES (${cartId}, ${productId}, ${quantity})
    `
  }
}

// Remove item from cart
export async function removeFromCart(cartId: string, productId: string) {
  const sql = getDb()

  await sql`
    DELETE FROM cart_items
    WHERE cart_id = ${cartId} AND product_id = ${productId}
  `
}

// Update cart item quantity
export async function updateCartItemQuantity(cartId: string, productId: string, quantity: number) {
  const sql = getDb()

  if (quantity <= 0) {
    await removeFromCart(cartId, productId)
    return
  }

  await sql`
    UPDATE cart_items
    SET quantity = ${quantity}, updated_at = CURRENT_TIMESTAMP
    WHERE cart_id = ${cartId} AND product_id = ${productId}
  `
}

// Get cart item count
export async function getCartItemCount(cartId: string): Promise<number> {
  const sql = getDb()

  const result = await sql`
    SELECT SUM(quantity) as count
    FROM cart_items
    WHERE cart_id = ${cartId}
  `

  return Number.parseInt(result[0].count) || 0
}
