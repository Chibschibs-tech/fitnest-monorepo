#!/usr/bin/env node
/**
 * Export actual database schema
 */

import { neon } from "@neondatabase/serverless"
import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env" })

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, "..")

async function exportSchema() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error("DATABASE_URL not found")
    process.exit(1)
  }

  const sql = neon(databaseUrl)

  try {
    // Get all tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `

    let schemaDoc = `# Production Database Schema

**Last Updated:** ${new Date().toISOString()}
**Source:** Actual database schema

## Tables (${tables.length})

`

    for (const table of tables) {
      const tableName = table.table_name
      
      // Get columns
      const columns = await sql`
        SELECT 
          column_name,
          data_type,
          character_maximum_length,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = ${tableName}
        ORDER BY ordinal_position
      `

      // Get constraints
      const constraints = await sql`
        SELECT
          constraint_name,
          constraint_type
        FROM information_schema.table_constraints
        WHERE table_schema = 'public'
        AND table_name = ${tableName}
      `

      schemaDoc += `### ${tableName}\n\n`
      schemaDoc += `**Columns:**\n\n`
      schemaDoc += `| Column | Type | Nullable | Default |\n`
      schemaDoc += `|--------|------|----------|---------|\n`
      
      for (const col of columns) {
        const type = col.character_maximum_length 
          ? `${col.data_type}(${col.character_maximum_length})`
          : col.data_type
        schemaDoc += `| ${col.column_name} | ${type} | ${col.is_nullable} | ${col.column_default || ''} |\n`
      }

      if (constraints.length > 0) {
        schemaDoc += `\n**Constraints:**\n\n`
        for (const constraint of constraints) {
          schemaDoc += `- ${constraint.constraint_type}: ${constraint.constraint_name}\n`
        }
      }

      schemaDoc += `\n`
    }

    // Save to file
    const docsDir = path.join(rootDir, "docs", "database")
    await fs.mkdir(docsDir, { recursive: true })
    await fs.writeFile(path.join(docsDir, "PRODUCTION_SCHEMA.md"), schemaDoc)
    
    console.log("✅ Database schema exported to docs/database/PRODUCTION_SCHEMA.md")
  } catch (error) {
    console.error("❌ Error exporting schema:", error)
    process.exit(1)
  }
}

exportSchema()








