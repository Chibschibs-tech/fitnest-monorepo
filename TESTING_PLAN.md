# Testing Plan - Cart & Subscription System

**Date:** 2025-12-07  
**Status:** Ready for Testing

---

## 🧪 Test Sequence

### Phase 1: Database Setup ✅

1. **Initialize Cart Table**
   - **Action:** Visit `http://localhost:3002/api/cart/setup`
   - **Expected:** Table created or already exists message
   - **Verify:** Check database for `cart_items` table

---

### Phase 2: Cart API Testing

#### 2.1 Add Product to Cart
```bash
POST http://localhost:3002/api/cart
Content-Type: application/json

{
  "item_type": "product",
  "product_id": 1,
  "quantity": 2
}
```
**Expected:**
- Success response
- Cart ID cookie set
- Item added to cart_items table

#### 2.2 Add Subscription to Cart
```bash
POST http://localhost:3002/api/cart
Content-Type: application/json

{
  "item_type": "subscription",
  "plan_name": "Weight Loss",
  "meal_types": ["Breakfast", "Lunch", "Dinner"],
  "days_per_week": 6,
  "duration_weeks": 4
}
```
**Expected:**
- Success response
- Price calculated correctly
- Subscription item added to cart

#### 2.3 Get Cart
```bash
GET http://localhost:3002/api/cart
```
**Expected:**
- Returns both product and subscription items
- Correct subtotal calculation
- Cart ID returned

#### 2.4 Update Cart Item
```bash
PUT http://localhost:3002/api/cart
Content-Type: application/json

{
  "item_id": 1,
  "quantity": 3
}
```
**Expected:**
- Quantity updated
- Total price recalculated

#### 2.5 Remove Cart Item
```bash
DELETE http://localhost:3002/api/cart?id=1
```
**Expected:**
- Item removed from cart
- Cart still contains other items

---

### Phase 3: Frontend Testing

#### 3.1 Cart Page Display
- **Action:** Visit `http://localhost:3002/cart`
- **Expected:**
  - Products display with image, name, price
  - Subscriptions display with plan name, meal types, duration
  - Correct totals displayed
  - Both types visible simultaneously

#### 3.2 Add to Cart from Express Shop
- **Action:** Browse Express Shop, add product
- **Expected:**
  - Product added to cart
  - Cart icon updates
  - Cart page shows product

#### 3.3 Add Subscription from Meal Plans
- **Action:** Select meal plan, configure, add to cart
- **Expected:**
  - Subscription added to cart
  - Price calculated correctly
  - Cart page shows subscription

---

### Phase 4: Checkout Flow Testing

#### 4.1 Checkout with Products Only
- **Action:**
  1. Add product to cart
  2. Go to checkout
  3. Fill form
  4. Submit
- **Expected:**
  - Order created in `orders` table
  - Order items created in `order_items` table
  - Cart cleared
  - Redirect to confirmation

#### 4.2 Checkout with Subscription Only
- **Action:**
  1. Add subscription to cart
  2. Go to checkout
  3. Fill form
  4. Submit
- **Expected:**
  - Subscription created in `subscriptions` table
  - Status: "new" (in notes)
  - Cart cleared
  - Redirect to confirmation

#### 4.3 Checkout with Both
- **Action:**
  1. Add product AND subscription to cart
  2. Go to checkout
  3. Fill form
  4. Submit
- **Expected:**
  - Order created for products
  - Subscription created for meal plan
  - Both cleared from cart
  - Redirect to confirmation

---

### Phase 5: Edge Cases

#### 5.1 Empty Cart Checkout
- **Expected:** Error message, cannot proceed

#### 5.2 Invalid Product ID
- **Expected:** Error message, item not added

#### 5.3 Invalid Subscription Config
- **Expected:** Error message, validation fails

#### 5.4 Cart Persistence
- **Action:** Close browser, reopen
- **Expected:** Cart items still present (cookie-based)

---

## ✅ Success Criteria

- [ ] Cart table initialized
- [ ] Products can be added to cart
- [ ] Subscriptions can be added to cart
- [ ] Cart displays both types correctly
- [ ] Cart totals calculate correctly
- [ ] Checkout creates orders for products
- [ ] Checkout creates subscriptions (status: "new")
- [ ] Checkout handles mixed cart
- [ ] Cart clears after checkout
- [ ] No errors in console
- [ ] Database records created correctly

---

## 🐛 Known Issues to Watch

1. **Drizzle Schema:** Subscription status "new" not in enum
   - **Workaround:** Using "active" + notes field
   - **Impact:** Low (tracked in notes)

2. **Old Cart Table:** May still exist
   - **Impact:** None (new system uses cart_items)

3. **Payment Status:** Tracked in notes
   - **Impact:** Low (will be separate table later)

---

## 📊 Test Results

**Status:** ⏳ Pending  
**Date:** 2025-12-07  
**Tester:** TBD

---

**Next:** Run tests and document results

