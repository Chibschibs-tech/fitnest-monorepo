/**
 * Test Admin Panel CRUD Operations
 * Tests all product management endpoints
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:3002'
const ADMIN_EMAIL = 'chihab@ekwip.ma'
const ADMIN_PASSWORD = 'FITnest123!'

let sessionCookie = ''

async function login() {
  console.log('🔐 Logging in...')
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    }),
  })

  if (!response.ok) {
    throw new Error(`Login failed: ${response.status}`)
  }

  const setCookie = response.headers.get('set-cookie')
  if (setCookie) {
    sessionCookie = setCookie.split(';')[0]
    console.log('✅ Login successful')
    return true
  }

  throw new Error('No session cookie received')
}

async function testEndpoint(method, url, body = null, description) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Cookie': sessionCookie,
    },
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(`${BASE_URL}${url}`, options)
    const data = await response.json()

    if (response.ok) {
      console.log(`✅ ${description}: ${response.status}`)
      return { success: true, data }
    } else {
      console.log(`❌ ${description}: ${response.status} - ${data.error || JSON.stringify(data)}`)
      return { success: false, error: data }
    }
  } catch (error) {
    console.log(`❌ ${description}: Error - ${error.message}`)
    return { success: false, error: error.message }
  }
}

async function runTests() {
  console.log('🧪 Starting Admin CRUD Tests\n')
  console.log('='.repeat(60))

  // Login
  await login()
  console.log('')

  const results = {
    passed: 0,
    failed: 0,
    tests: [],
  }

  // Test Meal Plans
  console.log('📋 Testing Meal Plans API')
  console.log('-'.repeat(60))
  
  const mealPlanTest = await testEndpoint(
    'POST',
    '/api/admin/products/meal-plans',
    {
      name: 'Test Meal Plan',
      description: 'Test description',
      category: 'balanced',
      published: true,
    },
    'Create Meal Plan'
  )
  results.tests.push({ name: 'Create Meal Plan', ...mealPlanTest })
  if (mealPlanTest.success) results.passed++
  else results.failed++

  const mealPlanId = mealPlanTest.success ? mealPlanTest.data.mealPlan?.id : null

  if (mealPlanId) {
    const updateTest = await testEndpoint(
      'PUT',
      `/api/admin/products/meal-plans/${mealPlanId}`,
      { name: 'Updated Meal Plan' },
      'Update Meal Plan'
    )
    results.tests.push({ name: 'Update Meal Plan', ...updateTest })
    if (updateTest.success) results.passed++
    else results.failed++

    const deleteTest = await testEndpoint(
      'DELETE',
      `/api/admin/products/meal-plans/${mealPlanId}`,
      null,
      'Delete Meal Plan'
    )
    results.tests.push({ name: 'Delete Meal Plan', ...deleteTest })
    if (deleteTest.success) results.passed++
    else results.failed++
  }

  console.log('')

  // Test Meals
  console.log('🍽️  Testing Meals API')
  console.log('-'.repeat(60))
  
  const mealTest = await testEndpoint(
    'POST',
    '/api/admin/products/meals',
    {
      name: 'Test Meal',
      description: 'Test meal description',
      calories: 500,
      protein: 30,
      carbs: 50,
      fat: 20,
    },
    'Create Meal'
  )
  results.tests.push({ name: 'Create Meal', ...mealTest })
  if (mealTest.success) results.passed++
  else results.failed++

  const mealId = mealTest.success ? mealTest.data.meal?.id : null

  if (mealId) {
    const updateTest = await testEndpoint(
      'PUT',
      `/api/admin/products/meals/${mealId}`,
      { name: 'Updated Meal' },
      'Update Meal'
    )
    results.tests.push({ name: 'Update Meal', ...updateTest })
    if (updateTest.success) results.passed++
    else results.failed++

    const deleteTest = await testEndpoint(
      'DELETE',
      `/api/admin/products/meals/${mealId}`,
      null,
      'Delete Meal'
    )
    results.tests.push({ name: 'Delete Meal', ...deleteTest })
    if (deleteTest.success) results.passed++
    else results.failed++
  }

  console.log('')

  // Test Snacks
  console.log('🍫 Testing Snacks API')
  console.log('-'.repeat(60))
  
  const snackTest = await testEndpoint(
    'POST',
    '/api/admin/products/snacks',
    {
      name: 'Test Snack',
      description: 'Test snack description',
      price: 25.0,
      category: 'snacks',
      stock_quantity: 10,
    },
    'Create Snack'
  )
  results.tests.push({ name: 'Create Snack', ...snackTest })
  if (snackTest.success) results.passed++
  else results.failed++

  const snackId = snackTest.success ? snackTest.data.snack?.id : null

  if (snackId) {
    const updateTest = await testEndpoint(
      'PUT',
      `/api/admin/products/snacks/${snackId}`,
      { name: 'Updated Snack' },
      'Update Snack'
    )
    results.tests.push({ name: 'Update Snack', ...updateTest })
    if (updateTest.success) results.passed++
    else results.failed++

    const deleteTest = await testEndpoint(
      'DELETE',
      `/api/admin/products/snacks/${snackId}`,
      null,
      'Delete Snack'
    )
    results.tests.push({ name: 'Delete Snack', ...deleteTest })
    if (deleteTest.success) results.passed++
    else results.failed++
  }

  console.log('')

  // Test Accessories
  console.log('🎒 Testing Accessories API')
  console.log('-'.repeat(60))
  
  const accessoryTest = await testEndpoint(
    'POST',
    '/api/admin/products/accessories',
    {
      name: 'Test Accessory',
      description: 'Test accessory description',
      price: 100.0,
      category: 'accessory',
      stock_quantity: 5,
    },
    'Create Accessory'
  )
  results.tests.push({ name: 'Create Accessory', ...accessoryTest })
  if (accessoryTest.success) results.passed++
  else results.failed++

  const accessoryId = accessoryTest.success ? accessoryTest.data.accessory?.id : null

  if (accessoryId) {
    const updateTest = await testEndpoint(
      'PUT',
      `/api/admin/products/accessories/${accessoryId}`,
      { name: 'Updated Accessory' },
      'Update Accessory'
    )
    results.tests.push({ name: 'Update Accessory', ...updateTest })
    if (updateTest.success) results.passed++
    else results.failed++

    const deleteTest = await testEndpoint(
      'DELETE',
      `/api/admin/products/accessories/${accessoryId}`,
      null,
      'Delete Accessory'
    )
    results.tests.push({ name: 'Delete Accessory', ...deleteTest })
    if (deleteTest.success) results.passed++
    else results.failed++
  }

  console.log('')
  console.log('='.repeat(60))
  console.log('📊 Test Results')
  console.log('='.repeat(60))
  console.log(`✅ Passed: ${results.passed}`)
  console.log(`❌ Failed: ${results.failed}`)
  console.log(`📈 Total: ${results.passed + results.failed}`)
  console.log('')

  if (results.failed === 0) {
    console.log('🎉 All tests passed!')
    process.exit(0)
  } else {
    console.log('⚠️  Some tests failed')
    process.exit(1)
  }
}

runTests().catch((error) => {
  console.error('❌ Test execution failed:', error)
  process.exit(1)
})





