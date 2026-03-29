// lib/db.ts
// Universal database client — supports Supabase (pooler), Neon, and local PostgreSQL
import { Pool } from "pg";

let _pool: Pool | null = null;

function isBuildTime(): boolean {
  return (
    process.env.NEXT_PHASE === "phase-production-build" ||
    (process.env.VERCEL === "1" && !process.env.DATABASE_URL)
  );
}

function getPool(): Pool | null {
  if (_pool) return _pool;

  const url = process.env.DATABASE_URL;
  if (!url) {
    if (isBuildTime()) {
      console.warn("DATABASE_URL is missing — stub client for build time");
      return null;
    }
    if (process.env.NODE_ENV === "production") {
      throw new Error("DATABASE_URL is missing");
    }
    console.warn("DATABASE_URL is missing — stub client");
    return null;
  }

  _pool = new Pool({
    connectionString: url,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: url.includes("supabase.com") || url.includes("neon.tech")
      ? { rejectUnauthorized: false }
      : undefined,
  });

  return _pool;
}

/**
 * SQL template tag — converts tagged template to parameterized query.
 * Returns rows array directly for easy destructuring.
 *
 * Usage: const users = await sql`SELECT * FROM users WHERE id = ${id}`;
 */
export const sql: any = ((strings: TemplateStringsArray, ...values: any[]) => {
  const pool = getPool();
  if (!pool) return Promise.resolve([]);

  let queryText = strings[0];
  const params: any[] = [];

  for (let i = 0; i < values.length; i++) {
    params.push(values[i]);
    queryText += `$${params.length}` + (strings[i + 1] || "");
  }

  return pool.query(queryText, params).then((result) => result.rows || []);
}) as any;

/**
 * Explicit query method for dynamic SQL strings.
 * Returns { rows: [...] } for compatibility with existing code.
 */
(sql as any).query = async (text: string, params?: any[]) => {
  const pool = getPool();
  if (!pool) return { rows: [] };
  const result = await pool.query(text, params);
  return { rows: result.rows };
};

/**
 * Transaction helper — runs a callback inside a Postgres transaction.
 */
(sql as any).transaction = async (fn: (client: any) => Promise<any>) => {
  const pool = getPool();
  if (!pool) throw new Error("No database connection");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Helper: run a query and return rows directly.
 */
export async function q<T = any>(text: string, params?: any[]): Promise<T[]> {
  const result = await (sql as any).query(text, params);
  return (result.rows || result) as T[];
}

export const mealPreferences = null as any;
export const notificationPreferences = null as any;
