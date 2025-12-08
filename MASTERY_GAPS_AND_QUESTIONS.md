# Mastery Gaps & Questions for 90%+ Understanding

**Date:** 2025-12-07  
**Current Mastery:** ~80%  
**Target:** 90%+  
**Purpose:** Identify areas needing clarification before structural changes

---

## 🔍 Areas Explored

### ✅ Well Understood (85-95%)
- Project structure and architecture
- Database schema (core tables)
- Authentication system (custom JWT)
- Error handling patterns
- Recent cleanup work
- Naming conventions

### ⚠️ Partially Understood (70-80%)
- Pricing engine (multiple implementations)
- Order/subscription flows
- API routes structure
- Frontend component organization

### ❓ Needs Clarification (50-60%)
- Frontend state management
- Payment integration status
- Subscription lifecycle management
- Delivery scheduling algorithms
- Multiple pricing systems
- Database schema inconsistencies

---

## ❓ Critical Questions

### 1. Pricing System Confusion

**Issue:** Found TWO different pricing implementations:

**A. `apps/web/lib/pricing-model.ts`**
- Uses: `MealSelection` interface
- Base prices: mainMeal 40 MAD, breakfast 30 MAD, snack 15 MAD
- Plan multipliers: stay-fit (0.95), weight-loss (1.0), muscle-gain (1.15)
- Volume discounts: Based on total items (6-13: 0%, 14-20: 5%, etc.)
- Duration discounts: 1 week (0%), 2 weeks (5%), 4 weeks (10%)
- Validation: Minimum days based on subscription weeks

**B. `apps/web/app/api/calculate-price/route.ts`**
- Uses: `meal_type_prices` table (database-driven)
- Base prices: Weight Loss (Breakfast 45, Lunch 55, Dinner 50)
- Discounts: From `discount_rules` table
- Days-based discounts: 5 days (3%), 6 days (5%), 7 days (7%)
- Duration discounts: 2 weeks (5%), 4 weeks (10%), 8 weeks (15%), 12 weeks (20%)

**Questions:**
1. Which pricing system is currently active in production?
2. Are both systems used for different purposes?
3. Which one should be used for new orders?
4. What's the relationship between `pricing-model.ts` and `pricing-calculator.ts`?
5. Are the base prices in `pricing-model.ts` outdated or still valid?

---

### 2. Payment Integration Status

**Findings:**
- Stripe is in `package.json` dependencies (`@stripe/stripe-js`, `stripe`)
- No active payment processing found in order creation
- Order creation doesn't handle payment confirmation
- Checkout flow creates orders without payment verification

**Questions:**
1. Is payment processing currently implemented or planned?
2. Is Stripe integrated but not yet activated?
3. Are orders created without payment (COD - Cash on Delivery)?
4. What's the payment flow for subscriptions?
5. How are subscription renewals billed?

---

### 3. Subscription vs Orders Confusion

**Findings:**
- `orders` table exists with `plan_id`, `status`, `delivery_date`
- `subscriptions` table exists (from Drizzle schema)
- Order creation creates an `order` record, not a `subscription`
- Subscription pause/resume routes exist but return placeholder responses
- No clear subscription creation flow found

**Questions:**
1. What's the relationship between `orders` and `subscriptions`?
2. When does an order become a subscription?
3. Are subscriptions created automatically after order payment?
4. How are subscription renewals handled?
5. What's the difference between order status and subscription status?

---

### 4. Delivery Scheduling Algorithm

**Findings:**
- `DeliveryService.generateDeliverySchedule()` exists
- Delivery dates generated based on `selected_days` and `selected_weeks`
- Delivery generation happens via admin API (`/api/admin/generate-deliveries`)
- No automatic delivery generation on order creation

**Questions:**
1. When are deliveries automatically generated?
2. Is there a cron job or scheduled task for delivery generation?
3. How are delivery dates calculated for custom day selections?
4. What happens when a delivery is missed or delayed?
5. How are delivery schedules updated when subscriptions are paused/resumed?

---

### 5. Frontend State Management

**Findings:**
- No global state management library found (no Redux, Zustand, Recoil)
- Components use React hooks (`useState`, `useEffect`)
- Cart state seems to be managed via cookies/API calls
- No clear state management pattern identified

**Questions:**
1. How is cart state persisted? (Cookies, localStorage, API?)
2. Is there a context provider for global state?
3. How is user session state managed on the frontend?
4. Are there any state synchronization issues between components?
5. Should we implement a state management solution?

---

### 6. Database Schema Inconsistencies

**Findings:**
- Drizzle schema defines: `users`, `meals`, `meal_plans`, `plan_variants`, `meal_plan_meals`, `subscriptions`, `deliveries`
- Bootstrap schema creates: `users`, `meal_plans`, `meals`, `products`, `orders`, `order_items`, `deliveries`, `waitlist`, `plans`, `plan_prices`, `subscriptions`
- Production schema may differ from both
- `users` table has `password` column (not in initial Drizzle schema)

**Questions:**
1. Which schema is the source of truth for production?
2. Are both schemas merged in production?
3. What's the actual production database structure?
4. Should we align Drizzle schema with production?
5. Are there migration scripts to sync schemas?

---

### 7. Cart Management

**Findings:**
- Cart stored in database (`cart` table)
- Cart ID stored in cookies
- Multiple cart APIs: `/api/cart`, `/api/cart-direct`, `/api/cart-simple`
- Cart can contain both products and meal plans

**Questions:**
1. How is cart state synchronized between frontend and backend?
2. What happens to cart when user logs in/out?
3. Can cart persist across sessions?
4. How are meal plans added to cart vs products?
5. Is there cart expiration logic?

---

### 8. Order Creation Flow Edge Cases

**Findings:**
- Order creation creates user if doesn't exist
- Handles both cart items and meal plans
- Creates order items from cart
- Clears cart after order creation
- Sends confirmation email (non-blocking)

**Questions:**
1. What happens if email sending fails?
2. What if cart is cleared but order creation fails?
3. How are partial failures handled?
4. Is there order rollback logic?
5. What happens to orders without payment?

---

### 9. Subscription Lifecycle Management

**Findings:**
- Pause/resume routes exist but return placeholder responses
- No actual database updates for pause/resume
- Subscription status tracking unclear
- No renewal logic found

**Questions:**
1. How are subscriptions actually paused in the database?
2. What happens to scheduled deliveries when subscription is paused?
3. How are subscriptions renewed?
4. What's the cancellation flow?
5. How are subscription statuses updated?

---

### 10. Frontend Component Architecture

**Findings:**
- Components in `apps/web/components/` (shared)
- Page components in `apps/web/app/` (Next.js App Router)
- Admin components in `apps/web/app/admin/`
- Dashboard components in `apps/web/app/dashboard/components/`
- No clear component hierarchy documentation

**Questions:**
1. What's the component reusability pattern?
2. Are there shared UI components library?
3. How are components organized by feature?
4. What's the relationship between page components and shared components?
5. Are there any component duplication issues?

---

### 11. Integration Points

**Findings:**
- Email system: Nodemailer with Gmail SMTP
- Database: Neon PostgreSQL (production), Docker (local)
- No payment gateway integration found
- No SMS service found
- No analytics service found

**Questions:**
1. What external services are integrated?
2. Are there API keys/secrets that need to be configured?
3. What's the email service configuration?
4. Are there webhook endpoints for external services?
5. What monitoring/analytics tools are used?

---

### 12. Business Logic Edge Cases

**Questions:**
1. What happens if a meal is out of stock during subscription?
2. How are meal substitutions handled?
3. What's the refund policy and implementation?
4. How are delivery address changes handled for active subscriptions?
5. What happens if a customer wants to change meal plan mid-subscription?
6. How are dietary restrictions and allergies handled?
7. What's the process for handling delivery complaints?

---

## 📋 Summary of Critical Gaps

### High Priority (Block Structural Changes)
1. **Pricing System Confusion** - Need to know which system is active
2. **Subscription vs Orders** - Need to understand the relationship
3. **Database Schema** - Need production schema clarity
4. **Payment Integration** - Need to know current status

### Medium Priority (Important for Understanding)
5. **Delivery Scheduling** - Need algorithm details
6. **Subscription Lifecycle** - Need actual implementation details
7. **Frontend State Management** - Need pattern clarification
8. **Cart Management** - Need synchronization logic

### Low Priority (Nice to Have)
9. **Component Architecture** - Need organization pattern
10. **Integration Points** - Need service list
11. **Business Logic Edge Cases** - Need policy clarification

---

## 🎯 Next Steps

1. **Answer Critical Questions** - Focus on pricing, subscriptions, database, payment
2. **Review Production Code** - Check what's actually running
3. **Document Findings** - Update documentation with answers
4. **Reach 90%+ Mastery** - Before making structural changes

---

**Status:** ✅ Critical questions answered  
**Ready for:** Continued exploration to reach 90%+  
**Clarified:** Pricing system, subscription model, payment status

---

## ✅ Answers Received (2025-12-07)

### 1. Pricing System ✅
**Answer:** Database-driven is correct. `meal_type_prices` and `discount_rules` tables are source of truth.
**Action:** ✅ Created missing `pricing-calculator.ts` file

### 2. Payment Integration ✅
**Answer:** Not implemented. Plan for COD, Wire Transfer, Berexia (credit card).
**Action:** 📋 Clean existing payment code, plan payment method structure

### 3. Subscriptions vs Orders ✅
**Answer:** 
- **Subscriptions** = Meal plan subscriptions (recurring)
- **Orders** = Express Shop one-time purchases
- **Deliveries** = Delivery instances (can be from subscriptions OR orders)
- Within subscriptions, deliveries are the "orders" (delivery instances)
**Action:** ✅ Documented in `ARCHITECTURE_CLARIFIED.md`

### 4. Database Schema ✅
**Answer:** Drizzle is source of truth, but check what's in it (should be most developed).
**Action:** 📋 Review and update Drizzle schema with missing tables

### 5. Missing File ✅
**Answer:** User doesn't know.
**Action:** ✅ Created `pricing-calculator.ts` based on usage patterns

