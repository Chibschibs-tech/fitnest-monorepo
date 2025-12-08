# Subscription Creation Flow - Review

**Date:** 2025-12-07  
**Status:** Review Complete - Issues Found  
**Goal:** Review and fix subscription creation after checkout

---

## 🔍 Current State Analysis

### 1. Order Creation Route (`/api/orders/create`)

**Current Behavior:**
- ✅ Creates user (if doesn't exist)
- ✅ Fetches cart items from **old `cart` table** (line 94-104)
- ✅ Creates `order` record
- ✅ Creates `order_items` for Express Shop products
- ❌ **Does NOT create subscriptions**
- ❌ Uses old `cart` table instead of `cart_items`
- ❌ Clears old `cart` table (line 236)

**Issues Found:**
1. **Uses old cart table:** Still queries `cart` instead of `cart_items`
2. **No subscription creation:** Only handles Express Shop products
3. **No subscription status:** Doesn't create subscription records
4. **Cart clearing:** Uses old `cart` table

---

### 2. Checkout Route (`/api/checkout`)

**Current Behavior:**
- Inserts into `subscription_requests` table (legacy)
- Uses Supabase (old database connection)
- Not integrated with new cart system

**Status:** ⚠️ Legacy route, not used in new flow

---

### 3. Subscription Schema (Bootstrap)

**Tables:**
- `subscriptions` table exists in bootstrap schema:
  ```sql
  subscriptions (
    id, user_id, plan_id, status, 
    current_period_start, current_period_end, created_at
  )
  ```

**Issues:**
- Schema uses `plan_id` (references `plans` table)
- But cart uses `plan_name` (Weight Loss, Stay Fit, Muscle Gain)
- Need to map `plan_name` → `plan_id` or update schema

---

## 🎯 Required Changes

### 1. Update `/api/orders/create` Route

**Changes Needed:**

#### A. Use `cart_items` Table
```typescript
// OLD (line 94-104)
const items = await sql`
  SELECT c.product_id, c.quantity, p.name, p.price, p.saleprice
  FROM cart c
  JOIN products p ON c.product_id = p.id
  WHERE c.id = ${cartId}
`

// NEW
const cartItems = await sql`
  SELECT 
    ci.id, ci.item_type, ci.quantity, ci.unit_price, ci.total_price,
    ci.product_id, ci.plan_name, ci.meal_types, ci.days_per_week, ci.duration_weeks,
    p.name as product_name, p.price as product_price, p.saleprice as product_sale_price
  FROM cart_items ci
  LEFT JOIN products p ON ci.product_id = p.id AND ci.item_type = 'product'
  WHERE ci.cart_id = ${cartId}
`
```

#### B. Separate Products and Subscriptions
```typescript
const products = cartItems.filter(item => item.item_type === 'product')
const subscriptions = cartItems.filter(item => item.item_type === 'subscription')
```

#### C. Create Orders for Products
```typescript
// Existing logic for Express Shop products
if (products.length > 0) {
  // Create order
  // Create order_items
}
```

#### D. Create Subscriptions (NEW)
```typescript
// Create subscriptions for meal plans
if (subscriptions.length > 0) {
  for (const sub of subscriptions) {
    // Map plan_name to plan_id
    const planId = await getPlanIdFromName(sub.plan_name)
    
    // Create subscription with status "new"
    await sql`
      INSERT INTO subscriptions (
        user_id, plan_id, status, 
        current_period_start, current_period_end, created_at
      )
      VALUES (
        ${userId},
        ${planId},
        'new',  -- Status starts as "new"
        ${calculateStartDate()},
        ${calculateEndDate(sub.duration_weeks)},
        NOW()
      )
    `
  }
}
```

#### E. Update Cart Clearing
```typescript
// OLD (line 236)
await sql`DELETE FROM cart WHERE id = ${cartId}`

// NEW
await sql`DELETE FROM cart_items WHERE cart_id = ${cartId}`
```

---

### 2. Plan Name to Plan ID Mapping

**Issue:** Cart uses `plan_name` (string), but subscriptions table uses `plan_id` (integer)

**Solutions:**

**Option A: Create mapping function**
```typescript
async function getPlanIdFromName(planName: string): Promise<number> {
  const mapping: Record<string, number> = {
    'Weight Loss': 1,
    'Stay Fit': 2,
    'Muscle Gain': 3,
  }
  
  // Check if plan exists in database
  const plan = await sql`
    SELECT id FROM plans WHERE name = ${planName}
  `
  
  if (plan.length > 0) {
    return plan[0].id
  }
  
  // Fallback to mapping
  return mapping[planName] || 1
}
```

**Option B: Update subscriptions schema to use plan_name**
- More flexible
- Requires schema change

**Recommendation:** Option A (mapping function) - less disruptive

---

### 3. Payment Status Tracking

**Requirement:** Separate payment status from subscription status

**Current Schema:**
- `subscriptions.status` - subscription lifecycle status

**Needed:**
- Payment status table or column

**Options:**

**Option A: Add payment_status column**
```sql
ALTER TABLE subscriptions 
ADD COLUMN payment_status VARCHAR(20) DEFAULT 'pending';
-- Values: 'pending', 'confirmed', 'failed', 'refunded'
```

**Option B: Separate payments table**
```sql
CREATE TABLE subscription_payments (
  id SERIAL PRIMARY KEY,
  subscription_id INTEGER REFERENCES subscriptions(id),
  status VARCHAR(20) DEFAULT 'pending',
  amount NUMERIC(10,2),
  payment_method VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
)
```

**Recommendation:** Option A (simpler, sufficient for now)

---

## 📋 Implementation Plan

### Phase 1: Update Order Creation Route
1. ✅ Update to use `cart_items` table
2. ✅ Separate products and subscriptions
3. ✅ Create subscriptions with status "new"
4. ✅ Update cart clearing
5. ✅ Add plan name to plan_id mapping

### Phase 2: Payment Status
1. ✅ Add `payment_status` column to subscriptions
2. ✅ Update subscription creation to set `payment_status = 'pending'`
3. ✅ Create API endpoint to update payment status

### Phase 3: Testing
1. ✅ Test order creation with products only
2. ✅ Test subscription creation with subscriptions only
3. ✅ Test mixed cart (products + subscriptions)
4. ✅ Test payment status updates

---

## 🔧 Code Changes Required

### File: `apps/web/app/api/orders/create/route.ts`

**Changes:**
1. Replace `cart` table queries with `cart_items`
2. Filter items by `item_type`
3. Create subscriptions for subscription items
4. Update cart clearing
5. Add plan name mapping

**Estimated Lines Changed:** ~100 lines

---

## ✅ Success Criteria

- [ ] Order creation uses `cart_items` table
- [ ] Subscriptions created automatically after checkout
- [ ] Subscription status starts as "new"
- [ ] Payment status tracked separately
- [ ] Mixed cart (products + subscriptions) works
- [ ] Cart cleared correctly after checkout

---

**Status:** Review Complete  
**Priority:** High  
**Next:** Implement changes to `/api/orders/create`

