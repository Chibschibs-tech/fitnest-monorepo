#!/usr/bin/env node
/**
 * Script to remove debug and test routes
 * This script safely removes debug/test API routes and pages
 */

import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, "..")

// Routes to remove
const DEBUG_ROUTES = [
  "apps/web/app/api/debug-waitlist-form",
  "apps/web/app/api/debug-waitlist-db",
  "apps/web/app/api/debug-sessions",
  "apps/web/app/api/debug-orders",
  "apps/web/app/api/debug-orders-table",
  "apps/web/app/api/debug-meals",
  "apps/web/app/api/debug-login",
  "apps/web/app/api/debug-full-cart",
  "apps/web/app/api/debug-dashboard",
  "apps/web/app/api/debug-current-waitlist",
  "apps/web/app/api/debug-cart",
  "apps/web/app/api/debug-cart-structure",
  "apps/web/app/api/debug-auth-status",
  "apps/web/app/api/debug-all-waitlist-data",
  "apps/web/app/api/admin/debug-products",
  "apps/web/app/api/admin/debug-database",
  "apps/web/app/api/test",
  "apps/web/app/api/test-waitlist-submission",
  "apps/web/app/api/test-waitlist-email",
  "apps/web/app/api/test-simple",
  "apps/web/app/api/test-gmail-direct",
  "apps/web/app/api/test-email",
  "apps/web/app/api/test-email-simple",
  "apps/web/app/api/test-direct-email",
  "apps/web/app/api/test-db",
  "apps/web/app/api/test-current-waitlist-form",
  "apps/web/app/api/test-auth",
  "apps/web/app/api/cart-debug",
  "apps/web/app/api/cart-debug-actions",
  "apps/web/app/api/cart-diagnostic",
  "apps/web/app/api/cart-simple-test",
  "apps/web/app/api/products-debug",
  "apps/web/app/api/products-diagnostic",
  "apps/web/app/api/products-check",
  "apps/web/app/api/check-cart-structure",
  "apps/web/app/api/check-cart-tables",
  "apps/web/app/api/check-middleware",
  "apps/web/app/api/check-plans",
  "apps/web/app/api/db-check",
  "apps/web/app/api/db-ping",
  "apps/web/app/api/db-schema",
  "apps/web/app/api/db-test",
  "apps/web/app/api/direct-db-check",
  "apps/web/app/api/schema-check",
  "apps/web/app/api/table-structure",
  "apps/web/app/api/system-diagnostic",
  "apps/web/app/api/complete-db-diagnostic",
  "apps/web/app/api/deployment-diagnostic",
  "apps/web/app/api/deployment-check",
  "apps/web/app/api/email-diagnostic",
  "apps/web/app/api/auth-debug",
  "apps/web/app/api/auth-health",
  "apps/web/app/api/diagnostic",
]

// Pages to remove
const DEBUG_PAGES = [
  "apps/web/app/test",
  "apps/web/app/test-page",
  "apps/web/app/api-test",
  "apps/web/app/cart-test",
  "apps/web/app/cart-fix",
  "apps/web/app/debug",
  "apps/web/app/debug-login-test",
  "apps/web/app/debug-meal-plan",
  "apps/web/app/debug-dashboard-api",
  "apps/web/app/deployment-test",
  "apps/web/app/email-test-simple",
  "apps/web/app/test-direct-email",
  "apps/web/app/test-waitlist-email",
  "apps/web/app/complete-diagnostic",
  "apps/web/app/fix-database",
  "apps/web/app/migration-control",
  "apps/web/app/clear-test-data",
  "apps/web/app/database-docs",
  "apps/web/app/database-visualization",
]

// Admin debug pages
const ADMIN_DEBUG_PAGES = [
  "apps/web/app/admin/auth-debug",
  "apps/web/app/admin/debug-database",
  "apps/web/app/admin/debug-products",
  "apps/web/app/admin/email-diagnostic",
  "apps/web/app/admin/system-diagnostic",
  "apps/web/app/admin/email-test",
]

async function removeDirectory(dirPath) {
  try {
    const fullPath = path.join(rootDir, dirPath)
    const stats = await fs.stat(fullPath)
    
    if (stats.isDirectory()) {
      await fs.rm(fullPath, { recursive: true, force: true })
      console.log(`✅ Removed: ${dirPath}`)
      return true
    }
  } catch (error) {
    if (error.code === "ENOENT") {
      console.log(`⚠️  Not found: ${dirPath}`)
    } else {
      console.error(`❌ Error removing ${dirPath}:`, error.message)
    }
  }
  return false
}

async function main() {
  console.log("🧹 Starting cleanup of debug/test routes and pages...\n")
  
  let removedCount = 0
  
  // Remove API routes
  console.log("📁 Removing debug/test API routes...")
  for (const route of DEBUG_ROUTES) {
    if (await removeDirectory(route)) {
      removedCount++
    }
  }
  
  // Remove pages
  console.log("\n📄 Removing debug/test pages...")
  for (const page of DEBUG_PAGES) {
    if (await removeDirectory(page)) {
      removedCount++
    }
  }
  
  // Remove admin debug pages
  console.log("\n🔧 Removing admin debug pages...")
  for (const page of ADMIN_DEBUG_PAGES) {
    if (await removeDirectory(page)) {
      removedCount++
    }
  }
  
  console.log(`\n✅ Cleanup complete! Removed ${removedCount} directories.`)
  console.log("\n⚠️  Next steps:")
  console.log("1. Update middleware.ts to remove debug routes from publicRoutes")
  console.log("2. Test the application")
  console.log("3. Run 'npm run docs:generate' to update documentation")
}

main().catch(console.error)


