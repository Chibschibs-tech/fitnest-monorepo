# Clarification Summary - FitNest Architecture

**Date:** 2025-12-07  
**Status:** ✅ Critical Questions Answered

---

## ✅ Answers Received

### 1. Pricing System
**Q:** Which pricing system is active?  
**A:** Database-driven (`meal_type_prices`, `discount_rules` tables)  
**Action:** ✅ Created missing `pricing-calculator.ts` file

### 2. Payment Integration
**Q:** Is payment implemented?  
**A:** Not yet. Plan for COD, Wire Transfer, Berexia (credit card)  
**Action:** 📋 Clean existing payment code, plan structure

### 3. Subscriptions vs Orders
**Q:** What's the relationship?  
**A:** 
- **Subscriptions** = Meal plan subscriptions (recurring)
- **Orders** = Express Shop one-time purchases (protein bars, granola, etc.)
- **Deliveries** = Delivery instances
  - Within subscriptions: deliveries are the "orders" (e.g., 1-week subscription with 48h delivery = 3 deliveries)
  - Within Express Shop: deliveries for one-time purchases

**Action:** ✅ Documented in `ARCHITECTURE_CLARIFIED.md`

### 4. Database Schema
**Q:** Which schema is source of truth?  
**A:** Drizzle schema, but check what's in it (should be most developed)  
**Action:** 📋 Review Drizzle schema and add missing tables

### 5. Missing File
**Q:** What about `pricing-calculator.ts`?  
**A:** User doesn't know  
**Action:** ✅ Created file based on usage patterns in codebase

---

## 📊 Updated Mastery: ~85%

**Clarified:**
- ✅ Pricing system architecture
- ✅ Payment status and plan
- ✅ Subscription/Order/Delivery relationships
- ✅ Missing file created

**Still Exploring:**
- Frontend state management (70%)
- Component architecture (65%)
- Business logic edge cases (60%)

---

## 📋 Next Steps

1. Review Drizzle schema completeness
2. Plan payment method structure
3. Continue frontend exploration
4. Document business logic
5. Reach 90%+ mastery

---

**Status:** ✅ Critical blockers removed  
**Ready for:** Continued exploration




