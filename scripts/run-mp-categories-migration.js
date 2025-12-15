#!/usr/bin/env node

/**
 * Script to run the MP Categories migration
 * Usage: node scripts/run-mp-categories-migration.js
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3002'

async function runMigration() {
  try {
    console.log('🚀 Starting MP Categories migration...')
    console.log(`📍 Target: ${BASE_URL}/api/admin/migrate-to-mp-categories`)
    
    // First, we need to login to get a session cookie
    console.log('\n📝 Step 1: Logging in as admin...')
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'chihab@ekwip.ma',
        password: 'FITnest123!',
      }),
    })

    if (!loginResponse.ok) {
      const loginError = await loginResponse.text()
      throw new Error(`Login failed: ${loginError}`)
    }

    // Get session cookie
    const cookies = loginResponse.headers.get('set-cookie')
    if (!cookies) {
      throw new Error('No session cookie received')
    }

    const sessionCookie = cookies.split(';')[0]
    console.log('✅ Login successful')

    // Run migration
    console.log('\n📝 Step 2: Running migration...')
    const migrationResponse = await fetch(`${BASE_URL}/api/admin/migrate-to-mp-categories`, {
      method: 'POST',
      headers: {
        'Cookie': sessionCookie,
        'Content-Type': 'application/json',
      },
    })

    const result = await migrationResponse.json()

    if (migrationResponse.ok && result.success) {
      console.log('\n✅ Migration completed successfully!')
      console.log(`   - Categories created/verified: ${result.categoriesCreated}`)
      console.log(`   - Meal plans migrated: ${result.mealPlansMigrated}`)
      console.log('\n🎉 All done! You can now use MP Categories in the admin panel.')
    } else {
      console.error('\n❌ Migration failed:')
      console.error(result.error || 'Unknown error')
      process.exit(1)
    }
  } catch (error) {
    console.error('\n❌ Error running migration:')
    console.error(error.message)
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Make sure the development server is running on port 3002')
    }
    process.exit(1)
  }
}

runMigration()




