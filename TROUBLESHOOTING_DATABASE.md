# Database Connection Troubleshooting

**Error:** `TypeError: fetch failed` when accessing `/api/cart/setup`

---

## 🔍 Quick Diagnosis

### Step 1: Check Database Connection
Visit: **`http://localhost:3002/api/db/check-connection`**

This will show:
- ✅ If DATABASE_URL is set
- ✅ If connection is working
- ✅ What the exact error is

---

## 🔧 Solution

### The Issue
The code uses `@neondatabase/serverless` which:
- ✅ Works with **Neon** (serverless PostgreSQL)
- ❌ May not work with **local PostgreSQL** (Docker)

### Fix Options

#### Option 1: Use Neon Database (If you have one)
1. Get your Neon database URL
2. Add to `apps/web/.env.local`:
   ```env
   DATABASE_URL=postgresql://user:password@host/database?sslmode=require
   ```
3. Restart dev server

#### Option 2: Use Local PostgreSQL (If you want local)
The current code needs to be updated to support local PostgreSQL. For now:
1. Ensure DATABASE_URL points to Neon
2. Or we can update the code to support both

---

## 🚀 Immediate Steps

1. **Check if DATABASE_URL is set:**
   ```bash
   # In apps/web directory
   echo $DATABASE_URL
   # Or check .env.local file
   ```

2. **Visit diagnostic endpoint:**
   ```
   http://localhost:3002/api/db/check-connection
   ```

3. **Check what it says:**
   - If "DATABASE_URL not set" → Set it in `.env.local`
   - If "Connection failed" → Check URL format
   - If "Connected" → Try setup again

---

## 📋 Expected DATABASE_URL Format

### For Neon:
```
postgresql://user:password@host.neon.tech/database?sslmode=require
```

### For Local (if we update code):
```
postgresql://fitnest:fitnest_dev_password@localhost:5433/fitnest_db
```

---

## ✅ Next Steps

1. Visit `/api/db/check-connection` to diagnose
2. Share the result so I can help fix it
3. Or set DATABASE_URL correctly and try again

---

**Current Status:** Database is running (Docker), but connection may be misconfigured


