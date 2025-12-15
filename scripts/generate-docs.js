#!/usr/bin/env node
/**
 * Automated Documentation Generator
 * Updates documentation automatically based on code changes
 */

import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, "..")

// Documentation structure
const DOCS_DIR = path.join(rootDir, "docs")
const API_DOCS_DIR = path.join(DOCS_DIR, "api")
const DATABASE_DOCS_DIR = path.join(DOCS_DIR, "database")

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true })
  } catch (error) {
    // Directory might already exist
  }
}

async function scanAPIRoutes() {
  const apiDir = path.join(rootDir, "apps/web/app/api")
  const routes = []

  async function scanDir(dir, prefix = "") {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        const routePath = path.join(prefix, entry.name)
        
        if (entry.isDirectory()) {
          // Skip node_modules and other non-route directories
          if (!entry.name.startsWith("_") && entry.name !== "node_modules") {
            await scanDir(fullPath, routePath)
          }
        } else if (entry.name === "route.ts" || entry.name === "route.tsx") {
          const content = await fs.readFile(fullPath, "utf-8")
          const methods = []
          
          if (content.includes("export async function GET")) methods.push("GET")
          if (content.includes("export async function POST")) methods.push("POST")
          if (content.includes("export async function PUT")) methods.push("PUT")
          if (content.includes("export async function DELETE")) methods.push("DELETE")
          if (content.includes("export async function PATCH")) methods.push("PATCH")
          
          routes.push({
            path: `/api${routePath.replace(/\\/g, "/").replace(/\/route\.tsx?$/, "")}`,
            methods,
            file: fullPath.replace(rootDir, ""),
          })
        }
      }
    } catch (error) {
      // Directory might not exist
    }
  }

  await scanDir(apiDir)
  return routes.sort((a, b) => a.path.localeCompare(b.path))
}

async function generateAPIDocs() {
  console.log("📝 Generating API documentation...")
  
  await ensureDir(API_DOCS_DIR)
  
  const routes = await scanAPIRoutes()
  const publicRoutes = routes.filter(r => !r.path.includes("/admin") && !r.path.includes("/debug"))
  const adminRoutes = routes.filter(r => r.path.includes("/admin") && !r.path.includes("/debug"))
  const debugRoutes = routes.filter(r => r.path.includes("/debug") || r.path.includes("/test"))
  
  const doc = `# API Documentation

**Last Updated:** ${new Date().toISOString()}
**Total Routes:** ${routes.length}

## Overview

This document is automatically generated from the codebase. It lists all API routes available in the FitNest application.

## Public API Routes (${publicRoutes.length})

${publicRoutes.map(r => `### ${r.path}
- **Methods:** ${r.methods.join(", ") || "N/A"}
- **File:** \`${r.file}\`
`).join("\n")}

## Admin API Routes (${adminRoutes.length})

${adminRoutes.map(r => `### ${r.path}
- **Methods:** ${r.methods.join(", ") || "N/A"}
- **File:** \`${r.file}\`
`).join("\n")}

## Debug/Test Routes (${debugRoutes.length})

⚠️ **These routes should be removed or protected in production**

${debugRoutes.map(r => `### ${r.path}
- **Methods:** ${r.methods.join(", ") || "N/A"}
- **File:** \`${r.file}\`
`).join("\n")}

---

*This documentation is auto-generated. Do not edit manually.*
`

  await fs.writeFile(path.join(API_DOCS_DIR, "routes.md"), doc)
  console.log("✅ API documentation generated")
}

async function generateDatabaseDocs() {
  console.log("📝 Generating database documentation...")
  
  await ensureDir(DATABASE_DOCS_DIR)
  
  // Read Drizzle schema
  const schemaPath = path.join(rootDir, "packages/db/src/schema.ts")
  let schemaContent = ""
  
  try {
    schemaContent = await fs.readFile(schemaPath, "utf-8")
  } catch (error) {
    console.warn("⚠️  Could not read schema file")
  }
  
  const doc = `# Database Schema Documentation

**Last Updated:** ${new Date().toISOString()}

## Schema Source

The database schema is defined in \`packages/db/src/schema.ts\` using Drizzle ORM.

## Tables

${extractTablesFromSchema(schemaContent)}

## Notes

- This documentation is auto-generated
- For production schema, check the actual database
- Migration files are in \`packages/db/migrations/\`

---

*This documentation is auto-generated. Do not edit manually.*
`

  await fs.writeFile(path.join(DATABASE_DOCS_DIR, "schema.md"), doc)
  console.log("✅ Database documentation generated")
}

function extractTablesFromSchema(content) {
  const tableMatches = content.matchAll(/export const (\w+) = pgTable\("(\w+)"[^}]+}/g)
  const tables = []
  
  for (const match of tableMatches) {
    tables.push({
      name: match[2],
      variable: match[1],
    })
  }
  
  if (tables.length === 0) {
    return "No tables found in schema file."
  }
  
  return tables.map(t => `### ${t.name}
- **Variable:** \`${t.variable}\`
`).join("\n")
}

async function generateMainDocs() {
  console.log("📝 Generating main documentation index...")
  
  const doc = `# FitNest Technical Documentation

**Last Updated:** ${new Date().toISOString()}

## Documentation Index

### [API Documentation](./api/routes.md)
Complete list of all API routes with methods and file locations.

### [Database Documentation](./database/schema.md)
Database schema documentation and table structures.

### [Project Audit](./../PROJECT_AUDIT.md)
Comprehensive project audit and analysis.

### [Cleanup Plan](./../CLEANUP_PLAN.md)
Detailed cleanup and restructuring plan.

## Quick Links

- **Admin Panel:** http://localhost:3002/admin
- **API Base:** http://localhost:3002/api
- **Database:** PostgreSQL (Docker on port 5433)

## Auto-Generated

This documentation is automatically updated. Run \`node scripts/generate-docs.js\` to regenerate.

---

*Last generated: ${new Date().toISOString()}*
`

  await fs.writeFile(path.join(DOCS_DIR, "README.md"), doc)
  console.log("✅ Main documentation index generated")
}

async function main() {
  console.log("🚀 Starting documentation generation...\n")
  
  await ensureDir(DOCS_DIR)
  await generateAPIDocs()
  await generateDatabaseDocs()
  await generateMainDocs()
  
  console.log("\n✅ Documentation generation complete!")
}

main().catch(console.error)







