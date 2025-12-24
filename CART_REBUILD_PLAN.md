# Cart Rebuild Plan - Unified Cart System

**Date:** 2025-12-07  
**Status:** Planning  
**Goal:** Rebuild cart to handle both subscriptions and Express Shop orders

---

## 🎯 Requirements

### Current State
- Cart only handles Express Shop products
- Uses `cart` table: `id`, `product_id`, `quantity`
- Cookie-based cart ID
- API: `/api/cart` (GET, POST, PUT, DELETE)

### Required State
- Unified cart for both:
  - **Express Shop products** (protein bars, granola, etc.)
  - **Meal plan subscriptions** (Weight Loss, Stay Fit, Muscle Gain)
- Single cart can contain both types simultaneously
- Unified checkout flow
- Unified pricing calculation

---

## 📊 Design

### Cart Schema

**Option 1: Single Table with Type Discriminator**
```sql
CREATE TABLE cart_items (
  id SERIAL PRIMARY KEY,
  cart_id VARCHAR(255) NOT NULL,  -- Cookie-based or user-based
  user_id INTEGER REFERENCES users(id),  -- If logged in
  item_type VARCHAR(20) NOT NULL,  -- 'product' | 'subscription'
  
  -- For Express Shop products
  product_id INTEGER REFERENCES products(id),
  
  -- For Meal Plan subscriptions
  plan_name VARCHAR(100),  -- 'Weight Loss' | 'Stay Fit' | 'Muscle Gain'
  meal_types TEXT[],  -- ['Breakfast', 'Lunch', 'Dinner']
  days_per_week INTEGER,  -- 5, 6, or 7
  duration_weeks INTEGER,  -- 1, 2, 4, 8, 12
  
  quantity INTEGER DEFAULT 1,
  unit_price NUMERIC(10,2),  -- Calculated price per unit
  total_price NUMERIC(10,2),  -- Total for this item
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CHECK (
    (item_type = 'product' AND product_id IS NOT NULL) OR
    (item_type = 'subscription' AND plan_name IS NOT NULL)
  )
);

CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_cart_items_type ON cart_items(item_type);
```

**Option 2: Separate Tables (Not Recommended)**
- More complex joins
- Harder to maintain
- Less flexible

**Decision:** ✅ Option 1 - Single table with type discriminator

---

### Cart Item Types

#### Express Shop Product
```typescript
{
  item_type: 'product',
  product_id: 123,
  quantity: 2,
  unit_price: 45.00,
  total_price: 90.00
}
```

#### Meal Plan Subscription
```typescript
{
  item_type: 'subscription',
  plan_name: 'Weight Loss',
  meal_types: ['Breakfast', 'Lunch', 'Dinner'],
  days_per_week: 6,
  duration_weeks: 4,
  quantity: 1,  // Always 1 for subscriptions
  unit_price: 450.00,  // Calculated via pricing API
  total_price: 450.00
}
```

---

## 🔧 Implementation Plan

### Phase 1: Database Schema
1. Create new `cart_items` table
2. Migrate existing cart data (if any)
3. Add indexes for performance

### Phase 2: Backend API
1. Update `/api/cart` to handle both types
2. Add subscription calculation on add
3. Update cart totals calculation
4. Handle cart merging (guest → logged in)

### Phase 3: Frontend State Management
1. Create unified cart context/hook
2. Update cart UI to show both types
3. Add subscription configuration UI
4. Update cart actions (add, update, remove)

### Phase 4: Checkout Integration
1. Update checkout to handle both types
2. Separate order creation for Express Shop
3. Separate subscription creation for meal plans
4. Unified payment flow

---

## 📝 API Design

### GET /api/cart
```typescript
Response: {
  items: Array<{
    id: number,
    item_type: 'product' | 'subscription',
    // Product fields
    product_id?: number,
    product_name?: string,
    product_image?: string,
    // Subscription fields
    plan_name?: string,
    meal_types?: string[],
    days_per_week?: number,
    duration_weeks?: number,
    // Common fields
    quantity: number,
    unit_price: number,
    total_price: number
  }>,
  subtotal: number,
  cartId: string
}
```

### POST /api/cart
```typescript
// Add Express Shop product
Request: {
  item_type: 'product',
  product_id: number,
  quantity: number
}

// Add Meal Plan subscription
Request: {
  item_type: 'subscription',
  plan_name: string,
  meal_types: string[],
  days_per_week: number,
  duration_weeks: number
}
```

### PUT /api/cart/[id]
```typescript
Request: {
  quantity?: number,  // For products
  // For subscriptions, update config
  meal_types?: string[],
  days_per_week?: number,
  duration_weeks?: number
}
```

### DELETE /api/cart/[id]
```typescript
// Remove item from cart
```

---

## 🎨 Frontend Design

### Cart Context
```typescript
interface CartContext {
  items: CartItem[],
  subtotal: number,
  addProduct: (productId: number, quantity: number) => Promise<void>,
  addSubscription: (config: SubscriptionConfig) => Promise<void>,
  updateItem: (id: number, updates: Partial<CartItem>) => Promise<void>,
  removeItem: (id: number) => Promise<void>,
  clearCart: () => Promise<void>,
  isLoading: boolean
}
```

### Cart UI Components
- `CartItemProduct` - Display Express Shop product
- `CartItemSubscription` - Display meal plan subscription
- `CartSummary` - Unified totals
- `AddSubscriptionForm` - Configure subscription before adding

---

## 🔄 Checkout Flow

### Unified Checkout Process
1. Customer reviews cart (both types)
2. Customer enters shipping/billing info
3. Customer selects payment method
4. **Express Shop items** → Create `order` + `order_items`
5. **Meal plan subscriptions** → Create `subscription` (status: "new")
6. Payment processing
7. Update payment status
8. Update subscription status to "active" (if payment confirmed)

---

## 📋 Migration Strategy

### Data Migration
1. Check for existing cart data
2. Migrate to new schema if needed
3. Preserve cart IDs (cookie-based)

### Backward Compatibility
1. Keep old API endpoints temporarily
2. Add new unified endpoints
3. Deprecate old endpoints after migration

---

## ✅ Success Criteria

- [ ] Cart can hold both products and subscriptions
- [ ] Cart totals calculate correctly for both types
- [ ] Checkout handles both types correctly
- [ ] Cart persists across sessions (cookie/user-based)
- [ ] Cart merges when guest logs in
- [ ] UI clearly distinguishes between types
- [ ] Performance is acceptable

---

**Status:** Ready for implementation  
**Priority:** High  
**Estimated Effort:** 2-3 days








