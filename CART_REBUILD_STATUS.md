# Cart Rebuild Status

**Date:** 2025-12-07  
**Status:** ✅ Implementation Complete, Testing Required

---

## ✅ Completed

### 1. Cart API Implementation
- ✅ `/api/cart` route supports both products and subscriptions
- ✅ GET endpoint returns unified cart items
- ✅ POST endpoint adds products or subscriptions
- ✅ PUT endpoint updates items
- ✅ DELETE endpoint removes items
- ✅ Pricing calculation for subscriptions integrated

### 2. Database Schema
- ✅ `cart_items` table structure defined
- ✅ Supports both `product` and `subscription` item types
- ✅ Includes all necessary fields (plan_name, meal_types, days_per_week, duration_weeks)
- ✅ Setup endpoint created: `/api/cart/setup`

### 3. Frontend Implementation
- ✅ `cart-content.tsx` displays both product and subscription items
- ✅ `cart/page.tsx` fetches from unified cart_items table
- ✅ UI distinguishes between product and subscription items

---

## ⚠️ Needs Work

### 1. Order Creation Route
**Issue:** `/api/orders/create` still uses old `cart` table instead of `cart_items`

**Current:**
- Queries old `cart` table
- Only handles Express Shop products
- Doesn't create subscriptions from cart

**Required:**
- Query `cart_items` table
- Handle both products and subscriptions
- Create subscriptions with status "new"
- Create orders for Express Shop items

**Action:** Update `/api/orders/create/route.ts`

---

### 2. Subscription Creation
**Issue:** No endpoint to create subscriptions from cart after checkout

**Created:**
- ✅ `/api/subscriptions/create` endpoint
- Creates subscription with status "new"
- Handles payment status separately

**Needs:**
- Integration with checkout flow
- Update Drizzle schema to allow "new" status (or use notes field)
- Payment status tracking

---

### 3. Database Schema Update
**Issue:** Drizzle schema only allows: "active" | "paused" | "canceled" | "expired"

**Options:**
1. Update Drizzle schema to include "new" status
2. Use notes field to track "new" status
3. Create separate payment_status field

**Recommendation:** Update Drizzle schema to include "new" status

---

## 📋 Next Steps

1. **Initialize cart_items table**
   - Call `/api/cart/setup` to ensure table exists
   - Verify structure

2. **Update order creation**
   - Modify `/api/orders/create` to use `cart_items`
   - Handle subscriptions from cart
   - Create subscriptions with status "new"

3. **Update Drizzle schema**
   - Add "new" to subscription status enum
   - Create migration

4. **Test cart system**
   - Add product to cart
   - Add subscription to cart
   - Verify both appear in cart
   - Test checkout flow

5. **Test subscription creation**
   - Complete checkout with subscription
   - Verify subscription created with status "new"
   - Verify payment status tracking

---

## 🧪 Testing Checklist

- [ ] Cart table initialized
- [ ] Add product to cart works
- [ ] Add subscription to cart works
- [ ] Cart displays both types correctly
- [ ] Update cart item works
- [ ] Remove cart item works
- [ ] Checkout with products creates order
- [ ] Checkout with subscriptions creates subscription (status: "new")
- [ ] Checkout with both creates order + subscription
- [ ] Payment status tracked separately

---

**Status:** Ready for testing and integration  
**Priority:** High  
**Blockers:** None








