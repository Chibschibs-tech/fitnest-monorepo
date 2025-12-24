#!/usr/bin/env node

/**
 * Script to test creating a meal plan with MP Category
 * Usage: node scripts/test-create-meal-plan.js
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3002'

async function testCreateMealPlan() {
  try {
    console.log('🧪 Testing Meal Plan Creation with MP Categories...')
    console.log(`📍 Target: ${BASE_URL}`)
    
    // Step 1: Login
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

    const cookies = loginResponse.headers.get('set-cookie')
    if (!cookies) {
      throw new Error('No session cookie received')
    }

    const sessionCookie = cookies.split(';')[0]
    console.log('✅ Login successful')

    // Step 2: Check if categories exist, if not run migration
    console.log('\n📝 Step 2: Checking MP Categories...')
    const categoriesResponse = await fetch(`${BASE_URL}/api/admin/mp-categories`, {
      headers: {
        'Cookie': sessionCookie,
      },
    })

    let categories = []
    if (categoriesResponse.ok) {
      const categoriesData = await categoriesResponse.json()
      categories = categoriesData.categories || []
      console.log(`✅ Found ${categories.length} categories`)
    } else {
      console.log('⚠️  No categories found, running migration...')
      const migrationResponse = await fetch(`${BASE_URL}/api/admin/migrate-to-mp-categories`, {
        method: 'POST',
        headers: {
          'Cookie': sessionCookie,
          'Content-Type': 'application/json',
        },
      })

      const migrationResult = await migrationResponse.json()
      if (migrationResponse.ok && migrationResult.success) {
        console.log('✅ Migration completed')
        // Fetch categories again
        const categoriesResponse2 = await fetch(`${BASE_URL}/api/admin/mp-categories`, {
          headers: {
            'Cookie': sessionCookie,
          },
        })
        const categoriesData2 = await categoriesResponse2.json()
        categories = categoriesData2.categories || []
      } else {
        throw new Error('Migration failed: ' + (migrationResult.error || 'Unknown error'))
      }
    }

    if (categories.length === 0) {
      throw new Error('No categories available. Please create categories first.')
    }

    // Use the first category
    const category = categories[0]
    console.log(`✅ Using category: ${category.name} (ID: ${category.id})`)

    // Step 3: Create a test meal plan
    console.log('\n📝 Step 3: Creating test meal plan...')
    const testMealPlan = {
      name: 'Test Meal Plan - ' + new Date().toISOString().split('T')[0],
      description: 'This is a test meal plan created to verify MP Categories integration',
      mp_category_id: category.id,
      published: true,
    }

    console.log('📦 Meal Plan Data:', JSON.stringify(testMealPlan, null, 2))

    const createResponse = await fetch(`${BASE_URL}/api/admin/products/meal-plans`, {
      method: 'POST',
      headers: {
        'Cookie': sessionCookie,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMealPlan),
    })

    const result = await createResponse.json()

    if (createResponse.ok && result.success) {
      console.log('\n✅ Meal Plan Created Successfully!')
      console.log('\n📋 Meal Plan Details:')
      console.log(`   ID: ${result.mealPlan.id}`)
      console.log(`   Name: ${result.mealPlan.name}`)
      console.log(`   Description: ${result.mealPlan.description}`)
      console.log(`   Category: ${result.mealPlan.category}`)
      console.log(`   MP Category ID: ${result.mealPlan.mp_category_id}`)
      console.log(`   Status: ${result.mealPlan.is_available ? 'Available' : 'Unavailable'}`)
      console.log('\n🎉 Test completed successfully!')
      console.log(`\n💡 View it in admin panel: ${BASE_URL}/admin/products/meal-plans`)
    } else {
      console.error('\n❌ Failed to create meal plan:')
      console.error(result.error || 'Unknown error')
      process.exit(1)
    }
  } catch (error) {
    console.error('\n❌ Error:')
    console.error(error.message)
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Make sure the development server is running:')
      console.error('   cd apps/web && pnpm dev')
    }
    process.exit(1)
  }
}

testCreateMealPlan()





