# Database Connection Fix

**Issue:** `TypeError: fetch failed` when trying to setup cart_items table

**Root Cause:** The code uses `@neondatabase/serverless` which expects a Neon database URL, but you may be using a local PostgreSQL database.

---

## 🔍 Diagnosis

### Step 1: Check Database Connection
Visit: `http://localhost:3002/api/db/check-connection`

This will tell you:
- If DATABASE_URL is set
- If connection is working
- What the issue is

---

## 🔧 Solution Options

### Option 1: Use Local PostgreSQL (Recommended for Development)

1. **Check your `.env.local` file in `apps/web/`**
   - If it doesn't exist, create it

2. **Add DATABASE_URL:**
   ```env
   DATABASE_URL=postgresql://fitnest:fitnest_dev_password@localhost:5433/fitnest_db
   ```

3. **However**, the code uses `@neondatabase/serverless` which may not work with local PostgreSQL.

### Option 2: Use Neon Database (Production)

If you're using Neon (serverless PostgreSQL):
1. Get your Neon database URL
2. Add to `.env.local`:
   ```env
   DATABASE_URL=postgresql://user:password@host/database?sslmode=require
   ```

### Option 3: Fix Database Connection Code

The current code uses Neon HTTP client which may not work with local PostgreSQL. We need to check if we should use a different client for local development.

---

## 🚀 Quick Fix

1. **Check if database is running:**
   ```bash
   docker-compose ps
   ```
   ✅ Should show: `fitnest-postgres` is `Up` and `healthy`

2. **Check DATABASE_URL:**
   - Visit: `http://localhost:3002/api/db/check-connection`
   - This will show if DATABASE_URL is set and if connection works

3. **Set DATABASE_URL:**
   - Create `apps/web/.env.local` if it doesn't exist
   - Add: `DATABASE_URL=postgresql://fitnest:fitnest_dev_password@localhost:5433/fitnest_db`

4. **Restart dev server:**
   ```bash
   # Stop current server (Ctrl+C)
   # Then restart
   pnpm dev
   ```

5. **Try setup again:**
   - Visit: `http://localhost:3002/api/cart/setup-safe`
   - This has better error messages

---

## ⚠️ Important Note

The code uses `@neondatabase/serverless` which is designed for Neon's HTTP API. For local PostgreSQL, you might need to:

1. Use a different database client (like `pg` or `postgres`)
2. Or ensure your DATABASE_URL points to Neon

**Check:** What database are you using?
- Local PostgreSQL (Docker) → May need code changes
- Neon (serverless) → Should work with current code

---

## 🔍 Diagnostic Endpoints

1. **Check Connection:** `http://localhost:3002/api/db/check-connection`
2. **Database Diagnostic:** `http://localhost:3002/api/db-diagnostic`
3. **Safe Cart Setup:** `http://localhost:3002/api/cart/setup-safe`

---

**Next Steps:**
1. Visit `/api/db/check-connection` to diagnose
2. Set DATABASE_URL correctly
3. Restart server
4. Try setup again




