# Architecture Clarification - FitNest

**Date:** 2025-12-07  
**Status:** ✅ Clarified  
**Purpose:** Document clarified architecture based on user guidance

---

## 🎯 Key Clarifications

### 1. Pricing System ✅

**Decision:** Database-driven pricing is the correct approach

**Active System:**
- **Primary:** Database-driven (`/api/calculate-price`, `/api/admin/pricing/calculate`)
- **Tables:** `meal_type_prices`, `discount_rules`
- **Logic:** Prices and discounts stored in database for flexibility

**Legacy System:**
- `apps/web/lib/pricing-model.ts` - Hardcoded pricing (can be deprecated/removed)
- Used for frontend calculations but database is source of truth

**Action Items:**
- ✅ Created missing `apps/web/lib/pricing-calculator.ts` file
- ⚠️ Consider deprecating `pricing-model.ts` or document its role
- ✅ Database-driven system is now complete

---

### 2. Payment Integration ✅

**Current Status:** Not implemented

**Planned Payment Methods:**
1. **COD (Cash on Delivery)** - Primary method
2. **Wire Transfer** - Bank transfer
3. **Credit Card via Berexia** - To be integrated when Berexia details available

**Action Items:**
- ⚠️ Clean up existing Stripe references (if any)
- 📋 Plan payment method selection in checkout
- 📋 Design payment status tracking in orders
- 📋 Prepare for Berexia integration (structure, not implementation)

---

### 3. Subscriptions vs Orders ✅

**Clarified Architecture:**

#### **Subscriptions** (Meal Plan Subscriptions)
- **Purpose:** Recurring meal plan deliveries
- **Database:** `subscriptions` table (Drizzle schema)
- **Relationship:** `subscriptions` → `deliveries`
- **Example:** Customer subscribes to "Weight Loss" plan for 4 weeks

#### **Orders** (Express Shop - One-time Purchases)
- **Purpose:** One-time product purchases (protein bars, granola, etc.)
- **Database:** `orders` table (Bootstrap schema)
- **Relationship:** `orders` → `order_items` → `deliveries`
- **Example:** Customer buys 3 protein bars, 2 granola packs

#### **Deliveries** (Delivery Instances)
- **Within Subscriptions:** Delivery instances for meal plan subscriptions
  - Example: 1-week subscription with 48h delivery = 3 deliveries
  - Each delivery is an "order" within the subscription context
- **Within Express Shop Orders:** Delivery for one-time purchases
  - Example: Order of protein bars = 1 delivery

**Key Insight:**
- **Subscriptions** = Recurring meal plans (subscription model)
- **Orders** = One-time Express Shop purchases (e-commerce model)
- **Deliveries** = Physical delivery instances (can be from subscriptions OR orders)

**Database Schema:**
```
subscriptions (meal plans)
  └─> deliveries (delivery instances)

orders (express shop)
  └─> order_items
  └─> deliveries (delivery instances)
```

---

### 4. Database Schema ✅

**Source of Truth:** Bootstrap schema (`apps/web/app/api/admin/bootstrap/route.ts`) - This is the developed schema

**Bootstrap Schema Includes:**
- ✅ `users` (with `password` column)
- ✅ `meal_plans`
- ✅ `meals`
- ✅ `meal_plan_meals`
- ✅ `products` (Express Shop items)
- ✅ `orders` (Express Shop orders)
- ✅ `order_items`
- ✅ `deliveries` (for orders)
- ✅ `subscriptions` (meal plan subscriptions)
- ✅ `plans` & `plan_prices`
- ✅ `waitlist`
- ✅ `notification_preferences`
- ✅ `meal_preferences`

**Additional Tables (from SQL scripts):**
- ✅ `meal_type_prices` (pricing system) - from `create-pricing-tables.sql`
- ✅ `discount_rules` (pricing system) - from `create-pricing-tables.sql`
- ✅ `cart` or `cart_items` (cart system) - various init scripts

**Note:** Drizzle schema (`packages/db/src/schema.ts`) is minimal and only includes meal plan subscription tables. Bootstrap schema is the complete, developed schema.

**Action Items:**
- ✅ Understood - Bootstrap schema is source of truth
- 📋 Document complete bootstrap schema

---

### 5. Missing File ✅

**Issue:** `apps/web/lib/pricing-calculator.ts` was imported but didn't exist

**Solution:** ✅ Created the file with:
- `calculateSubscriptionPrice()` function
- `MealPrice` and `DiscountRule` interfaces
- `PricingResult` interface
- Validation function

**Status:** ✅ Fixed

---

## 📊 Architecture Summary

### Data Flow

#### Meal Plan Subscription Flow:
```
Customer selects meal plan
  → Calculate price (database-driven)
  → Customer completes checkout
  → Subscription created automatically (status: "new")
  → Payment confirmation
  → Payment status updated (separate from subscription status)
  → Subscription status → "active"
  → Deliveries created manually by admin (when meals ready)
  → Admin updates delivery status to "Ready for delivery"
```

#### Express Shop Order Flow:
```
Customer adds products to cart
  → Checkout
  → Create order record
  → Create order_items
  → Create delivery for order
```

### Database Relationships

**Subscriptions (Meal Plans):**
```
users
  └─> subscriptions (meal plan subscriptions)
      └─> deliveries (delivery instances)
```

**Orders (Express Shop):**
```
users
  └─> orders (one-time purchases)
      └─> order_items (line items)
      └─> deliveries (delivery instances)
```

**Pricing:**
```
meal_type_prices (base prices per plan/meal type)
discount_rules (discount configurations)
```

---

## 🎯 Updated Understanding

### Mastery Level: ~90% (up from 85%)

**Newly Clarified:**
- ✅ Pricing system architecture (database-driven)
- ✅ Payment status (not implemented, planned)
- ✅ Subscription vs Orders distinction
- ✅ Delivery relationship to both
- ✅ Missing file created

**Clarified (Updated):**
- ✅ Database schema source of truth (Bootstrap schema)
- ✅ Subscription creation flow (automatic after checkout, status "new")
- ✅ Payment status tracking (separate from subscription status)
- ✅ Delivery generation (manual, admin updates status)

**Still Need to Implement:**
- ⚠️ Unified cart system (rebuild from scratch)
- ⚠️ Payment status tracking (needs implementation)
- ⚠️ Subscription status management (needs review)

---

## 📋 Action Plan

### Immediate Actions:
1. ✅ Create missing `pricing-calculator.ts`
2. 📋 Document pricing system architecture
3. 📋 Plan payment method structure
4. 📋 Update Drizzle schema with missing tables

### Next Steps:
1. Review frontend component architecture
2. Understand state management patterns
3. Document business logic edge cases
4. Reach 90%+ mastery

---

**Status:** Architecture clarified, ready for next phase  
**Blockers Removed:** Pricing confusion, subscription/order confusion  
**Next:** Continue exploration to reach 90%+ mastery

