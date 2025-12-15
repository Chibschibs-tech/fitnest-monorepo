# Quick Test Checklist - Admin Panel Fixes

**Date:** December 8, 2025  
**Quick manual testing guide**

---

## ✅ Pre-Test Setup

1. **Start Dev Server**
   ```bash
   pnpm dev
   ```
   Server should be running on http://localhost:3002

2. **Verify Admin User**
   - Email: `chihab@ekwip.ma`
   - Password: `FITnest123!`
   - Access: http://localhost:3002/admin

---

## 🧪 Quick Tests (5 minutes)

### Test 1: Express Shop - List Products ✅
- [ ] Navigate to: http://localhost:3002/admin/products/express-shop
- [ ] Login if prompted
- [ ] **Expected:** Products list displays without errors
- [ ] **Check:** Browser console has no errors

### Test 2: Express Shop - Create Product ✅
- [ ] Click "Add New Product" button
- [ ] Fill form: Name="Test", Price=99.99, Category="test"
- [ ] Click "Create Product"
- [ ] **Expected:** Product appears in list
- [ ] **Check:** Product saved in database

### Test 3: Express Shop - Edit Product ✅
- [ ] Click "Edit" on any product
- [ ] Change name to "Updated Test"
- [ ] Click "Update Product"
- [ ] **Expected:** Product name updates in list
- [ ] **Check:** Database reflects changes

### Test 4: Express Shop - Delete Product ✅
- [ ] Click "Delete" on a test product
- [ ] Confirm deletion
- [ ] **Expected:** Product removed from list
- [ ] **Check:** Product `isactive = false` in database

### Test 5: Orders - List Orders ✅
- [ ] Navigate to: http://localhost:3002/admin/orders/orders
- [ ] **Expected:** Orders list displays
- [ ] **Check:** Customer names and totals show correctly

### Test 6: Authentication - Unauthorized ✅
- [ ] Open incognito window
- [ ] Navigate to: http://localhost:3002/admin/products/express-shop
- [ ] **Expected:** Redirected to login or 401 error
- [ ] **Check:** Cannot access without auth

---

## 🔍 Detailed API Tests

### Using Browser Console

Open DevTools (F12) and run:

```javascript
// Test 1: List Products
fetch('/api/admin/products/express-shop', { credentials: 'include' })
  .then(r => r.json())
  .then(data => {
    console.log('✅ Products:', data);
    if (!data.success) throw new Error('Missing success field');
  })
  .catch(e => console.error('❌ Error:', e));

// Test 2: Create Product
fetch('/api/admin/products/express-shop', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    name: 'Console Test Product',
    price: 49.99,
    category: 'test'
  })
})
  .then(r => r.json())
  .then(data => {
    console.log('✅ Created:', data);
    if (!data.success) throw new Error('Creation failed');
  })
  .catch(e => console.error('❌ Error:', e));

// Test 3: List Orders
fetch('/api/admin/orders', { credentials: 'include' })
  .then(r => r.json())
  .then(data => {
    console.log('✅ Orders:', data);
    if (!data.success) throw new Error('Missing success field');
  })
  .catch(e => console.error('❌ Error:', e));
```

---

## 📊 Expected Results

### Success Indicators
- ✅ All CRUD operations complete without errors
- ✅ Authentication blocks unauthorized access
- ✅ Error messages are consistent and helpful
- ✅ Database queries return correct data
- ✅ No console errors or warnings
- ✅ UI updates reflect changes immediately

### Failure Indicators
- ❌ 401/403 errors when logged in as admin
- ❌ 500 errors on valid requests
- ❌ Database errors in console
- ❌ UI doesn't update after operations
- ❌ Modal forms don't submit
- ❌ Products/orders don't appear in lists

---

## 🐛 Common Issues & Fixes

### Issue: "Unauthorized" when logged in
**Fix:** Check session cookie is set correctly

### Issue: Products not appearing
**Fix:** Check database connection and `isactive` column

### Issue: Edit/Delete buttons don't work
**Fix:** Check browser console for JavaScript errors

### Issue: 500 errors on create/update
**Fix:** Check database schema matches (lowercase columns)

---

## ✅ Test Completion

After running all tests:
- [ ] All tests pass
- [ ] No console errors
- [ ] Database reflects all changes
- [ ] Ready for production deployment

**Status:** ⏳ Ready to test






