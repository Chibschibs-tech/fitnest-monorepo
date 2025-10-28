// lib/db.ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

// Lazy init pour éviter toute connexion pendant le build
let _client: ReturnType<typeof neon> | null = null;

function getClient() {
  if (_client) return _client;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is missing");
  _client = neon(url);
  return _client;
}

/**
 * Tag sql compatible avec Drizzle (template tag) + méthodes utilitaires.
 * On forwarde .query/.array/.transaction du client Neon, sans toucher au top-level.
 */
export const sql: any = ((...args: any[]) => (getClient() as any)(...args)) as any;
(sql as any).query = (...args: any[]) => (getClient() as any).query(...args);
(sql as any).array = (...args: any[]) => (getClient() as any).array?.(...args);
(sql as any).transaction = (...args: any[]) => (getClient() as any).transaction?.(...args);

// Drizzle reçoit la fonction tag (aucun appel DB au top-level)
export const db = drizzle(sql);

// Helper pratique: retourne directement rows
export async function q<T = any>(text: string, params?: any[]) {
  const { rows } = await (sql as any).query(text, params ?? []);
  return rows as T[];
}
