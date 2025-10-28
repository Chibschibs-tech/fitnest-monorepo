# Fitnest.ma - Complete Technical Brief

**Version:** 2.0  
**Date:** January 2025  
**Status:** Production Ready  
**Tech Lead Handover Document**

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Database Schema](#database-schema)
5. [Pricing Engine](#pricing-engine)
6. [Authentication System](#authentication-system)
7. [API Routes](#api-routes)
8. [Admin Panel](#admin-panel)
9. [Deployment](#deployment)
10. [Development Workflow](#development-workflow)
11. [Testing](#testing)
12. [Known Issues & TODOs](#known-issues--todos)

---

## 1. Project Overview

### 1.1 Business Model

Fitnest.ma is a **meal subscription platform** for health-conscious consumers in Morocco. The platform offers:

- **Subscription Meal Plans**: Weekly/monthly healthy meal deliveries
- **Express Shop**: One-time purchases of health products (protein bars, supplements)
- **Custom Meal Selection**: Users choose specific meals, days, and duration
- **Dynamic Pricing**: Volume and duration-based discounts

### 1.2 Core Features

✅ **Customer Features:**
- User registration and authentication
- Meal plan browsing and customization
- Real-time price calculation
- Order placement and tracking
- Delivery schedule management
- Express shop for quick purchases

✅ **Admin Features:**
- Dashboard with analytics
- Customer management
- Order processing
- Subscription management
- Product catalog management
- Pricing configuration
- Waitlist management

---

## 2. Technology Stack

### 2.1 Frontend
\`\`\`typescript
Framework: Next.js 14 (App Router)
UI Library: React 18
Styling: Tailwind CSS
Components: shadcn/ui
State: React Context + Hooks
Forms: Native React forms
Icons: Lucide React
\`\`\`

### 2.2 Backend
\`\`\`typescript
Runtime: Node.js 20+
Framework: Next.js API Routes
Database: Neon PostgreSQL (serverless)
ORM: None (raw SQL with @neondatabase/serverless)
Authentication: Custom JWT-based system
Email: Nodemailer with Gmail SMTP
\`\`\`

### 2.3 Infrastructure
\`\`\`typescript
Hosting: Vercel
Database: Neon (Postgres)
Storage: Vercel Blob (images/assets)
Environment: Production + Preview
\`\`\`

---

## 3. Architecture

### 3.1 Application Structure

\`\`\`
fitnest-ma/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   │   ├── login/
│   │   ├── register/
│   │   └── logout/
│   ├── admin/                    # Admin panel
│   │   ├── customers/
│   │   ├── orders/
│   │   ├── subscriptions/
│   │   ├── products/
│   │   ├── pricing/             # Pricing management
│   │   └── waitlist/
│   ├── dashboard/                # User dashboard
│   ├── meals/                    # Meal browsing
│   ├── meal-plans/              # Plan selection
│   ├── order/                    # Order flow
│   ├── express-shop/            # Quick shop
│   ├── waitlist/                # Waitlist signup
│   └── api/                      # API routes
│       ├── auth/
│       ├── calculate-price/     # Pricing engine
│       ├── admin/
│       └── ...
├── components/                   # Reusable components
│   ├── ui/                      # shadcn components
│   ├── navbar.tsx
│   ├── footer.tsx
│   └── ...
├── lib/                         # Utilities
│   ├── db.ts                    # Database client
│   ├── simple-auth.ts          # Auth utilities
│   ├── pricing-model.ts        # OLD pricing (deprecated)
│   └── ...
├── scripts/                     # Database scripts
│   ├── create-pricing-tables.sql
│   ├── create-subscription-tables.sql
│   └── ...
└── docs/                        # Documentation
\`\`\`

### 3.2 Data Flow

\`\`\`
Client Request
    ↓
Next.js Middleware (auth check)
    ↓
API Route Handler
    ↓
Database Query (Neon Postgres)
    ↓
Response with JSON
    ↓
Client UI Update
\`\`\`

---

## 4. Database Schema

### 4.1 Core Tables

#### **users**
\`\`\`sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user',  -- 'user' | 'admin' | 'customer'
  acquisition_source TEXT DEFAULT 'direct',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

#### **customers** (Extended user profiles)
\`\`\`sql
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  first_name TEXT,
  last_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  total_orders INT DEFAULT 0,
  total_spent NUMERIC(10,2) DEFAULT 0,
  status TEXT DEFAULT 'active',  -- 'active' | 'inactive' | 'suspended'
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

#### **meal_type_prices** ⭐ NEW - Dynamic Pricing
\`\`\`sql
CREATE TABLE meal_type_prices (
  id SERIAL PRIMARY KEY,
  plan_name TEXT NOT NULL,           -- 'Weight Loss' | 'Stay Fit' | 'Muscle Gain'
  meal_type TEXT NOT NULL,           -- 'Breakfast' | 'Lunch' | 'Dinner'
  base_price_mad NUMERIC(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(plan_name, meal_type)
);
\`\`\`

**Seed Data:**
\`\`\`sql
-- Weight Loss Plan
('Weight Loss', 'Breakfast', 45.00)
('Weight Loss', 'Lunch', 55.00)
('Weight Loss', 'Dinner', 50.00)

-- Stay Fit Plan
('Stay Fit', 'Breakfast', 50.00)
('Stay Fit', 'Lunch', 60.00)
('Stay Fit', 'Dinner', 55.00)

-- Muscle Gain Plan
('Muscle Gain', 'Breakfast', 55.00)
('Muscle Gain', 'Lunch', 70.00)
('Muscle Gain', 'Dinner', 65.00)
\`\`\`

#### **discount_rules** ⭐ NEW - Dynamic Discounts
\`\`\`sql
CREATE TABLE discount_rules (
  id SERIAL PRIMARY KEY,
  discount_type TEXT NOT NULL,       -- 'days_per_week' | 'duration_weeks' | 'special_offer'
  condition_value INT NOT NULL,      -- e.g., 5 (days) or 4 (weeks)
  discount_percentage NUMERIC(5,4) NOT NULL,  -- 0.0300 = 3%
  stackable BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMP NULL,
  valid_to TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

**Seed Data:**
\`\`\`sql
-- Days per week discounts
('days_per_week', 5, 0.0300, true)  -- 5 days = 3%
('days_per_week', 6, 0.0500, true)  -- 6 days = 5%
('days_per_week', 7, 0.0700, true)  -- 7 days = 7%

-- Duration discounts
('duration_weeks', 2, 0.0500, true)  -- 2 weeks = 5%
('duration_weeks', 4, 0.1000, true)  -- 4 weeks = 10%
('duration_weeks', 8, 0.1500, true)  -- 8 weeks = 15%
('duration_weeks', 12, 0.2000, true) -- 12 weeks = 20%
\`\`\`

#### **products**
\`\`\`sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  product_type TEXT NOT NULL,  -- 'simple' | 'variable' | 'subscription'
  base_price NUMERIC(10,2) NOT NULL,
  sale_price NUMERIC(10,2),
  stock_quantity INT DEFAULT 0,
  status TEXT DEFAULT 'active',
  nutritional_info JSONB,
  dietary_tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

#### **orders**
\`\`\`sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_number TEXT UNIQUE,
  customer_id INT REFERENCES customers(id),
  order_type TEXT,  -- 'one_time' | 'subscription' | 'subscription_renewal'
  subtotal NUMERIC(10,2) NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',  -- 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

#### **active_subscriptions**
\`\`\`sql
CREATE TABLE active_subscriptions (
  id SERIAL PRIMARY KEY,
  customer_id INT REFERENCES customers(id),
  plan_id INT REFERENCES subscription_plans(id),
  status TEXT DEFAULT 'active',  -- 'active' | 'paused' | 'cancelled' | 'expired'
  next_billing_date DATE,
  next_delivery_date DATE,
  billing_amount NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

#### **waitlist**
\`\`\`sql
CREATE TABLE waitlist (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  meal_plan_preference TEXT,
  city TEXT,
  notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

### 4.2 Database Relationships

\`\`\`
users (1) ←→ (1) customers
customers (1) ←→ (N) orders
customers (1) ←→ (N) active_subscriptions
subscription_plans (1) ←→ (N) active_subscriptions
products (1) ←→ (N) order_items
\`\`\`

---

## 5. Pricing Engine ⭐ CRITICAL

### 5.1 Pricing Model

**Unit Fondamentale:** REPAS (not day)

### 5.2 Calculation Formula

\`\`\`typescript
// Step 1: Calculate base daily price
pricePerDay = Σ(meal_type_prices for selected meals)

// Step 2: Calculate gross weekly
grossWeekly = pricePerDay × days_per_week

// Step 3: Apply days_per_week discount (if applicable)
if (days >= 5) {
  daysDiscount = grossWeekly × discount_percentage
  grossWeekly -= daysDiscount
}

// Step 4: Apply duration discount (multiplicative)
if (duration >= 2) {
  durationDiscount = grossWeekly × duration_discount_percentage
  finalWeekly = grossWeekly - durationDiscount
}

// Step 5: Calculate total
totalPrice = finalWeekly × duration_weeks
\`\`\`

### 5.3 Example Calculation

**Input:**
- Plan: Weight Loss
- Meals: Breakfast + Lunch
- Days: 5 per week
- Duration: 4 weeks

**Calculation:**
\`\`\`
1. Base prices:
   - Breakfast: 45 MAD
   - Lunch: 55 MAD
   - Daily: 100 MAD

2. Gross weekly:
   - 100 MAD × 5 days = 500 MAD

3. Days discount (5 days = 3%):
   - 500 × 0.03 = 15 MAD
   - 500 - 15 = 485 MAD

4. Duration discount (4 weeks = 10%):
   - 485 × 0.10 = 48.50 MAD
   - 485 - 48.50 = 436.50 MAD/week

5. Total:
   - 436.50 × 4 weeks = 1,746 MAD
\`\`\`

### 5.4 Pricing API Endpoint

**Endpoint:** `POST /api/calculate-price`

**Request Body:**
\`\`\`json
{
  "plan": "Weight Loss",
  "meals": ["Breakfast", "Lunch"],
  "days": 5,
  "duration": 4
}
\`\`\`

**Response:**
\`\`\`json
{
  "currency": "MAD",
  "pricePerDay": 100.00,
  "grossWeekly": 500.00,
  "discountsApplied": [
    {
      "type": "days_per_week",
      "condition": 5,
      "percentage": 0.03,
      "amount": 15.00
    },
    {
      "type": "duration_weeks",
      "condition": 4,
      "percentage": 0.10,
      "amount": 48.50
    }
  ],
  "finalWeekly": 436.50,
  "durationWeeks": 4,
  "totalRoundedMAD": 1746.00,
  "breakdown": {
    "plan": "Weight Loss",
    "meals": ["Breakfast", "Lunch"],
    "days": 5,
    "mealPrices": [
      { "meal": "Breakfast", "price": 45.00 },
      { "meal": "Lunch", "price": 55.00 }
    ]
  }
}
\`\`\`

### 5.5 Discount Rules

**Days per Week:**
- 5 days → 3% discount
- 6 days → 5% discount
- 7 days → 7% discount

**Duration:**
- 2 weeks → 5% discount
- 4 weeks → 10% discount
- 8 weeks → 15% discount
- 12 weeks → 20% discount

**Stacking Logic:**
1. Apply days_per_week discount first
2. Then apply duration discount on reduced price
3. Discounts are **multiplicative**, not additive

---

## 6. Authentication System

### 6.1 Implementation

**Type:** Custom JWT-based authentication (no NextAuth)

**Flow:**
\`\`\`
1. User submits login credentials
2. Server validates against database
3. Server creates JWT token
4. Token stored in session table
5. Token sent via HTTP-only cookie
6. Client includes cookie in subsequent requests
7. Middleware validates token on protected routes
\`\`\`

### 6.2 Session Management

**Table:** `sessions`
\`\`\`sql
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  session_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

**Session Duration:** 30 days

### 6.3 Protected Routes

**Middleware:** `middleware.ts`
\`\`\`typescript
// Protected routes
const protectedRoutes = [
  '/dashboard',
  '/admin',
  '/orders',
  '/profile'
]

// Public routes
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/meals',
  '/meal-plans'
]
\`\`\`

### 6.4 Role-Based Access

**Roles:**
- `user` - Basic authenticated user
- `customer` - User with orders/subscriptions
- `admin` - Full admin access

**Admin Routes:** `/admin/*`
- Requires `role = 'admin'`
- Validated in each API route

---

## 7. API Routes

### 7.1 Authentication

\`\`\`typescript
POST   /api/auth/login          // User login
POST   /api/auth/register       // User registration
POST   /api/auth/logout         // User logout
GET    /api/auth/session        // Get current session
\`\`\`

### 7.2 Pricing ⭐ NEW

\`\`\`typescript
POST   /api/calculate-price                      // Calculate price
GET    /api/admin/pricing/meal-prices            // List meal prices
POST   /api/admin/pricing/meal-prices            // Create meal price
PUT    /api/admin/pricing/meal-prices/[id]       // Update meal price
DELETE /api/admin/pricing/meal-prices/[id]       // Delete meal price
GET    /api/admin/pricing/discount-rules         // List discount rules
POST   /api/admin/pricing/discount-rules         // Create discount rule
PUT    /api/admin/pricing/discount-rules/[id]    // Update discount rule
DELETE /api/admin/pricing/discount-rules/[id]    // Delete discount rule
POST   /api/admin/create-pricing-tables          // Initialize tables
\`\`\`

### 7.3 Admin

\`\`\`typescript
GET    /api/admin/dashboard                  // Dashboard stats
GET    /api/admin/customers                  // List customers
GET    /api/admin/customers/[id]             // Get customer
GET    /api/admin/orders                     // List orders
PUT    /api/admin/orders/[id]/status         // Update order status
GET    /api/admin/subscriptions              // List subscriptions
GET    /api/admin/subscriptions/active       // Active subs
GET    /api/admin/subscriptions/paused       // Paused subs
PUT    /api/admin/subscriptions/[id]/status  // Update sub status
GET    /api/admin/waitlist                   // List waitlist
POST   /api/admin/waitlist/export            // Export waitlist
GET    /api/admin/subscription-plans         // List plans
POST   /api/admin/subscription-plans         // Create plan
PUT    /api/admin/subscription-plans/[id]    // Update plan
DELETE /api/admin/subscription-plans/[id]    // Delete plan
\`\`\`

### 7.4 User

\`\`\`typescript
GET    /api/user/dashboard                   // User dashboard
GET    /api/user/subscriptions               // User's subscriptions
GET    /api/orders                           // User's orders
GET    /api/orders/[id]                      // Order details
POST   /api/orders/create                    // Create order
\`\`\`

### 7.5 Public

\`\`\`typescript
GET    /api/products                         // List products
GET    /api/products/[id]                    // Product details
GET    /api/meals                            // List meals
GET    /api/meals/[id]                       // Meal details
GET    /api/meal-plans                       // List meal plans
GET    /api/meal-plans/[id]                  // Meal plan details
POST   /api/waitlist                         // Join waitlist
\`\`\`

---

## 8. Admin Panel

### 8.1 Navigation Structure

\`\`\`
Admin Dashboard
├── Overview (stats, charts)
├── Customers
│   ├── All Customers
│   └── Customer Detail
├── Orders
│   ├── Orders (one-time)
│   └── Subscriptions
├── Products
│   ├── Meals
│   ├── Meal Plans
│   ├── Snacks
│   ├── Accessories
│   └── Express Shop
├── Pricing ⭐ NEW
│   ├── Price Simulator
│   ├── Meal Prices
│   └── Discount Rules
├── Deliveries
└── Waitlist
\`\`\`

### 8.2 Key Admin Features

**Dashboard:**
- Total customers, orders, revenue
- Active subscriptions count
- Monthly recurring revenue (MRR)
- Recent orders

**Customer Management:**
- View all customers
- Filter by status
- View customer details
- Order history per customer

**Order Management:**
- View all orders
- Filter by status/type
- Update order status
- Process deliveries

**Subscription Management:**
- View active/paused subscriptions
- Update subscription status
- Manage billing dates
- Delivery schedule

**Pricing Management:** ⭐ NEW
- Configure meal prices per plan
- Set up discount rules
- Test pricing calculations
- Enable/disable rules

**Product Management:**
- CRUD operations on products
- Manage stock levels
- Update pricing
- Toggle active status

---

## 9. Deployment

### 9.1 Environment Variables

**Required:**
\`\`\`bash
# Database
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# Authentication
JWT_SECRET="your-secret-key-min-32-chars"
NEXTAUTH_URL="https://fitnest.ma"
NEXTAUTH_SECRET="your-nextauth-secret"

# Email (optional)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@fitnest.ma"

# Storage (optional)
BLOB_READ_WRITE_TOKEN="vercel-blob-token"
\`\`\`

### 9.2 Vercel Configuration

**Build Command:**
\`\`\`json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install"
}
\`\`\`

**Regions:**
- Primary: `iad1` (US East)
- Database: Neon serverless (auto-scaling)

### 9.3 Database Setup

**Step 1: Create Neon Project**
\`\`\`bash
# Create project on Neon
# Copy DATABASE_URL
\`\`\`

**Step 2: Initialize Pricing Tables**
\`\`\`bash
# Visit: https://fitnest.ma/admin/create-pricing-tables
# Click "Create & Seed Tables"
\`\`\`

**Step 3: Initialize Subscription Tables**
\`\`\`bash
# Visit: https://fitnest.ma/admin/create-subscription-tables
# Click "Create Tables"
\`\`\`

**Step 4: Create Admin User**
\`\`\`bash
# Visit: https://fitnest.ma/api/create-admin
# Or insert directly:
INSERT INTO users (name, email, password, role)
VALUES ('Admin', 'admin@fitnest.ma', 'hashed_password', 'admin');
\`\`\`

---

## 10. Development Workflow

### 10.1 Local Setup

\`\`\`bash
# 1. Clone repository
git clone https://github.com/your-org/fitnest-ma.git
cd fitnest-ma

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# 4. Run development server
npm run dev

# 5. Open browser
open http://localhost:3000
\`\`\`

### 10.2 Code Organization

**File Naming:**
- React components: `PascalCase.tsx`
- Utility files: `kebab-case.ts`
- API routes: `route.ts`
- Pages: `page.tsx`

**Component Structure:**
\`\`\`typescript
// 1. Imports
import { useState } from 'react'
import { Button } from '@/components/ui/button'

// 2. Types/Interfaces
interface Props {
  title: string
}

// 3. Component
export default function MyComponent({ title }: Props) {
  const [state, setState] = useState('')
  
  return <div>{title}</div>
}
\`\`\`

**API Route Structure:**
\`\`\`typescript
import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const data = await sql`SELECT * FROM table`
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 })
  }
}
\`\`\`

### 10.3 Git Workflow

\`\`\`bash
# Create feature branch
git checkout -b feature/pricing-update

# Make changes, commit
git add .
git commit -m "feat: add new discount rule type"

# Push to remote
git push origin feature/pricing-update

# Create pull request
# Review and merge
\`\`\`

---

## 11. Testing

### 11.1 Pricing Tests

**Location:** `/admin/pricing/test`

**Test Cases:**
1. Minimum case (1 meal, 3 days, 1 week)
2. Combined discounts (2 meals, 5 days, 4 weeks)
3. Maximum discounts (3 meals, 7 days, 12 weeks)
4. Invalid meal (should return 400)
5. Invalid plan (should return 400)

**Run Tests:**
\`\`\`bash
# Navigate to:
https://fitnest.ma/admin/pricing/test

# Click "Run All Tests"
\`\`\`

### 11.2 Manual Testing Checklist

**Authentication:**
- [ ] Register new user
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Logout
- [ ] Protected route access

**Pricing:**
- [ ] Calculate price with different combinations
- [ ] Verify discount application
- [ ] Test edge cases (1 day, 1 meal, etc.)
- [ ] Update meal price
- [ ] Update discount rule

**Admin:**
- [ ] View dashboard
- [ ] List customers
- [ ] View customer detail
- [ ] Update order status
- [ ] Manage subscriptions

**User Flow:**
- [ ] Browse meal plans
- [ ] Select meals
- [ ] View pricing
- [ ] Place order
- [ ] View order history

---

## 12. Known Issues & TODOs

### 12.1 Known Issues

🐛 **Current Issues:**
1. **Email system** - Gmail SMTP sometimes fails in production
2. **Image optimization** - Some images load slowly
3. **Mobile navigation** - Hamburger menu close button UX
4. **Waitlist export** - CSV encoding issues with Arabic names

### 12.2 High Priority TODOs

🔥 **Must Do:**
1. **Payment Integration**
   - Integrate Stripe or local payment gateway
   - Handle subscription billing
   - Implement refund logic

2. **Delivery Management**
   - Route optimization for drivers
   - Real-time delivery tracking
   - SMS notifications

3. **Inventory Management**
   - Stock tracking per meal
   - Low stock alerts
   - Auto-disable out-of-stock items

4. **Customer Communications**
   - Email templates (order confirmation, delivery, etc.)
   - SMS integration (Twilio)
   - Push notifications

5. **Analytics**
   - Revenue reporting
   - Customer retention metrics
   - Meal popularity tracking

### 12.3 Medium Priority TODOs

📝 **Nice to Have:**
1. Loyalty program
2. Referral system
3. Multi-language support (Arabic/French)
4. Mobile app (React Native)
5. Kitchen management dashboard
6. Recipe management
7. Nutritional calculator
8. Allergen filtering

### 12.4 Technical Debt

⚠️ **Refactoring Needed:**
1. Replace custom auth with better solution (Clerk/NextAuth)
2. Add proper error boundaries
3. Implement caching layer (Redis)
4. Add API rate limiting
5. Improve SQL query performance
6. Add database migrations system
7. Set up CI/CD pipeline
8. Add E2E tests (Playwright)

---

## 13. Important Notes for New Dev

### 13.1 Critical Files

**DO NOT MODIFY without understanding:**
- `lib/db.ts` - Database connection
- `lib/simple-auth.ts` - Authentication logic
- `middleware.ts` - Route protection
- `app/api/calculate-price/route.ts` - Pricing engine ⭐

### 13.2 Pricing System

**⚠️ CRITICAL:**
The pricing system is the **core business logic**. Any changes must:
1. Be tested thoroughly
2. Maintain backward compatibility
3. Update documentation
4. Pass all automated tests

**Before modifying pricing:**
1. Understand the calculation formula
2. Test with realistic data
3. Verify discounts stack correctly
4. Check edge cases (1 meal, 1 day, etc.)

### 13.3 Database Changes

**Process:**
1. Write SQL migration script in `/scripts/`
2. Test locally first
3. Create API endpoint to run migration
4. Run in staging environment
5. Verify data integrity
6. Run in production
7. Update schema documentation

**Never:**
- Delete tables without backup
- Modify column types on production
- Run untested migrations

### 13.4 Deployment Checklist

**Before deploying:**
- [ ] All tests pass
- [ ] No console errors
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Build succeeds locally
- [ ] Preview deployment tested
- [ ] Rollback plan ready

---

## 14. Contact & Resources

### 14.1 Key Resources

**Documentation:**
- Next.js Docs: https://nextjs.org/docs
- Neon Docs: https://neon.tech/docs
- shadcn/ui: https://ui.shadcn.com
- Tailwind CSS: https://tailwindcss.com

**Tools:**
- Database: https://console.neon.tech
- Hosting: https://vercel.com/dashboard
- Repo: https://github.com/your-org/fitnest-ma

### 14.2 Support

**For questions:**
1. Check this document first
2. Review relevant code files
3. Check API documentation
4. Test in local environment

**Emergency contacts:**
- Previous dev: [email]
- Product owner: [email]
- Database admin: [email]

---

## Appendix A: Quick Reference

### Environment Setup
\`\`\`bash
npm install
cp .env.example .env.local
npm run dev
\`\`\`

### Database Init
\`\`\`bash
# Visit these URLs in order:
/admin/create-pricing-tables
/admin/create-subscription-tables
/admin/init-subscription-plans
\`\`\`

### Common Commands
\`\`\`bash
npm run dev        # Start dev server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run linter
\`\`\`

### Database Queries
\`\`\`sql
-- Check pricing tables
SELECT * FROM meal_type_prices;
SELECT * FROM discount_rules;

-- Check users
SELECT id, name, email, role FROM users;

-- Check orders
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;
\`\`\`

---

**END OF TECHNICAL BRIEF**

*Last updated: January 2025*
*Version: 2.0*
*Status: Production Ready*
