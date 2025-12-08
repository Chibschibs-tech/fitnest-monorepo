# Cart Rebuild - Test Plan

**Date:** 2025-12-07  
**Status:** Ready for Testing  
**Goal:** Verify unified cart system works correctly

---

## ✅ Implementation Complete

### Database
- ✅ `cart_items` table schema created
- ✅ Table initialization route: `/api/cart/init-table`
- ✅ Indexes created for performance
- ✅ Triggers for auto-updating timestamps

### Backend API
- ✅ `/api/cart` (GET) - Retrieves both products and subscriptions
- ✅ `/api/cart` (POST) - Adds products or subscriptions
- ✅ `/api/cart` (PUT) - Updates items (quantity for products, config for subscriptions)
- ✅ `/api/cart` (DELETE) - Removes items
- ✅ `/api/cart/count` - Updated to use `cart_items`
- ✅ `/api/cart/clear` - Updated to use `cart_items`

### Frontend
- ✅ Cart page updated to use `cart_items` table
- ✅ Cart content component handles both types
- ✅ Product items display correctly
- ✅ Subscription items display correctly

---

## 🧪 Test Cases

### 1. Database Setup
**Test:** Initialize cart_items table
```bash
# Visit: http://localhost:3002/api/cart/init-table
# Expected: {"success": true, "message": "cart_items table created successfully"}
```

**Verify:**
- Table exists in database
- Indexes created
- Triggers created

---

### 2. Add Express Shop Product
**Test:** Add a product to cart
```javascript
POST /api/cart
{
  "item_type": "product",
  "product_id": 1,
  "quantity": 2
}
```

**Expected:**
- Returns `{"success": true, "message": "Item added to cart"}`
- Cart cookie set
- Item appears in GET /api/cart

**Verify:**
- Product details correct
- Price calculated correctly
- Quantity correct

---

### 3. Add Meal Plan Subscription
**Test:** Add a subscription to cart
```javascript
POST /api/cart
{
  "item_type": "subscription",
  "plan_name": "Weight Loss",
  "meal_types": ["Breakfast", "Lunch", "Dinner"],
  "days_per_week": 6,
  "duration_weeks": 4
}
```

**Expected:**
- Returns `{"success": true, "message": "Item added to cart"}`
- Price calculated using pricing API
- Item appears in GET /api/cart

**Verify:**
- Subscription details correct
- Price calculated correctly (with discounts)
- Configuration saved correctly

---

### 4. Mixed Cart (Products + Subscriptions)
**Test:** Add both types to same cart
1. Add product
2. Add subscription
3. Get cart

**Expected:**
- Both items in cart
- Subtotal includes both
- Items display correctly

**Verify:**
- Cart contains both types
- Totals calculated correctly
- UI displays both types

---

### 5. Update Product Quantity
**Test:** Update product quantity
```javascript
PUT /api/cart
{
  "item_id": 1,
  "quantity": 3
}
```

**Expected:**
- Quantity updated
- Total price recalculated
- Cart reflects changes

---

### 6. Update Subscription Config
**Test:** Update subscription configuration
```javascript
PUT /api/cart
{
  "item_id": 2,
  "days_per_week": 7,
  "duration_weeks": 8
}
```

**Expected:**
- Configuration updated
- Price recalculated (with new discounts)
- Cart reflects changes

---

### 7. Remove Item
**Test:** Remove item from cart
```javascript
DELETE /api/cart?id=1
```

**Expected:**
- Item removed
- Cart updated
- Totals recalculated

---

### 8. Cart Count
**Test:** Get cart item count
```javascript
GET /api/cart/count
```

**Expected:**
- Returns total quantity of all items
- Includes both products and subscriptions

---

### 9. Clear Cart
**Test:** Clear all items
```javascript
POST /api/cart/clear
```

**Expected:**
- All items removed
- Cart empty
- Count returns 0

---

### 10. Cart Persistence
**Test:** Cart persists across sessions
1. Add items to cart
2. Close browser
3. Reopen browser
4. Visit cart page

**Expected:**
- Cart items still present
- Cookie preserved
- Items display correctly

---

### 11. Duplicate Product Handling
**Test:** Add same product twice
1. Add product ID 1, quantity 2
2. Add product ID 1, quantity 3

**Expected:**
- Quantities merged (total: 5)
- Single item in cart
- Price recalculated

---

### 12. Duplicate Subscription Handling
**Test:** Add same subscription config twice
1. Add subscription (Weight Loss, 6 days, 4 weeks)
2. Add same subscription again

**Expected:**
- Error: "This subscription configuration is already in your cart"
- Only one subscription in cart

---

### 13. Frontend Display
**Test:** Visual verification
1. Visit `/cart` page
2. Add products and subscriptions
3. Verify display

**Expected:**
- Products show image, name, price, quantity controls
- Subscriptions show plan name, meal types, duration
- Both types clearly distinguished
- Totals correct
- Checkout button works

---

### 14. Checkout Integration
**Test:** Proceed to checkout with mixed cart
1. Add products and subscriptions
2. Click "Proceed to Checkout"
3. Verify checkout receives both types

**Expected:**
- Checkout page loads
- Both types displayed
- Totals correct
- Can complete checkout

---

## 🐛 Known Issues / Edge Cases

### To Test:
- [ ] Empty cart handling
- [ ] Invalid product ID
- [ ] Invalid subscription config
- [ ] Missing pricing data
- [ ] Large quantities
- [ ] Special characters in plan names
- [ ] Concurrent cart updates
- [ ] Cart with logged-in user (user_id)

---

## 📋 Test Checklist

- [ ] Database table created
- [ ] Add product works
- [ ] Add subscription works
- [ ] Mixed cart works
- [ ] Update product works
- [ ] Update subscription works
- [ ] Remove item works
- [ ] Cart count works
- [ ] Clear cart works
- [ ] Cart persists
- [ ] Duplicate handling works
- [ ] Frontend displays correctly
- [ ] Checkout integration works

---

## 🚀 Next Steps After Testing

1. Fix any bugs found
2. Optimize performance if needed
3. Add error handling improvements
4. Review subscription creation flow
5. Update checkout to handle both types

---

**Status:** Ready for Testing  
**Priority:** High  
**Estimated Test Time:** 30-45 minutes

