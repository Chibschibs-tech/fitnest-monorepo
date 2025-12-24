# Production Database Schema

**Last Updated:** 2025-12-07  
**Source:** Local Database (matches production structure)

## Current Tables (7)

Based on Drizzle migrations, the following tables exist:

### users
- `id` (SERIAL PRIMARY KEY)
- `email` (VARCHAR(255) UNIQUE NOT NULL)
- `name` (VARCHAR(120))
- `role` (VARCHAR(20) DEFAULT 'customer')
- `password` (VARCHAR(255)) - Added for authentication
- `created_at` (TIMESTAMP DEFAULT NOW())

### meals
- `id` (SERIAL PRIMARY KEY)
- `slug` (VARCHAR(160) UNIQUE NOT NULL)
- `title` (VARCHAR(200) NOT NULL)
- `description` (TEXT)
- `kcal` (INTEGER DEFAULT 0)
- `protein` (NUMERIC(6,2))
- `carbs` (NUMERIC(6,2))
- `fat` (NUMERIC(6,2))
- `allergens` (JSONB DEFAULT '[]')
- `tags` (JSONB DEFAULT '[]')
- `image_url` (TEXT)
- `published` (BOOLEAN DEFAULT false)
- `created_at` (TIMESTAMP DEFAULT NOW())

### meal_plans
- `id` (SERIAL PRIMARY KEY)
- `slug` (VARCHAR(160) UNIQUE NOT NULL)
- `title` (VARCHAR(200) NOT NULL)
- `summary` (TEXT)
- `audience` (VARCHAR(60) NOT NULL) - 'keto' | 'lowcarb' | 'balanced' | 'muscle' | 'custom'
- `published` (BOOLEAN DEFAULT false)
- `created_at` (TIMESTAMP DEFAULT NOW())

### plan_variants
- `id` (SERIAL PRIMARY KEY)
- `meal_plan_id` (INTEGER REFERENCES meal_plans(id))
- `label` (VARCHAR(120) NOT NULL)
- `days_per_week` (INTEGER DEFAULT 5)
- `meals_per_day` (INTEGER DEFAULT 3)
- `weekly_base_price_mad` (NUMERIC(10,2) NOT NULL)
- `published` (BOOLEAN DEFAULT true)

### meal_plan_meals
- `id` (SERIAL PRIMARY KEY)
- `plan_variant_id` (INTEGER REFERENCES plan_variants(id))
- `day_index` (INTEGER NOT NULL)
- `slot_index` (INTEGER NOT NULL)
- `meal_id` (INTEGER REFERENCES meals(id))

### subscriptions
- `id` (SERIAL PRIMARY KEY)
- `user_id` (INTEGER REFERENCES users(id))
- `plan_variant_id` (INTEGER REFERENCES plan_variants(id))
- `status` (VARCHAR(20) DEFAULT 'active') - 'active' | 'paused' | 'canceled' | 'expired'
- `starts_at` (TIMESTAMP DEFAULT NOW())
- `renews_at` (TIMESTAMP)
- `notes` (TEXT)

### deliveries
- `id` (SERIAL PRIMARY KEY)
- `subscription_id` (INTEGER REFERENCES subscriptions(id))
- `delivery_date` (TIMESTAMP NOT NULL)
- `window` (VARCHAR(40))
- `address_line1` (VARCHAR(255))
- `city` (VARCHAR(120))
- `status` (VARCHAR(20) DEFAULT 'pending') - 'pending' | 'preparing' | 'out_for_delivery' | 'delivered' | 'failed'

## Additional Tables (From Bootstrap Schema)

The bootstrap route creates additional tables that may exist in production:

### products
- E-commerce products table
- Used for Express Shop

### orders
- Order management
- Links to users and products

### order_items
- Individual items in orders

### cart
- Shopping cart items

### sessions
- User session management

### meal_type_prices
- Dynamic pricing system
- Base prices per plan/meal type

### discount_rules
- Discount configuration
- Days per week and duration discounts

### waitlist
- Waitlist signups

### customers
- Extended user profiles

### delivery_status
- Delivery tracking

## Schema Notes

⚠️ **Important:** The actual production database may have additional tables created by:
- Bootstrap route (`/api/admin/bootstrap`)
- Migration scripts
- Manual SQL execution

**To get complete production schema:**
1. Connect to production database
2. Run: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
3. Export each table's structure

---

*This documentation should be updated when connecting to production database.*








