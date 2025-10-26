import { createClient } from "@supabase/supabase-js";

// Admin/server: prefer service role if available; otherwise anon (for local dev).
const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL; // fallback if you name it differently
if (!url) throw new Error("SUPABASE URL env missing");

const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!key) throw new Error("SUPABASE key env missing");

// Single client for server usage
export const supabase = createClient(url, key, {
  auth: { persistSession: false },
});
