// lib/db.ts
// Universal database client - supports both Neon and local PostgreSQL
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { Pool } from "pg";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";

// Lazy init
let _client: any = null;
let _db: any = null;
let _isNeon: boolean = false;

function isNeonUrl(url: string): boolean {
  // Neon URLs typically contain 'neon.tech' or use HTTP protocol
  return url.includes("neon.tech") || url.includes("neon") || url.startsWith("https://");
}

function isLocalUrl(url: string): boolean {
  // Local URLs are standard postgresql:// connections
  return url.startsWith("postgresql://") && (url.includes("localhost") || url.includes("127.0.0.1"));
}

function getClient() {
  if (_client) return _client;

  const url = process.env.DATABASE_URL;
  // Don't throw during build time - return a stub
  if (!url) {
    if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
      // Only throw in production if we're not in Vercel (should have env vars)
      throw new Error("DATABASE_URL is missing");
    }
    // During build, return a stub that won't execute queries
    console.warn("DATABASE_URL is missing - using stub client (build time)");
    return null;
  }

  // Determine which client to use
  if (isNeonUrl(url)) {
    // Use Neon HTTP client
    _isNeon = true;
    _client = neon(url);
    _db = drizzle(_client);
    return _client;
  } else {
    // Use pg Pool for local PostgreSQL or other standard connections
    _isNeon = false;
    const pool = new Pool({ connectionString: url });
    _client = pool;
    _db = drizzlePg(pool);
    return _client;
  }
}

/**
 * SQL template tag compatible with both Neon and pg
 * For Neon: uses HTTP client directly
 * For pg: converts template tag to parameterized query and normalizes result
 */
export const sql: any = ((strings: TemplateStringsArray, ...values: any[]) => {
  const client = getClient();
  if (!client) {
    // During build time, return empty array to avoid errors
    return Promise.resolve([]);
  }
  
  if (_isNeon) {
    // Neon HTTP client - use as template tag
    const client = getClient();
    return (client as any)(strings, ...values);
  } else {
    // For pg, convert template tag to parameterized query
    const pool = getClient() as Pool;
    let queryText = strings[0];
    const params: any[] = [];
    
    for (let i = 0; i < values.length; i++) {
      params.push(values[i]);
      queryText += `$${params.length}` + (strings[i + 1] || '');
    }
    
    // Execute query and normalize result to match Neon format (array of rows)
    return pool.query(queryText, params).then((pgResult: any) => {
      // Normalize: return rows array directly to match Neon behavior
      return pgResult.rows || [];
    });
  }
}) as any;

// Add query method for compatibility
(sql as any).query = async (text: string, params?: any[]) => {
  const client = getClient();
  if (!client) {
    // During build time, return empty result
    return { rows: [] };
  }
  
  if (_isNeon) {
    // Neon HTTP
    return await (client as any).query(text, params);
  } else {
    // pg Pool
    const result = await (client as Pool).query(text, params);
    return { rows: result.rows };
  }
};

(sql as any).array = (...args: any[]) => {
  if (_isNeon) {
    return (getClient() as any).array?.(...args);
  }
  // pg doesn't have array method, use query instead
  return (sql as any).query(...args);
};

(sql as any).transaction = (...args: any[]) => {
  if (_isNeon) {
    return (getClient() as any).transaction?.(...args);
  }
  // For pg, transactions need to be handled differently
  throw new Error("Transactions not yet implemented for local PostgreSQL. Use Neon for transaction support.");
};

// Drizzle instance
export const db = (() => {
  if (_db) return _db;
  getClient(); // Initialize
  return _db;
})();

// Helper: return rows directly
export async function q<T = any>(text: string, params?: any[]) {
  const result = await (sql as any).query(text, params);
  return (result.rows || result) as T[];
}
