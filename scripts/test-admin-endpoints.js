/**
 * Test Script for Admin Panel Fixes
 * Tests Express Shop CRUD and Orders API endpoints
 * 
 * Usage: node scripts/test-admin-endpoints.js
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3002'

// Test results
const results = {
  passed: [],
  failed: [],
  skipped: []
}

// Cookie storage for test requests
let sessionCookie = null

// Helper to login and get session cookie
async function loginAsAdmin() {
  try {
    const adminEmail = 'chihab@ekwip.ma'
    const adminPassword = 'FITnest123!'

    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: adminEmail,
        password: adminPassword
      }),
      redirect: 'manual' // Don't follow redirects
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Login failed: ${response.status} - ${errorText}`)
    }

    // Extract session cookie from Set-Cookie header
    const setCookie = response.headers.get('set-cookie')
    if (!setCookie) {
      throw new Error('No session cookie returned')
    }

    // Extract session-id from cookie string
    const sessionMatch = setCookie.match(/session-id=([^;]+)/)
    if (!sessionMatch) {
      throw new Error('Could not extract session-id from cookie')
    }

    sessionCookie = sessionMatch[1]
    return sessionCookie
  } catch (error) {
    console.error('Error logging in as admin:', error)
    return null
  }
}

// Test helper
async function test(name, testFn) {
  try {
    console.log(`\n🧪 Testing: ${name}`)
    await testFn()
    results.passed.push(name)
    console.log(`✅ PASSED: ${name}`)
  } catch (error) {
    results.failed.push({ name, error: error.message })
    console.error(`❌ FAILED: ${name}`)
    console.error(`   Error: ${error.message}`)
  }
}

// Test Express Shop CRUD
async function testExpressShopCRUD(sessionId) {
  const headers = {
    'Content-Type': 'application/json',
    'Cookie': `session-id=${sessionId}`,
    'credentials': 'include'
  }

  let createdProductId = null

  // Test GET - List products
  await test('Express Shop - GET /api/admin/products/express-shop', async () => {
    const response = await fetch(`${BASE_URL}/api/admin/products/express-shop`, {
      headers
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`)
    }

    const data = await response.json()
    if (!data.success) {
      throw new Error('Response missing success field')
    }
    if (!Array.isArray(data.products)) {
      throw new Error('Products is not an array')
    }
  })

  // Test POST - Create product
  await test('Express Shop - POST /api/admin/products/express-shop', async () => {
    const productData = {
      name: `Test Product ${Date.now()}`,
      description: 'Test product description',
      price: 99.99,
      sale_price: 79.99,
      category: 'test',
      stock_quantity: 10,
      is_available: true
    }

    const response = await fetch(`${BASE_URL}/api/admin/products/express-shop`, {
      method: 'POST',
      headers,
      body: JSON.stringify(productData)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    if (!data.success || !data.product) {
      throw new Error('Product creation failed')
    }

    createdProductId = data.product.id
    console.log(`   Created product ID: ${createdProductId}`)
  })

  // Test PUT - Update product
  if (createdProductId) {
    await test('Express Shop - PUT /api/admin/products/express-shop/[id]', async () => {
      const updateData = {
        name: `Updated Test Product ${Date.now()}`,
        price: 129.99
      }

      const response = await fetch(`${BASE_URL}/api/admin/products/express-shop/${createdProductId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      if (!data.success || !data.product) {
        throw new Error('Product update failed')
      }
      if (data.product.name !== updateData.name) {
        throw new Error('Product name not updated correctly')
      }
    })

    // Test DELETE - Delete product
    await test('Express Shop - DELETE /api/admin/products/express-shop/[id]', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/products/express-shop/${createdProductId}`, {
        method: 'DELETE',
        headers
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error('Product deletion failed')
      }
    })
  }
}

// Test Orders API
async function testOrdersAPI(sessionId) {
  const headers = {
    'Content-Type': 'application/json',
    'Cookie': `session-id=${sessionId}`,
    'credentials': 'include'
  }

  // Test GET - List orders
  await test('Orders - GET /api/admin/orders', async () => {
    const response = await fetch(`${BASE_URL}/api/admin/orders`, {
      headers
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`)
    }

    const data = await response.json()
    if (!data.success) {
      throw new Error('Response missing success field')
    }
    if (!Array.isArray(data.orders)) {
      throw new Error('Orders is not an array')
    }
  })

  // Test GET with status filter
  await test('Orders - GET /api/admin/orders?status=pending', async () => {
    const response = await fetch(`${BASE_URL}/api/admin/orders?status=pending`, {
      headers
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`)
    }

    const data = await response.json()
    if (!data.success || !Array.isArray(data.orders)) {
      throw new Error('Invalid response format')
    }
  })
}

// Test Authentication
async function testAuthentication() {
  // Test without session
  await test('Authentication - No session (should fail)', async () => {
    const response = await fetch(`${BASE_URL}/api/admin/products/express-shop`)
    
    if (response.ok) {
      throw new Error('Should have returned 401 Unauthorized')
    }
    if (response.status !== 401) {
      throw new Error(`Expected 401, got ${response.status}`)
    }
  })

  // Test with invalid session
  await test('Authentication - Invalid session (should fail)', async () => {
    const response = await fetch(`${BASE_URL}/api/admin/products/express-shop`, {
      headers: {
        'Cookie': 'session-id=invalid-session-id'
      }
    })

    if (response.ok) {
      throw new Error('Should have returned 401 or 403')
    }
    if (response.status !== 401 && response.status !== 403) {
      throw new Error(`Expected 401 or 403, got ${response.status}`)
    }
  })
}

// Test Error Handling
async function testErrorHandling(sessionId) {
  const headers = {
    'Content-Type': 'application/json',
    'Cookie': `session-id=${sessionId}`,
    'credentials': 'include'
  }

  // Test validation error
  await test('Error Handling - Validation error', async () => {
    const response = await fetch(`${BASE_URL}/api/admin/products/express-shop`, {
      method: 'POST',
      headers,
      body: JSON.stringify({}) // Missing required fields
    })

    if (response.ok) {
      throw new Error('Should have returned 400 Bad Request')
    }
    if (response.status !== 400) {
      throw new Error(`Expected 400, got ${response.status}`)
    }

    const data = await response.json()
    if (!data.error) {
      throw new Error('Error response missing error field')
    }
  })

  // Test not found error
  await test('Error Handling - Not found error', async () => {
    const response = await fetch(`${BASE_URL}/api/admin/products/express-shop/999999`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ name: 'Test' })
    })

    if (response.ok) {
      throw new Error('Should have returned 404 Not Found')
    }
    if (response.status !== 404) {
      throw new Error(`Expected 404, got ${response.status}`)
    }
  })
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Admin Panel Fixes Tests')
  console.log(`📍 Base URL: ${BASE_URL}`)
  console.log(`📅 ${new Date().toISOString()}`)

  // Login as admin
  console.log('\n🔐 Logging in as admin...')
  const sessionId = await loginAsAdmin()
  
  if (!sessionId) {
    console.error('❌ Failed to login as admin. Cannot run tests.')
    console.error('   Make sure the dev server is running and admin user exists.')
    process.exit(1)
  }

  console.log(`✅ Logged in as admin. Session ID: ${sessionId.substring(0, 20)}...`)

  // Run tests
  await testAuthentication()
  await testExpressShopCRUD(sessionId)
  await testOrdersAPI(sessionId)
  await testErrorHandling(sessionId)

  // Print summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 TEST SUMMARY')
  console.log('='.repeat(60))
  console.log(`✅ Passed: ${results.passed.length}`)
  console.log(`❌ Failed: ${results.failed.length}`)
  console.log(`⏭️  Skipped: ${results.skipped.length}`)

  if (results.passed.length > 0) {
    console.log('\n✅ Passed Tests:')
    results.passed.forEach(name => console.log(`   - ${name}`))
  }

  if (results.failed.length > 0) {
    console.log('\n❌ Failed Tests:')
    results.failed.forEach(({ name, error }) => {
      console.log(`   - ${name}`)
      console.log(`     Error: ${error}`)
    })
  }

  console.log('\n' + '='.repeat(60))

  // Exit with appropriate code
  process.exit(results.failed.length > 0 ? 1 : 0)
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})

