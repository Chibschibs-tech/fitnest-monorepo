# FitNest - Comprehensive Technical Documentation

**Version:** 2.0  
**Last Updated:** ${new Date().toISOString()}  
**Status:** Production Live System

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Database Schema](#database-schema)
5. [API Reference](#api-reference)
6. [Authentication & Authorization](#authentication--authorization)
7. [Business Logic](#business-logic)
8. [Admin Panel](#admin-panel)
9. [Development Workflow](#development-workflow)
10. [Deployment](#deployment)
11. [Troubleshooting](#troubleshooting)

---

## 1. Project Overview

### 1.1 Business Model

FitNest is a **meal subscription platform** for Morocco that offers:

- **Subscription Meal Plans**: Weekly/monthly healthy meal deliveries
  - Weight Loss Plan
  - Stay Fit Plan
  - Muscle Gain Plan
- **Express Shop**: One-time purchases of health products
- **Daily Deliveries**: Flexible delivery scheduling
- **Dynamic Pricing**: Volume and duration-based discounts

### 1.2 Project Structure

```
fitnest-monorepo/
├── apps/
│   └── web/              # Main Next.js application
│       ├── app/          # Next.js App Router
│       ├── components/   # React components
│       ├── lib/          # Utilities & services
│       └── docs/         # Documentation
├── packages/
│   └── db/               # Shared database package
└── scripts/              # Utility scripts
```

### 1.3 Key Features

**Customer Features:**
- User registration and authentication
- Meal plan browsing and customization
- Real-time price calculation
- Order placement and tracking
- Delivery schedule management
- Express shop for quick purchases

**Admin Features:**
- Dashboard with analytics
- Customer management
- Order processing
- Subscription management
- Product catalog management
- Pricing configuration
- Delivery management
- Waitlist management

---

## 2. Architecture

### 2.1 Application Architecture

**Pattern:** Monorepo with Next.js App Router

```
Client Request
    ↓
Next.js Middleware (auth check)
    ↓
API Route Handler
    ↓
Database Query (PostgreSQL)
    ↓
Response with JSON
    ↓
Client UI Update
```

### 2.2 Directory Structure

**Production Pages:**
- `app/(public)/` - Public pages (home, meal plans, etc.)
- `app/(auth)/` - Authentication pages
- `app/(dashboard)/` - Protected customer pages
- `app/(admin)/` - Admin panel pages

**API Routes:**
- `app/api/(public)/` - Public APIs
- `app/api/(protected)/` - Protected APIs
- `app/api/(admin)/` - Admin APIs

**Components:**
- `components/ui/` - shadcn/ui components
- `components/layout/` - Layout components
- `components/features/` - Feature-specific components

---

## 3. Technology Stack

### 3.1 Frontend

- **Framework:** Next.js 14 (App Router)
- **UI Library:** React 18
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui
- **Icons:** Lucide React
- **Forms:** React Hook Form
- **State:** React Context + Hooks

### 3.2 Backend

- **Runtime:** Node.js 20+
- **Framework:** Next.js API Routes
- **Database:** PostgreSQL (Neon in production, Docker locally)
- **ORM:** Drizzle ORM (schema definition), Raw SQL (queries)
- **Authentication:** Custom JWT-based session system
- **Email:** Nodemailer with Gmail SMTP

### 3.3 Infrastructure

- **Hosting:** Vercel
- **Database:** Neon PostgreSQL (serverless)
- **Storage:** Vercel Blob (images/assets)
- **Environment:** Production + Preview

### 3.4 Development Tools

- **Package Manager:** pnpm
- **Monorepo:** pnpm workspaces
- **TypeScript:** Full type safety
- **Linting:** ESLint (configured)
- **Version Control:** Git

---

## 4. Database Schema

### 4.1 Core Tables

#### Users
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Roles:**
- `customer` - Regular customer (default)
- `admin` - Administrator
- `staff` - Staff member

#### Sessions
```sql
CREATE TABLE sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Meals
```sql
CREATE TABLE meals (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(160) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  kcal INTEGER NOT NULL DEFAULT 0,
  protein NUMERIC(6,2) DEFAULT 0,
  carbs NUMERIC(6,2) DEFAULT 0,
  fat NUMERIC(6,2) DEFAULT 0,
  allergens JSONB DEFAULT '[]',
  tags JSONB DEFAULT '[]',
  image_url TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Meal Plans
```sql
CREATE TABLE meal_plans (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(160) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  summary TEXT,
  audience VARCHAR(60) NOT NULL, -- 'keto' | 'lowcarb' | 'balanced' | 'muscle' | 'custom'
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Plan Variants
```sql
CREATE TABLE plan_variants (
  id SERIAL PRIMARY KEY,
  meal_plan_id INTEGER REFERENCES meal_plans(id),
  label VARCHAR(120) NOT NULL,
  days_per_week INTEGER DEFAULT 5,
  meals_per_day INTEGER DEFAULT 3,
  weekly_base_price_mad NUMERIC(10,2) NOT NULL,
  published BOOLEAN DEFAULT true
);
```

#### Subscriptions
```sql
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  plan_variant_id INTEGER REFERENCES plan_variants(id),
  status VARCHAR(20) DEFAULT 'active', -- 'active' | 'paused' | 'canceled' | 'expired'
  starts_at TIMESTAMP DEFAULT NOW(),
  renews_at TIMESTAMP,
  notes TEXT
);
```

#### Deliveries
```sql
CREATE TABLE deliveries (
  id SERIAL PRIMARY KEY,
  subscription_id INTEGER REFERENCES subscriptions(id),
  delivery_date TIMESTAMP NOT NULL,
  window VARCHAR(40),
  address_line1 VARCHAR(255),
  city VARCHAR(120),
  status VARCHAR(20) DEFAULT 'pending' -- 'pending' | 'preparing' | 'out_for_delivery' | 'delivered' | 'failed'
);
```

### 4.2 Pricing System Tables

#### Meal Type Prices
```sql
CREATE TABLE meal_type_prices (
  id SERIAL PRIMARY KEY,
  plan_name TEXT NOT NULL, -- 'Weight Loss' | 'Stay Fit' | 'Muscle Gain'
  meal_type TEXT NOT NULL, -- 'Breakfast' | 'Lunch' | 'Dinner'
  base_price_mad NUMERIC(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(plan_name, meal_type)
);
```

#### Discount Rules
```sql
CREATE TABLE discount_rules (
  id SERIAL PRIMARY KEY,
  discount_type TEXT NOT NULL, -- 'days_per_week' | 'duration_weeks'
  condition_value INTEGER NOT NULL,
  discount_percentage NUMERIC(5,4) NOT NULL, -- 0.0300 = 3%
  stackable BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMP NULL,
  valid_to TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4.3 E-commerce Tables

#### Products
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- in cents
  saleprice INTEGER, -- in cents
  imageurl VARCHAR(255),
  category VARCHAR(100),
  tags TEXT,
  nutritionalinfo JSONB,
  stock INTEGER DEFAULT 0,
  isactive BOOLEAN DEFAULT true,
  createdat TIMESTAMP DEFAULT NOW(),
  updatedat TIMESTAMP DEFAULT NOW()
);
```

#### Orders
```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  plan_id INTEGER,
  total_amount INTEGER NOT NULL, -- in cents
  status VARCHAR(50) DEFAULT 'pending',
  delivery_address TEXT,
  delivery_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Order Items
```sql
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER DEFAULT 1,
  price INTEGER NOT NULL -- in cents
);
```

#### Cart
```sql
CREATE TABLE cart (
  id VARCHAR(255) PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4.4 Waitlist
```sql
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
```

---

## 5. API Reference

### 5.1 Authentication APIs

#### POST `/api/auth/register`
Register a new user.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+212612345678",
  "city": "Casablanca"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

#### POST `/api/auth/login`
Authenticate user and create session.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

Sets `session-id` cookie.

#### GET `/api/auth/session`
Get current session user.

**Response:**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

#### POST `/api/auth/logout`
Destroy current session.

### 5.2 Pricing API

#### POST `/api/calculate-price`
Calculate subscription price.

**Request:**
```json
{
  "plan": "Weight Loss",
  "meals": ["Breakfast", "Lunch"],
  "days": 5,
  "duration": 4
}
```

**Response:**
```json
{
  "success": true,
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
  "totalRoundedMAD": 1746.00
}
```

### 5.3 Order APIs

#### POST `/api/orders/create`
Create a new order.

**Request:**
```json
{
  "customer": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+212612345678"
  },
  "shipping": {
    "address": "123 Main St",
    "city": "Casablanca",
    "postalCode": "20000"
  },
  "order": {
    "mealPlan": {
      "planId": "weight-loss",
      "price": 1746.00
    },
    "shipping": 0
  }
}
```

**Response:**
```json
{
  "success": true,
  "orderId": 123,
  "userId": 1,
  "message": "Order created successfully"
}
```

### 5.4 Cart APIs

#### GET `/api/cart`
Get current user's cart.

#### POST `/api/cart/add`
Add item to cart.

**Request:**
```json
{
  "productId": 1,
  "quantity": 2
}
```

#### POST `/api/cart/remove`
Remove item from cart.

#### POST `/api/cart/update`
Update cart item quantity.

#### POST `/api/cart/clear`
Clear entire cart.

### 5.5 Admin APIs

See [Admin API Documentation](./api/admin.md) for complete admin API reference.

---

## 6. Authentication & Authorization

### 6.1 Authentication Flow

1. User submits credentials via `/api/auth/login`
2. Server validates credentials
3. Server creates session (UUID, 7-day expiry)
4. Server sets `session-id` cookie
5. Middleware checks cookie on protected routes

### 6.2 Session Management

**Session Storage:**
- Database table: `sessions`
- Cookie name: `session-id`
- Expiration: 7 days
- HttpOnly: Yes
- Secure: Production only
- SameSite: Lax

### 6.3 Authorization

**Roles:**
- `customer` - Can access customer dashboard, place orders
- `admin` - Full access to admin panel
- `staff` - Limited admin access (future)

**Middleware:**
- Checks `session-id` cookie
- Validates session in database
- Checks expiration
- Redirects to login if invalid

### 6.4 Password Hashing

**Algorithm:** SHA256  
**Salt:** `fitnest-salt-2024`  
**Format:** Hex string

```typescript
hash = SHA256(password + "fitnest-salt-2024")
```

---

## 7. Business Logic

### 7.1 Pricing Calculation

**Location:** `/api/calculate-price`

**Steps:**
1. Get base meal prices from `meal_type_prices`
2. Calculate daily price (sum of selected meals)
3. Calculate gross weekly (daily × days per week)
4. Apply days discount (exact match: 5, 6, or 7 days)
5. Apply duration discount (>= threshold: 2, 4, 8, 12 weeks)
6. Calculate total (final weekly × duration)

**Example:**
- Plan: Weight Loss
- Meals: Breakfast (45 MAD) + Lunch (55 MAD) = 100 MAD/day
- Days: 5 days/week
- Duration: 4 weeks
- Gross weekly: 500 MAD
- Days discount (3%): -15 MAD = 485 MAD
- Duration discount (10%): -48.50 MAD = 436.50 MAD
- Total: 436.50 × 4 = 1,746 MAD

### 7.2 Order Flow

1. Customer selects meal plan and options
2. Price calculated via `/api/calculate-price`
3. Customer proceeds to checkout
4. Order created via `/api/orders/create`
5. User account created if needed
6. Order items added
7. Cart cleared
8. Confirmation email sent

### 7.3 Subscription Management

**Statuses:**
- `active` - Currently delivering
- `paused` - Temporarily paused
- `canceled` - Cancelled by user
- `expired` - Subscription ended

**Operations:**
- Pause: Customer can pause (72-hour notice)
- Resume: Customer can resume with smart date calculation
- Cancel: Customer can cancel subscription

### 7.4 Delivery System

**Generation:**
- Based on selected days and weeks
- Creates delivery entries for each date
- All start as "pending"

**Status Flow:**
```
pending → preparing → out_for_delivery → delivered
                ↓
             failed
```

**Admin Operations:**
- View all pending deliveries
- Mark as delivered (individual or bulk)
- Filter by date, customer, plan

---

## 8. Admin Panel

### 8.1 Access

**URL:** `http://localhost:3002/admin`  
**Authentication:** Admin role required  
**Default Admin:**
- Email: `chihab@ekwip.ma`
- Password: `FITnest123!`

### 8.2 Features

**Dashboard:**
- Revenue statistics
- Active subscriptions count
- Pending deliveries
- Recent orders
- Popular plans

**Customer Management:**
- View all customers
- Customer details
- Order history
- Subscription status

**Product Management:**
- Meals (CRUD)
- Meal Plans (CRUD)
- Snacks (CRUD)
- Express Shop items
- Accessories

**Order Management:**
- All orders
- Subscriptions
- Order status updates
- Order details

**Pricing Management:**
- Meal prices (per plan/meal type)
- Discount rules
- Price simulator

**Delivery Management:**
- Pending deliveries
- Mark as delivered
- Bulk operations
- Delivery calendar

**Waitlist:**
- View waitlist entries
- Export to CSV
- Filter and search

### 8.3 Navigation

See `apps/web/app/admin/admin-layout.tsx` for navigation structure.

---

## 9. Development Workflow

### 9.1 Local Setup

**Prerequisites:**
- Node.js 20+
- pnpm
- Docker (for local database)

**Setup Steps:**
1. Clone repository
2. Install dependencies: `pnpm install`
3. Start database: `docker-compose up -d`
4. Set up environment: Copy `.env.example` to `.env`
5. Run migrations: See database setup
6. Start dev server: `pnpm dev`

### 9.2 Environment Variables

**Required:**
```env
DATABASE_URL=postgresql://user:password@localhost:5433/dbname
```

**Optional:**
```env
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
EMAIL_SERVER_HOST=
EMAIL_SERVER_PORT=
EMAIL_SERVER_USER=
EMAIL_SERVER_PASSWORD=
```

### 9.3 Database Setup

**Local (Docker):**
```bash
docker-compose up -d
```

**Connection:**
- Host: localhost
- Port: 5433
- Database: fitnest_db
- User: fitnest
- Password: fitnest_dev_password

**Migrations:**
```bash
# Apply migrations
Get-Content packages/db/migrations/0000_ordinary_black_crow.sql | docker exec -i fitnest-postgres psql -U fitnest -d fitnest_db
```

### 9.4 Code Organization

**File Naming:**
- React components: `PascalCase.tsx`
- Utility files: `kebab-case.ts`
- API routes: `route.ts`
- Pages: `page.tsx`

**Component Structure:**
```typescript
// 1. Imports
import { useState } from 'react'

// 2. Types/Interfaces
interface Props {
  // ...
}

// 3. Component
export default function Component({ props }: Props) {
  // 4. Hooks
  const [state, setState] = useState()
  
  // 5. Handlers
  const handleClick = () => {}
  
  // 6. Render
  return <div>...</div>
}
```

### 9.5 Testing

**Manual Testing:**
- Test all user flows
- Test admin operations
- Test API endpoints
- Test error cases

**Automated Testing:**
- Unit tests (to be added)
- Integration tests (to be added)
- E2E tests (to be added)

---

## 10. Deployment

### 10.1 Production Environment

**Hosting:** Vercel  
**Database:** Neon PostgreSQL  
**Domain:** fitnest.ma

### 10.2 Deployment Process

1. Push to `main` branch
2. Vercel automatically builds and deploys
3. Database migrations run automatically
4. Environment variables set in Vercel dashboard

### 10.3 Environment Configuration

**Vercel Settings:**
- Build Command: `pnpm build`
- Output Directory: `.next`
- Install Command: `pnpm install`

**Environment Variables:**
- Set in Vercel dashboard
- `DATABASE_URL` - Production database
- Email credentials
- API keys

---

## 11. Troubleshooting

### 11.1 Common Issues

**Database Connection Failed:**
- Check `DATABASE_URL` environment variable
- Verify database is running
- Check network connectivity

**Authentication Not Working:**
- Check session cookie
- Verify session in database
- Check session expiration

**Price Calculation Wrong:**
- Verify meal prices in database
- Check discount rules
- Review calculation logic

**Admin Panel Not Accessible:**
- Verify admin role in database
- Check session authentication
- Review middleware configuration

### 11.2 Debug Tools

**API Diagnostics:**
- `/api/db-check` - Database connection
- `/api/system-diagnostic` - System status
- `/api/deployment-check` - Deployment status

**Admin Diagnostics:**
- `/admin/system-diagnostic` - Admin system check
- `/admin/debug-database` - Database debug

### 11.3 Logs

**Server Logs:**
- Check Vercel logs for production
- Check terminal for local development

**Database Logs:**
```bash
docker-compose logs -f postgres
```

---

## Appendix

### A. API Route List

See [API Documentation](./api/routes.md) for complete route list.

### B. Database Schema Diagrams

See [Database Documentation](./database/schema.md) for schema details.

### C. Business Requirements

See `PROJECT_AUDIT.md` for business model details.

### D. Cleanup Status

See `CLEANUP_PLAN.md` for cleanup progress.

---

**Document Version:** 2.0  
**Last Updated:** ${new Date().toISOString()}  
**Maintained By:** Development Team  
**Auto-Generated:** Yes (updates on code changes)




