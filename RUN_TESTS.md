# Run Tests - Admin Panel Fixes

**Date:** December 8, 2025

---

## Prerequisites

1. **Start Development Server**
   ```bash
   pnpm dev
   ```
   Server should be running on http://localhost:3002

2. **Verify Database Connection**
   - Local: `docker-compose up -d`
   - Or ensure DATABASE_URL is set

---

## Quick Test (Browser)

1. **Open Browser**: http://localhost:3002/admin/products/express-shop
2. **Login**: chihab@ekwip.ma / FITnest123!
3. **Test Create**: Click "Add New Product", fill form, submit
4. **Test Edit**: Click Edit on a product, modify, save
5. **Test Delete**: Click Delete, confirm
6. **Check**: All operations work without errors

---

## Automated Test Scripts

### PowerShell Test (Windows)
```powershell
.\scripts\test-admin-simple.ps1
```

### Node.js Test
```bash
node scripts/test-admin-endpoints.js
```

---

## Manual API Tests (Browser Console)

Open DevTools (F12) and run:

```javascript
// Test 1: List Products
fetch('/api/admin/products/express-shop', { credentials: 'include' })
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);

// Test 2: Create Product
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
  .catch(console.error);

// Test 3: List Orders
fetch('/api/admin/orders', { credentials: 'include' })
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

---

## Expected Results

✅ All endpoints return `{ success: true, ... }`  
✅ Authentication blocks unauthorized access  
✅ CRUD operations complete successfully  
✅ No console errors

---

**Ready to test!** Start the dev server first: `pnpm dev`



