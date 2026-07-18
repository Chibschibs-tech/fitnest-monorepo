/**
 * @fitnest/core — framework-agnostic domain logic shared by the web app,
 * the future mobile app, and any background worker.
 *
 * Everything here is pure TypeScript with no Next.js, no DB, no framework
 * imports, so it runs identically in a Next route, an Expo app, and a Node
 * worker. Prices are computed here once, so no client can ever drift.
 */
export * from "./pricing-calculator"
export * from "./compose-pricing"