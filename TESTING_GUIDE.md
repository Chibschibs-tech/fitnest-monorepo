# Testing Guide - Admin Panel Fixes

**Date:** December 8, 2025  
**Purpose:** Manual and automated testing for Priority 2 & 3 fixes

---

## Prerequisites

1. **Development Server Running**
   ```bash
   pnpm dev
   # Server should be running on http://localhost:3002
   ```

2. **Database Connected**
   - Local: `docker-compose up -d`
   - Or connected to production database

3. **Admin User Exists**
   - Email: `chihab@ekwip.ma`
   - Password: `FITnest123!`
   - Role: `admin`

---

## Manual Testing

### 1. Express Shop CRUD Testing

#### Test 1: List Products
1. Navigate to: http://localhost:3002/admin/products/express-shop
2. Login as admin if prompted
3. **Expected:** Products list should display
4. **Check:** No errors in console

#### Test 2: Create Product
1. Click "Add New Product" button
2. Fill in form:
   - Name: "Test Product"
   - Price: 99.99
   - Category: "test"
   - Stock: 10
3. Click "Create Product"
4. **Expected:** 
   - Modal closes
   - Product appears in list
   - Success message (if implemented)
5. **Check:** Product saved in database

#### Test 3: Edit Product
1. Click "Edit" button on any product
2. Change name to "Updated Test Product"
3. Change price to 129.99
4. Click "Update Product"
5. **Expected:**
   - Modal closes
   - Product updated in list
   - Changes reflected immediately
6. **Check:** Database updated correctly

#### Test 4: Delete Product
1. Click "Delete" button on a test product
2. Confirm deletion in dialog
3. **Expected:**
   - Dialog closes
   - Product removed from list (or marked inactive)
4. **Check:** Product `isactive` set to `false` in database

---

### 2. Orders API Testing

#### Test 1: List Orders
1. Navigate to: http://localhost:3002/admin/orders/orders
2. **Expected:** Orders list displays
3. **Check:** 
   - Orders have customer names
   - Orders have correct totals
   - Status filters work

#### Test 2: View Single Order
1. Click on an order to view details
2. **Expected:** Order details page shows:
   - Order information
   - Order items
   - Customer information
3. **Check:** All data loads correctly

#### Test 3: Update Order Status
1. Open an order
2. Change status (e.g., pending → active)
3. Save changes
4. **Expected:** Status updates successfully
5. **Check:** Database reflects new status

---

### 3. Authentication Testing

#### Test 1: Unauthorized Access
1. Open browser in incognito/private mode
2. Navigate to: http://localhost:3002/admin/products/express-shop
3. **Expected:** Redirected to login or 401 error
4. **Check:** Cannot access admin routes without auth

#### Test 2: Non-Admin User
1. Login as regular customer
2. Try to access: http://localhost:3002/admin/products/express-shop
3. **Expected:** 403 Forbidden error
4. **Check:** Only admin users can access

---

### 4. Error Handling Testing

#### Test 1: Validation Errors
1. Try to create product without name
2. **Expected:** Error message displayed
3. **Check:** Error format is consistent

#### Test 2: Not Found Errors
1. Try to edit product with ID 999999
2. **Expected:** 404 Not Found error
3. **Check:** Error message is user-friendly

#### Test 3: Database Errors
1. Disconnect database (stop Docker)
2. Try to list products
3. **Expected:** Error message displayed
4. **Check:** Error doesn't crash the app

---

## Automated Testing

### Using Test Script

```bash
# Set environment variables
$env:DATABASE_URL="your-database-url"
$env:TEST_BASE_URL="http://localhost:3002"

# Run tests
node scripts/test-admin-endpoints.js
```

### Test Script Coverage

- ✅ Express Shop GET (list products)
- ✅ Express Shop POST (create product)
- ✅ Express Shop PUT (update product)
- ✅ Express Shop DELETE (delete product)
- ✅ Orders GET (list orders)
- ✅ Orders GET with filter
- ✅ Authentication (no session)
- ✅ Authentication (invalid session)
- ✅ Error handling (validation)
- ✅ Error handling (not found)

---

## API Testing with curl/Postman

### Express Shop - Create Product

```bash
# First, login to get session cookie
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"chihab@ekwip.ma","password":"FITnest123!"}' \
  -c cookies.txt

# Then create product
curl -X POST http://localhost:3002/api/admin/products/express-shop \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Test Product",
    "description": "Test description",
    "price": 99.99,
    "category": "test",
    "stock_quantity": 10,
    "is_available": true
  }'
```

### Orders - List Orders

```bash
curl -X GET http://localhost:3002/api/admin/orders \
  -b cookies.txt
```

### Orders - Update Status

```bash
curl -X PUT http://localhost:3002/api/admin/orders/1/status \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"status": "active"}'
```

---

## Browser Console Testing

Open browser DevTools console and run:

```javascript
// Test Express Shop - List
fetch('/api/admin/products/express-shop', {
  credentials: 'include'
})
.then(r => r.json())
.then(console.log)

// Test Express Shop - Create
fetch('/api/admin/products/express-shop', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    name: 'Test Product',
    price: 99.99,
    category: 'test'
  })
})
.then(r => r.json())
.then(console.log)
```

---

## Expected Results

### Success Criteria

- ✅ All CRUD operations work
- ✅ Authentication blocks unauthorized access
- ✅ Error messages are consistent
- ✅ Database queries use correct schema
- ✅ No console errors
- ✅ No TypeScript errors
- ✅ No linting errors

### Known Issues

(To be filled during testing)

---

## Test Results Template

```
Test Date: [Date]
Tester: [Name]
Environment: [Local/Production]

Express Shop CRUD:
- [ ] List products: PASS/FAIL
- [ ] Create product: PASS/FAIL
- [ ] Edit product: PASS/FAIL
- [ ] Delete product: PASS/FAIL

Orders API:
- [ ] List orders: PASS/FAIL
- [ ] View order: PASS/FAIL
- [ ] Update order: PASS/FAIL

Authentication:
- [ ] Unauthorized blocked: PASS/FAIL
- [ ] Admin access works: PASS/FAIL

Error Handling:
- [ ] Validation errors: PASS/FAIL
- [ ] Not found errors: PASS/FAIL
```

---

**Next:** Run tests and document results







