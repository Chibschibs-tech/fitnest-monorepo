                        
                        # FitNest Monorepo - Complete Project Audit
**Date:** December 7, 2025  
**Status:** Production Live System  
**Purpose:** Comprehensive understanding before making changes

---

## Executive Summary

FitNest is a **meal subscription platform** for Morocco, offering:
- **Subscription meal plans** (Weight Loss, Stay Fit, Muscle Gain)
- **Express Shop** (one-time purchases)
- **Daily meal deliveries** with flexible scheduling
- **Dynamic pricing** based on meals, days, and duration

**Critical Finding:** The project has **TWO admin panels**:
1. ❌ **Wrong Admin** (`apps/admin` on port 3001) - Simple placeholder, should be deleted
2. ✅ **Real Admin** (`apps/web/app/admin` on port 3002) - Full-featured admin panel with 63 files

---

## 1. Project Structure

### 1.1 Monorepo Architecture

```
fitnest-monorepo/
├── apps/
│   ├── web/              ✅ MAIN APPLICATION (Port 3002)
│   │   ├── app/         # Next.js App Router
│   │   │   ├── admin/   ✅ REAL ADMIN PANEL (63 files)
│   │   │   ├── api/     # 177 API routes
│   │   │   ├── dashboard/ # Customer dashboard
│   │   │   ├── meal-plans/ # Meal plan selection
│   │   │   └── ...
│   │   ├── components/  # React components
│   │   ├── lib/         # Utilities & services
│   │   └── docs/        # Documentation
│   │
│   └── admin/           ❌ WRONG ADMIN (Port 3001) - DELETE THIS
│       └── app/         # Simple placeholder
│
├── packages/
│   └── db/              # Shared database package
│       ├── src/
│       │   ├── schema.ts    # Drizzle ORM schema
│       │   └── client.ts   # Supabase client (legacy?)
│       └── migrations/     # Database migrations
│
└── docker-compose.yml   # Local PostgreSQL setup
```

### 1.2 Technology Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- shadcn/ui components
- TypeScript

**Backend:**
- Next.js API Routes
- Neon PostgreSQL (serverless in production)
- Custom JWT-based authentication
- Nodemailer for emails

**Database:**
- PostgreSQL (Neon in production, Docker locally)
- Drizzle ORM (for schema definition)
- Raw SQL queries (actual implementation)

**Infrastructure:**
- Vercel (hosting)
- Neon (database)
- Docker (local development)

---

## 2. Database Architecture

### 2.1 Schema Confusion ⚠️

**CRITICAL ISSUE:** Multiple conflicting schemas exist:

1. **Drizzle Schema** (`packages/db/src/schema.ts`)
   - Clean, modern schema
   - Tables: `users`, `meals`, `meal_plans`, `plan_variants`, `meal_plan_meals`, `subscriptions`, `deliveries`
   - **Status:** Defined but may not match production

2. **Bootstrap Schema** (`apps/web/app/api/admin/bootstrap/route.ts`)
   - Creates: `users`, `meal_plans`, `meals`, `products`, `orders`, `order_items`, `deliveries`, `waitlist`, `plans`, `plan_prices`, `subscriptions`
   - **Status:** Used for initialization

3. **Legacy Schemas** (`apps/web/database/`)
   - `schema.sql` - Meal-focused schema
   - `generic-ecommerce-schema.sql` - E-commerce schema
   - **Status:** Unclear which is active

4. **Production Tables** (from API routes analysis):
   - `users`, `sessions`
   - `products`, `cart`, `cart_items`
   - `orders`, `order_items`
   - `meal_type_prices`, `discount_rules` (pricing system)
   - `customers` (extended user profiles)
   - `subscriptions`, `delivery_status`
   - `waitlist`
   - `meal_plans`, `meals` (multiple versions?)

### 2.2 Key Tables (Production)

#### Authentication
```sql
users (
  id, name, email, password, role, 
  acquisition_source, created_at, updated_at
)

sessions (
  id, user_id, expires_at, created_at
)
```

#### Products & Catalog
```sql
products (
  id, name, description, price, saleprice,
  imageurl, category, tags, nutritionalinfo,
  stock, isactive, createdat, updatedat
)

meals (
  id, name, description, meal_type, 
  calories, protein, carbs, fat,
  image_url, category, created_at
)
```

#### Pricing System ⭐
```sql
meal_type_prices (
  id, plan_name, meal_type, base_price_mad,
  is_active, created_at, updated_at
)

discount_rules (
  id, discount_type, condition_value,
  discount_percentage, stackable,
  is_active, valid_from, valid_to
)
```

#### Orders & Subscriptions
```sql
orders (
  id, user_id, plan_id, total_amount,
  status, delivery_address, delivery_date,
  created_at, updated_at
)

order_items (
  id, order_id, product_id, quantity, price
)

subscriptions (
  id, user_id, plan_id, status,
  current_period_start, current_period_end
)

delivery_status (
  id, order_id, delivery_date,
  status, delivered_at, notes
)
```

#### Cart
```sql
cart (
  id, user_id, product_id, quantity,
  created_at, updated_at
)
```

---

## 3. Business Logic

### 3.1 Pricing System

**Location:** `/api/calculate-price`

**How it works:**
1. Get base meal prices from `meal_type_prices` table
2. Calculate daily price (sum of selected meals)
3. Calculate gross weekly (daily × days per week)
4. Apply days discount (exact match: 5, 6, or 7 days)
5. Apply duration discount (>= threshold: 2, 4, 8, 12 weeks)
6. Calculate total (final weekly × duration)

**Current Pricing (MAD):**
- Weight Loss: Breakfast 45, Lunch 55, Dinner 50
- Stay Fit: Breakfast 50, Lunch 60, Dinner 55
- Muscle Gain: Breakfast 55, Lunch 70, Dinner 65

**Discounts:**
- Days: 5 days (3%), 6 days (5%), 7 days (7%)
- Duration: 2 weeks (5%), 4 weeks (10%), 8 weeks (15%), 12 weeks (20%)

### 3.2 Order Flow

1. **Customer Selection:**
   - Choose meal plan (Weight Loss/Stay Fit/Muscle Gain)
   - Select meals (Breakfast, Lunch, Dinner)
   - Choose days per week (1-7)
   - Choose duration (weeks)

2. **Price Calculation:**
   - Call `/api/calculate-price`
   - Get real-time pricing with discounts

3. **Checkout:**
   - Customer details
   - Shipping address
   - Payment (Stripe integration?)

4. **Order Creation:**
   - `/api/orders/create`
   - Creates user if needed
   - Creates order record
   - Adds order items
   - Clears cart
   - Sends confirmation email

5. **Delivery Generation:**
   - Based on selected days and weeks
   - Creates delivery entries
   - Status: pending → delivered

### 3.3 Subscription System

**Features:**
- Active subscriptions tracking
- Pause/Resume functionality
- Delivery schedule management
- Renewal tracking

**Statuses:**
- `active` - Currently delivering
- `paused` - Temporarily paused
- `canceled` - Cancelled by user
- `expired` - Subscription ended

### 3.4 Express Shop

**Purpose:** One-time purchases (snacks, drinks, accessories)

**Flow:**
- Browse products
- Add to cart
- Checkout (similar to subscriptions)
- Order created

---

## 4. API Architecture

### 4.1 API Routes Structure

**Total: 177 API routes** (many are debug/test routes)

#### Core Business APIs

**Authentication:**
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/session`
- `POST /api/auth/logout`

**Pricing:**
- `POST /api/calculate-price` ⭐ Core pricing engine

**Orders:**
- `POST /api/orders/create`
- `GET /api/orders`
- `GET /api/orders/[id]`

**Cart:**
- `GET /api/cart`
- `POST /api/cart/add`
- `POST /api/cart/remove`
- `POST /api/cart/update`
- `POST /api/cart/clear`

**Products:**
- `GET /api/products`
- `GET /api/products/[id]`

**Meals & Plans:**
- `GET /api/meals`
- `GET /api/meal-plans`
- `GET /api/meal-plans/[id]`

**Subscriptions:**
- `GET /api/subscriptions/[id]/deliveries`
- `POST /api/subscriptions/[id]/pause`
- `POST /api/subscriptions/[id]/resume`

#### Admin APIs

**Dashboard:**
- `GET /api/admin/dashboard`

**Customers:**
- `GET /api/admin/customers`
- `GET /api/admin/customers/[id]`

**Orders:**
- `GET /api/admin/orders`
- `GET /api/admin/orders/all`
- `GET /api/admin/orders/[id]`
- `POST /api/admin/orders/[id]/status`

**Products:**
- `GET /api/admin/products/meals`
- `GET /api/admin/products/meal-plans`
- `GET /api/admin/products/snacks`
- `GET /api/admin/products/express-shop`
- `GET /api/admin/products/accessories`

**Pricing Management:**
- `GET /api/admin/pricing/meal-prices`
- `POST /api/admin/pricing/meal-prices`
- `PUT /api/admin/pricing/meal-prices/[id]`
- `GET /api/admin/pricing/discount-rules`
- `POST /api/admin/pricing/discount-rules`
- `PUT /api/admin/pricing/discount-rules/[id]`
- `POST /api/admin/pricing/calculate` (simulator)

**Subscriptions:**
- `GET /api/admin/subscriptions/active`
- `GET /api/admin/subscriptions/paused`
- `PUT /api/admin/subscriptions/[id]/status`

**Deliveries:**
- `GET /api/admin/get-pending-deliveries`
- `POST /api/admin/mark-delivery-delivered`

**Waitlist:**
- `GET /api/admin/waitlist`
- `GET /api/admin/waitlist/export`

#### Debug/Test APIs (Many!)

**Database:**
- `/api/db-check`, `/api/db-diagnostic`, `/api/db-test`
- `/api/schema-check`, `/api/table-structure`

**Cart:**
- `/api/cart-debug`, `/api/cart-diagnostic`
- `/api/debug-cart`, `/api/debug-cart-structure`

**Orders:**
- `/api/debug-orders`, `/api/debug-orders-table`

**Auth:**
- `/api/auth-debug`, `/api/debug-login`
- `/api/debug-auth-status`, `/api/debug-sessions`

**Email:**
- `/api/email-diagnostic`, `/api/test-email`

**Waitlist:**
- `/api/waitlist-debug`, `/api/debug-waitlist-db`

**⚠️ Recommendation:** Clean up debug routes before production

### 4.2 Authentication System

**Location:** `apps/web/lib/simple-auth.ts`

**How it works:**
1. User registers/logs in
2. Password hashed with SHA256 + salt
3. Session created (UUID, 7-day expiry)
4. Session ID stored in cookie (`session-id`)
5. Middleware checks session on protected routes

**Session Management:**
- Sessions table: `id`, `user_id`, `expires_at`
- Cookie-based (not JWT tokens)
- 7-day expiration

**Roles:**
- `customer` (default)
- `admin`
- `staff`

**Middleware:** `apps/web/middleware.ts`
- Checks `session-id` cookie
- Redirects to `/login` if no session
- Public routes defined in array

---

## 5. Admin Panel Analysis

### 5.1 Wrong Admin Panel ❌

**Location:** `apps/admin/`  
**Port:** 3001  
**Status:** Simple placeholder, should be deleted

**Structure:**
- Basic pages (login, meals, plans, pricing)
- Uses Supabase client
- Minimal functionality

**Action Required:** DELETE THIS ENTIRE APP

### 5.2 Real Admin Panel ✅

**Location:** `apps/web/app/admin/`  
**Port:** 3002 (via main web app)  
**Status:** Production admin panel

**Features:**
- Dashboard with analytics
- Customer management
- Product management (meals, plans, snacks, express shop, accessories)
- Order management (all orders, subscriptions)
- Subscription management (active, paused)
- Delivery management
- Pricing management (meal prices, discount rules, simulator)
- Waitlist management
- System setup tools

**Sidebar Navigation:**
```
Dashboard
Customers
Products
  ├── Meals
  ├── Meal Plans
  ├── Snacks
  ├── Express Shop
  └── Accessories
Orders
  ├── All Orders
  └── Subscriptions
Subscription System
  ├── Subscription Plans
  ├── Active Subscriptions
  └── Paused Subscriptions
Deliveries
Waitlist
System Setup
  ├── Check Tables
  ├── Create Tables
  └── Initialize Plans
Settings
```

**Access:** `/admin` (requires admin role)

---

## 6. Frontend Structure

### 6.1 Customer-Facing Pages

**Public:**
- `/` - Homepage
- `/meal-plans` - Browse meal plans
- `/meals` - Browse meals
- `/express-shop` - Express shop
- `/how-it-works` - Information
- `/about`, `/contact`, `/faq`
- `/waitlist` - Waitlist signup
- `/login`, `/register`

**Protected:**
- `/dashboard` - Customer dashboard
- `/dashboard/subscriptions` - Active subscriptions
- `/dashboard/orders` - Order history
- `/checkout` - Checkout flow
- `/order/[id]` - Order details

### 6.2 Components

**Key Components:**
- `Navbar.tsx` - Main navigation
- `Footer.tsx` - Footer
- `MealCard.tsx` - Meal display card
- `CartIcon.tsx` - Cart icon with count
- `CartPreview.tsx` - Cart dropdown
- `DeliveryCalendar.tsx` - Delivery date picker
- `AuthGuard.tsx` - Route protection
- `ui/` - shadcn/ui components (24 files)

**State Management:**
- React Context for auth
- React hooks for cart
- Server components for data fetching

---

## 7. Business Model Alignment

### 7.1 From Brief vs. Implementation

**Brief Requirements:**
- ✅ 3 plans: Weight Loss, Stay Fit, Muscle Gain
- ✅ Daily or every 2 days delivery
- ✅ Subscription model (weekly/monthly)
- ✅ Express Shop (snacks, drinks)
- ✅ No personalization at launch
- ✅ French language

**Implementation Status:**
- ✅ Plans implemented
- ✅ Pricing system implemented
- ✅ Subscription system implemented
- ✅ Express shop implemented
- ✅ Delivery system implemented
- ⚠️ Language: Mixed (some French, some English)

### 7.2 Missing/Incomplete Features

1. **Delivery Windows:** Not fully implemented
2. **Pause/Resume:** API exists, UI unclear
3. **Address Management:** Basic implementation
4. **Payment Integration:** Stripe mentioned but not verified
5. **Email Notifications:** Basic implementation
6. **Customer Support:** No dedicated system

---

## 8. Critical Issues & Recommendations

### 8.1 Immediate Actions Required

1. **❌ DELETE `apps/admin/` directory**
   - Wrong admin panel
   - Confusing for developers
   - Not used in production

2. **⚠️ Clean up debug/test API routes**
   - 50+ debug routes should be removed or protected
   - Security risk if exposed

3. **⚠️ Consolidate database schemas**
   - Multiple conflicting schemas
   - Need to determine which is production
   - Create migration plan

4. **⚠️ Fix port configuration**
   - Web app: 3002 ✅
   - Admin app: 3001 (wrong one) ❌
   - Should only have one app running

### 8.2 Code Quality Issues

1. **Inconsistent naming:**
   - `saleprice` vs `sale_price`
   - `imageurl` vs `image_url`
   - Mixed camelCase and snake_case

2. **Multiple database clients:**
   - Drizzle schema (not used?)
   - Supabase client (legacy?)
   - Raw SQL with Neon

3. **Test/debug code in production:**
   - Many test pages
   - Debug routes
   - Diagnostic endpoints

4. **Documentation scattered:**
   - Multiple docs in `apps/web/docs/`
   - Some outdated
   - No single source of truth

### 8.3 Architecture Improvements

1. **Database:**
   - Choose one ORM (Drizzle or raw SQL)
   - Consolidate schemas
   - Create proper migrations

2. **API:**
   - Remove debug routes
   - Add proper error handling
   - Implement rate limiting
   - Add API documentation

3. **Authentication:**
   - Consider JWT tokens
   - Add refresh tokens
   - Implement proper session management

4. **Testing:**
   - Add unit tests
   - Add integration tests
   - Add E2E tests

---

## 9. File Organization Issues

### 9.1 Messy Structure

**Problems:**
- Test pages mixed with production pages
- Debug routes in main API folder
- Multiple schema files
- Legacy code not removed
- Duplicate implementations

**Recommendations:**
```
apps/web/app/
├── (production)/     # Production pages
├── (test)/          # Test pages (dev only)
└── api/
    ├── (production)/ # Production APIs
    └── (debug)/      # Debug APIs (dev only)
```

### 9.2 Dead Code

**Should be removed:**
- `apps/admin/` (entire directory)
- Test pages (`/test`, `/test-page`, `/api-test`)
- Debug pages (`/debug-*`, `/complete-diagnostic`)
- Legacy scripts in `scripts/_legacy/`
- Unused components

---

## 10. Security Considerations

### 10.1 Current Security

**✅ Implemented:**
- Password hashing (SHA256 + salt)
- Session-based auth
- Role-based access control
- Middleware protection

**⚠️ Concerns:**
- Debug routes exposed
- No rate limiting
- Session expiration (7 days - long)
- No CSRF protection
- Admin routes protected but could be stronger

### 10.2 Recommendations

1. Add rate limiting to API routes
2. Implement CSRF tokens
3. Reduce session expiration time
4. Add request validation
5. Implement proper error handling (don't expose internals)
6. Add logging and monitoring

---

## 11. Deployment & Environment

### 11.1 Current Setup

**Production:**
- Hosting: Vercel
- Database: Neon PostgreSQL
- Environment: Production + Preview

**Local:**
- Docker PostgreSQL (port 5433)
- Next.js dev servers
- Environment variables in `.env` files

### 11.2 Environment Variables

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL` - (if using Supabase)
- `SUPABASE_SERVICE_ROLE_KEY` - (if using Supabase)
- Email credentials (for Nodemailer)
- Stripe keys (if using Stripe)

---

## 12. Next Steps

### 12.1 Immediate (Before Development)

1. ✅ Delete `apps/admin/` directory
2. ✅ Verify real admin panel works
3. ✅ Document actual database schema
4. ✅ Create database migration plan
5. ✅ Clean up debug routes

### 12.2 Short Term

1. Consolidate database schemas
2. Remove test/debug code
3. Improve error handling
4. Add proper logging
5. Create API documentation

### 12.3 Long Term

1. Add comprehensive testing
2. Implement proper CI/CD
3. Add monitoring and analytics
4. Improve security
5. Refactor code structure

---

## 13. Key Files Reference

### 13.1 Critical Files

**Authentication:**
- `apps/web/lib/simple-auth.ts` - Auth logic
- `apps/web/middleware.ts` - Route protection

**Database:**
- `packages/db/src/schema.ts` - Drizzle schema
- `apps/web/lib/db.ts` - Database client

**Pricing:**
- `apps/web/app/api/calculate-price/route.ts` - Pricing engine
- `apps/web/docs/PRICING_SYSTEM_GUIDE.md` - Pricing docs

**Orders:**
- `apps/web/app/api/orders/create/route.ts` - Order creation

**Admin:**
- `apps/web/app/admin/` - Real admin panel
- `apps/web/app/admin/admin-sidebar.tsx` - Navigation

### 13.2 Documentation

- `apps/web/docs/TECHNICAL_BRIEF_FITNEST.md` - Technical overview
- `apps/web/docs/PRICING_SYSTEM_GUIDE.md` - Pricing system
- `apps/web/docs/delivery-system-documentation.md` - Delivery system
- `PROJECT_STATUS.md` - Project status tracking

---

## 14. Conclusion

**Project Status:** ✅ **LIVE AND FUNCTIONAL**

**Key Findings:**
1. Real admin panel is in `apps/web/app/admin/` (not `apps/admin/`)
2. Multiple database schemas need consolidation
3. Many debug routes should be cleaned up
4. Code structure needs organization
5. Business logic is well-implemented
6. Pricing system is sophisticated and working

**Confidence Level:** 🟢 **HIGH**
- Core business logic understood
- API structure mapped
- Database schema identified (though messy)
- Admin panel located
- Business model aligned

**Ready for Development:** ✅ **YES** (after cleanup)

---

**End of Audit**




