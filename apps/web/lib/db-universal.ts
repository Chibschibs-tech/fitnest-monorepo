// lib/db-universal.ts
// Universal database client that works with both Neon and local PostgreSQL

import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import { Pool } from "pg"
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres"

// Lazy init
let _client: any = null
let _db: any = null

function isNeonUrl(url: string): boolean {
  // Neon URLs typically contain 'neon.tech' or use HTTP protocol
  return url.includes("neon.tech") || url.includes("neon") || url.startsWith("https://")
}

function isLocalUrl(url: string): boolean {
  // Local URLs are standard postgresql:// connections
  return url.startsWith("postgresql://") && (url.includes("localhost") || url.includes("127.0.0.1"))
}

function getClient() {
  if (_client) return _client

  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL is missing")

  // Determine which client to use
  if (isNeonUrl(url)) {
    // Use Neon HTTP client
    _client = neon(url)
    _db = drizzle(_client)
    return _client
  } else if (isLocalUrl(url)) {
    // Use pg Pool for local PostgreSQL
    const pool = new Pool({ connectionString: url })
    _client = pool
    _db = drizzlePg(pool)
    return _client
  } else {
    // Default: try Neon first, fallback to pg
    try {
      _client = neon(url)
      _db = drizzle(_client)
      return _client
    } catch {
      const pool = new Pool({ connectionString: url })
      _client = pool
      _db = drizzlePg(pool)
      return _client
    }
  }
}

// Create SQL template tag that works with both
export const sql: any = ((...args: any[]) => {
  const client = getClient()
  
  // If it's a Pool (local PostgreSQL), use query method
  if (client && typeof client.query === 'function' && !client.query.raw) {
    // It's a pg Pool
    return client.query(args[0][0], args[0].slice(1))
  }
  
  // Otherwise it's Neon HTTP client
  return (client as any)(...args)
}) as any

// Add query method for compatibility
;(sql as any).query = async (text: string, params?: any[]) => {
  const client = getClient()
  
  if (client && typeof client.query === 'function' && !client.query.raw) {
    // pg Pool
    const result = await client.query(text, params)
    return { rows: result.rows }
  }
  
  // Neon HTTP
  return await (client as any).query(text, params)
}

export const db = _db || (() => {
  getClient() // Initialize
  return _db
})()

// Helper: return rows directly
export async function q<T = any>(text: string, params?: any[]) {
  const result = await (sql as any).query(text, params)
  return (result.rows || result) as T[]
}

