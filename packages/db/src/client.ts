import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is not set");
}

// Force TLS for Supabase. (Even if sslmode param is missing, we enforce it.)
const pool = new pg.Pool({
  connectionString: url,
  ssl: { rejectUnauthorized: false }
});

pool.on("error", (err) => {
  console.error("❌ PG Pool error:", err.message);
});

export const db = drizzle(pool);
