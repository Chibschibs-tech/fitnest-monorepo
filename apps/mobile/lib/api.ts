// Thin client for FitNest's public JSON API. The app renders what the server
// returns and prices with @fitnest/core — it never invents money or catalog.
import Constants from "expo-constants";
import type { ComposeComponent, ComposeSettings } from "@fitnest/core";

const BASE_URL: string =
  (Constants.expoConfig?.extra?.apiBaseUrl as string) ?? "https://www.fitnest.ma";

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`GET ${path} failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

export interface ComposeCatalog {
  success: boolean;
  components: ComposeComponent[];
  settings: ComposeSettings[];
}

/** Public builder catalog + rules (admin-editable, never hardcoded). */
export function fetchComposeCatalog(): Promise<ComposeCatalog> {
  return getJson<ComposeCatalog>("/api/compose");
}

export { BASE_URL };
