// lib/customer-management.ts
import { sql } from "@/lib/db"

// Crée la table customers + index si absents (tout en 1 requête)
export async function initCustomersTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS customers (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      name TEXT,
      email TEXT,
      phone TEXT,
      status TEXT DEFAULT 'active',
      city TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
    CREATE INDEX IF NOT EXISTS idx_customers_city   ON customers(city);
  `;
}

// Utilitaire simple pour créer un profil client
export async function createCustomerProfile(params: {
  userId?: number | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
}) {
  const { userId = null, name = null, email = null, phone = null, city = null } = params || {};
  const rows = await sql`
    INSERT INTO customers (user_id, name, email, phone, city)
    VALUES (${userId}, ${name}, ${email}, ${phone}, ${city})
    RETURNING *;
  `;
  return rows[0] ?? null;
}
