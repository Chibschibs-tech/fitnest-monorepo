# FitNest Cleanup & Restructuring Plan

## Phase 1: Critical Cleanup (Week 1)

### 1.1 Delete Wrong Admin Panel
**Priority:** 🔴 CRITICAL  
**Effort:** 5 minutes  
**Risk:** Low

**Action:**
```bash
# Delete entire wrong admin app
rm -rf apps/admin/
```

**Files to delete:**
- `apps/admin/` (entire directory)

**Impact:** Removes confusion, cleans up structure

---

### 1.2 Remove Debug/Test Routes
**Priority:** 🔴 CRITICAL  
**Effort:** 2-3 hours  
**Risk:** Medium (need to verify none are used)

**API Routes to Remove:**
```
/api/debug-*
/api/test-*
/api/cart-debug*
/api/db-diagnostic
/api/email-diagnostic
/api/products-debug
/api/debug-waitlist-*
/api/auth-debug
/api/debug-login
/api/debug-sessions
/api/debug-orders*
/api/debug-cart*
/api/debug-dashboard
/api/debug-auth-status
/api/debug-meals
/api/debug-full-cart
/api/debug-cart-structure
/api/debug-current-waitlist
/api/debug-all-waitlist-data
/api/test-email*
/api/test-waitlist*
/api/test-simple
/api/test-db
/api/test-auth
/api/test-direct-email
/api/test-gmail-direct
/api/test-current-waitlist-form
/api/test-waitlist-submission
/api/cart-simple-test
/api/cart-diagnostic
/api/cart-debug-actions
/api/products-diagnostic
/api/products-check
/api/check-cart-structure
/api/check-cart-tables
/api/check-middleware
/api/check-plans
/api/db-check
/api/db-ping
/api/db-schema
/api/db-test
/api/direct-db-check
/api/schema-check
/api/table-structure
/api/system-diagnostic
/api/complete-db-diagnostic
/api/deployment-diagnostic
/api/deployment-check
/api/email-diagnostic
/api/health-check (keep /api/health)
```

**Pages to Remove:**
```
/app/test
/app/test-page
/app/api-test
/app/cart-test
/app/cart-fix
/app/debug
/app/debug-login-test
/app/debug-meal-plan
/app/debug-dashboard-api
/app/deployment-test
/app/email-test-simple
/app/test-direct-email
/app/test-waitlist-email
/app/complete-diagnostic
/app/fix-database
/app/migration-control
/app/clear-test-data
/app/database-docs
/app/database-visualization
```

**Admin Debug Pages to Remove:**
```
/app/admin/auth-debug
/app/admin/debug-database
/app/admin/debug-products
/app/admin/email-diagnostic (or move to dev-only)
/app/admin/system-diagnostic (or move to dev-only)
/app/admin/email-test
```

**Action Plan:**
1. Create `scripts/cleanup-debug-routes.js` to list all files
2. Review each to ensure not used in production
3. Move critical ones to `/dev/` folder if needed
4. Delete confirmed unused ones
5. Update middleware to remove public route entries

---

### 1.3 Consolidate Database Schemas
**Priority:** 🟡 HIGH  
**Effort:** 1-2 days  
**Risk:** High (production database)

**Current State:**
- Drizzle schema (`packages/db/src/schema.ts`)
- Bootstrap schema (`apps/web/app/api/admin/bootstrap/route.ts`)
- Legacy schemas (`apps/web/database/`)
- Production tables (actual database)

**Action Plan:**
1. **Audit Production Database:**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public'
   ORDER BY table_name;
   ```

2. **Document Actual Schema:**
   - Export current production schema
   - Create `docs/database/PRODUCTION_SCHEMA.md`

3. **Create Migration Plan:**
   - Identify which tables are actually used
   - Map old schemas to production
   - Create migration scripts

4. **Consolidate:**
   - Update Drizzle schema to match production
   - Remove unused schema files
   - Create single source of truth

---

### 1.4 Fix Admin Panel Duplication
**Priority:** 🟡 HIGH  
**Effort:** 2-3 hours  
**Risk:** Low

**Issue:** Two different layouts (`admin-layout.tsx` and `admin-sidebar.tsx`)

**Action:**
1. Determine which layout is actually used
2. Consolidate into single layout component
3. Remove duplicate navigation definitions
4. Standardize styling

---

## Phase 2: Code Quality (Week 2)

### 2.1 Standardize Naming Conventions
**Priority:** 🟡 MEDIUM  
**Effort:** 1 day  
**Risk:** Low

**Issues:**
- `saleprice` vs `sale_price`
- `imageurl` vs `image_url`
- Mixed camelCase/snake_case

**Action:**
1. Create naming convention document
2. Update database column names (if possible)
3. Update all references
4. Add linting rules

---

### 2.2 Remove Dead Code
**Priority:** 🟡 MEDIUM  
**Effort:** 1 day  
**Risk:** Low

**To Remove:**
- Unused components
- Unused utilities
- Legacy scripts (`scripts/_legacy/`)
- Unused imports
- Commented code

**Action:**
1. Use tools to find unused exports
2. Review manually
3. Delete confirmed unused code

---

### 2.3 Improve Error Handling
**Priority:** 🟡 MEDIUM  
**Effort:** 2-3 days  
**Risk:** Medium

**Current Issues:**
- Inconsistent error responses
- Exposing internal errors
- No error logging

**Action:**
1. Create error handling utility
2. Standardize error responses
3. Add proper logging
4. Hide internal errors from users

---

## Phase 3: Architecture Improvements (Week 3-4)

### 3.1 Restructure Project Folders
**Priority:** 🟢 MEDIUM  
**Effort:** 3-5 days  
**Risk:** Medium (requires careful migration)

**Proposed Structure:**
```
apps/web/
├── app/
│   ├── (public)/          # Public pages
│   │   ├── about/
│   │   ├── contact/
│   │   ├── meal-plans/
│   │   └── ...
│   ├── (auth)/            # Auth pages
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/       # Protected customer pages
│   │   ├── dashboard/
│   │   └── orders/
│   ├── (admin)/           # Admin pages
│   │   └── admin/
│   ├── api/
│   │   ├── (public)/      # Public APIs
│   │   ├── (protected)/   # Protected APIs
│   │   └── (admin)/       # Admin APIs
│   └── (dev)/             # Dev-only pages (dev mode)
│       └── debug/
├── components/
│   ├── ui/                # shadcn components
│   ├── layout/            # Layout components
│   ├── features/          # Feature components
│   │   ├── cart/
│   │   ├── meals/
│   │   └── orders/
│   └── admin/             # Admin components
├── lib/
│   ├── db/                # Database utilities
│   ├── auth/              # Auth utilities
│   ├── pricing/           # Pricing logic
│   ├── email/             # Email utilities
│   └── utils/             # General utilities
├── hooks/                 # Custom hooks
├── types/                 # TypeScript types
└── docs/                  # Documentation
```

**Migration Steps:**
1. Create new folder structure
2. Move files incrementally
3. Update imports
4. Test thoroughly
5. Remove old structure

---

### 3.2 Separate Admin from Main App
**Priority:** 🟢 LOW  
**Effort:** 1 week  
**Risk:** High

**Option A: Keep in same app (Recommended)**
- Simpler deployment
- Shared components
- Current approach

**Option B: Separate admin app**
- Better isolation
- Different deployment
- More complex

**Recommendation:** Keep in same app but better organize

---

### 3.3 Database Client Consolidation
**Priority:** 🟡 MEDIUM  
**Effort:** 2-3 days  
**Risk:** Medium

**Current State:**
- Drizzle schema (not used?)
- Supabase client (legacy?)
- Raw SQL with Neon

**Action:**
1. Choose one approach (recommend raw SQL with Neon)
2. Remove unused clients
3. Create unified database service
4. Update all references

---

## Phase 4: Documentation & Testing (Week 5)

### 4.1 Create API Documentation
**Priority:** 🟡 MEDIUM  
**Effort:** 2-3 days

**Action:**
1. Document all production APIs
2. Create OpenAPI/Swagger spec
3. Add request/response examples
4. Document error codes

---

### 4.2 Add Testing
**Priority:** 🟢 LOW  
**Effort:** Ongoing

**Action:**
1. Set up Jest/Vitest
2. Add unit tests for utilities
3. Add integration tests for APIs
4. Add E2E tests for critical flows

---

## Implementation Priority

### Must Do (Before New Features):
1. ✅ Delete wrong admin panel
2. ✅ Remove debug routes
3. ✅ Fix admin panel duplication
4. ✅ Document actual database schema

### Should Do (Soon):
1. Consolidate database schemas
2. Standardize naming
3. Improve error handling
4. Remove dead code

### Nice to Have (Later):
1. Restructure folders
2. Add testing
3. Create API docs
4. Separate admin (if needed)

---

## Risk Assessment

**High Risk:**
- Database schema consolidation (production data)
- Restructuring folders (many imports to update)

**Medium Risk:**
- Removing debug routes (might be used)
- Database client consolidation

**Low Risk:**
- Deleting wrong admin
- Removing dead code
- Standardizing naming

---

## Estimated Timeline

- **Week 1:** Critical cleanup (Phase 1)
- **Week 2:** Code quality (Phase 2)
- **Week 3-4:** Architecture (Phase 3)
- **Week 5:** Documentation (Phase 4)

**Total:** ~5 weeks for complete cleanup

**Minimum Viable Cleanup:** 1 week (Phase 1 only)




