# Quick Fix - Database Connection Error

**Error:** `TypeError: fetch failed`  
**Solution:** Check DATABASE_URL configuration

---

## 🎯 Immediate Action

1. **Visit this URL to diagnose:**
   ```
   http://localhost:3002/api/db/check-connection
   ```

2. **What to check:**
   - Is DATABASE_URL set? (will show in response)
   - Is connection working? (will test it)
   - What's the error? (will show details)

3. **Based on result:**
   - If DATABASE_URL missing → Set it in `apps/web/.env.local`
   - If connection fails → Check URL format
   - If connected → Try `/api/cart/setup-safe` instead

---

## 📝 Setting DATABASE_URL

### Create/Edit: `apps/web/.env.local`

**For Neon Database:**
```env
DATABASE_URL=postgresql://user:password@host.neon.tech/database?sslmode=require
```

**For Local Database (if supported):**
```env
DATABASE_URL=postgresql://fitnest:fitnest_dev_password@localhost:5433/fitnest_db
```

---

## 🔄 After Setting DATABASE_URL

1. **Restart dev server:**
   - Stop current server (Ctrl+C)
   - Run: `pnpm dev`

2. **Test connection:**
   - Visit: `http://localhost:3002/api/db/check-connection`

3. **Setup cart:**
   - Visit: `http://localhost:3002/api/cart/setup-safe`

---

**Status:** Waiting for DATABASE_URL configuration  
**Next:** Check `/api/db/check-connection` for details




