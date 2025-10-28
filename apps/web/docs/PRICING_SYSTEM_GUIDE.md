# Fitnest.ma Pricing System - Complete Guide

## Overview

The Fitnest.ma pricing system is a **dynamic, database-driven engine** that calculates meal subscription prices based on:
- Selected meal plan (Weight Loss, Stay Fit, Muscle Gain)
- Chosen meals per day (Breakfast, Lunch, Dinner)
- Number of days per week (1-7)
- Subscription duration (1-12+ weeks)

---

## Core Principles

### 1. Meal-Based Pricing

**The fundamental unit is the MEAL, not the day.**

Each meal has a base price that varies by:
- **Plan type** (different nutritional requirements)
- **Meal type** (Breakfast vs. Lunch vs. Dinner)

### 2. Discount Hierarchy

Discounts are applied in this order:
1. **Days per week discount** (applied to weekly subtotal)
2. **Duration discount** (applied to discounted weekly price)

Discounts are **multiplicative**, not additive.

---

## Database Schema

### meal_type_prices

Stores base prices for each meal type per plan.

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

**Current Pricing (MAD):**

| Plan | Breakfast | Lunch | Dinner |
|------|-----------|-------|--------|
| Weight Loss | 45.00 | 55.00 | 50.00 |
| Stay Fit | 50.00 | 60.00 | 55.00 |
| Muscle Gain | 55.00 | 70.00 | 65.00 |

### discount_rules

Stores discount rules for days/week and duration.

\`\`\`sql
CREATE TABLE discount_rules (
  id SERIAL PRIMARY KEY,
  discount_type TEXT NOT NULL,       -- 'days_per_week' | 'duration_weeks'
  condition_value INT NOT NULL,      -- e.g., 5 days or 4 weeks
  discount_percentage NUMERIC(5,4) NOT NULL,  -- 0.0300 = 3%
  stackable BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMP NULL,
  valid_to TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

**Current Discounts:**

**Days per Week:**
| Days | Discount | Condition |
|------|----------|-----------|
| 5 | 3% | Exact match |
| 6 | 5% | Exact match |
| 7 | 7% | Exact match |

**Duration:**
| Weeks | Discount | Condition |
|-------|----------|-----------|
| 2 | 5% | >= 2 weeks |
| 4 | 10% | >= 4 weeks |
| 8 | 15% | >= 8 weeks |
| 12 | 20% | >= 12 weeks |

---

## Calculation Logic

### Step-by-Step Process

#### Step 1: Get Base Meal Prices

Query `meal_type_prices` for selected plan and meal types.

\`\`\`sql
SELECT meal_type, base_price_mad 
FROM meal_type_prices 
WHERE plan_name = 'Weight Loss' 
  AND meal_type IN ('Breakfast', 'Lunch')
  AND is_active = true;
\`\`\`

Result:
- Breakfast: 45 MAD
- Lunch: 55 MAD

#### Step 2: Calculate Daily Price

Sum all selected meal prices.

\`\`\`typescript
pricePerDay = 45 + 55 = 100 MAD
\`\`\`

#### Step 3: Calculate Gross Weekly

Multiply daily price by number of days.

\`\`\`typescript
grossWeekly = 100 × 5 = 500 MAD
\`\`\`

#### Step 4: Apply Days Discount

Check for exact match in `discount_rules` where `discount_type = 'days_per_week'`.

\`\`\`sql
SELECT discount_percentage 
FROM discount_rules 
WHERE discount_type = 'days_per_week' 
  AND condition_value = 5
  AND is_active = true;
\`\`\`

Result: 0.0300 (3%)

Apply discount:
\`\`\`typescript
daysDiscount = 500 × 0.03 = 15 MAD
weeklyAfterDaysDiscount = 500 - 15 = 485 MAD
\`\`\`

#### Step 5: Apply Duration Discount

Find highest applicable duration discount (where `condition_value <= duration`).

\`\`\`sql
SELECT discount_percentage, condition_value
FROM discount_rules 
WHERE discount_type = 'duration_weeks' 
  AND condition_value <= 4
  AND is_active = true
ORDER BY condition_value DESC
LIMIT 1;
\`\`\`

Result: 0.1000 (10%) for 4 weeks

Apply discount:
\`\`\`typescript
durationDiscount = 485 × 0.10 = 48.50 MAD
finalWeekly = 485 - 48.50 = 436.50 MAD
\`\`\`

#### Step 6: Calculate Total

Multiply final weekly price by duration.

\`\`\`typescript
totalPrice = 436.50 × 4 = 1,746 MAD
\`\`\`

---

## Complete Example

### Input
\`\`\`json
{
  "plan": "Weight Loss",
  "meals": ["Breakfast", "Lunch"],
  "days": 5,
  "duration": 4
}
\`\`\`

### Calculation Breakdown

| Step | Description | Calculation | Result |
|------|-------------|-------------|--------|
| 1 | Base meal prices | 45 + 55 | 100 MAD/day |
| 2 | Gross weekly | 100 × 5 | 500 MAD/week |
| 3 | Days discount (3%) | 500 × 0.03 | -15 MAD |
| 4 | Weekly after days discount | 500 - 15 | 485 MAD/week |
| 5 | Duration discount (10%) | 485 × 0.10 | -48.50 MAD |
| 6 | Final weekly | 485 - 48.50 | 436.50 MAD/week |
| 7 | **Total (4 weeks)** | 436.50 × 4 | **1,746 MAD** |

### Savings Breakdown

| Discount Type | Amount | Percentage |
|---------------|--------|------------|
| Days (5/week) | 60 MAD | 3% |
| Duration (4 weeks) | 194 MAD | 10% |
| **Total Savings** | **254 MAD** | **12.7%** |

**Original price:** 2,000 MAD (100 × 5 × 4)  
**Final price:** 1,746 MAD  
**You save:** 254 MAD (12.7%)

---

## API Reference

### POST /api/calculate-price

Calculate subscription price based on selections.

**Request:**
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

**Validation Rules:**
- `plan`: Must exist in `meal_type_prices`
- `meals`: Array of 1-3 meal types, must exist for selected plan
- `days`: Integer 1-7
- `duration`: Integer >= 1

**Error Responses:**

400 Bad Request:
\`\`\`json
{
  "error": "Invalid input",
  "details": [
    {
      "field": "days",
      "message": "Days must be between 1 and 7"
    }
  ]
}
\`\`\`

400 Bad Request:
\`\`\`json
{
  "error": "Some meals not found",
  "missing": ["InvalidMeal"]
}
\`\`\`

---

## Admin Management

### Accessing Pricing Admin

**URL:** `/admin/pricing`

**Tabs:**
1. **Price Simulator** - Test calculations in real-time
2. **Meal Prices** - Manage base prices per plan/meal
3. **Discount Rules** - Configure discount tiers

### Price Simulator

Test any combination without affecting production:

1. Select plan (Weight Loss, Stay Fit, Muscle Gain)
2. Choose meals (checkboxes)
3. Set days per week (1-7)
4. Set duration (1-12+ weeks)
5. Click "Calculate Price"

View detailed breakdown:
- Price per day
- Gross weekly
- Applied discounts
- Final weekly
- Total price

### Managing Meal Prices

**List View:**
- See all meal prices organized by plan
- Filter by plan or meal type
- Toggle active/inactive status

**Edit Price:**
1. Click edit icon
2. Modify `base_price_mad`
3. Toggle `is_active` if needed
4. Save changes

**Create New Price:**
1. Click "Add Meal Price"
2. Select plan name
3. Select meal type
4. Enter base price (MAD)
5. Set active status
6. Submit

**Delete Price:**
- Click delete icon
- Confirm deletion
- ⚠️ Prices used in active subscriptions cannot be deleted

### Managing Discount Rules

**List View:**
- See all discount rules
- Filter by type (days_per_week, duration_weeks)
- View condition and percentage
- Toggle active status

**Edit Rule:**
1. Click edit icon
2. Modify:
   - `condition_value` (days or weeks)
   - `discount_percentage` (0.0000-1.0000)
   - `stackable` (true/false)
   - `is_active` (true/false)
   - Date range (optional)
3. Save changes

**Create New Rule:**
1. Click "Add Discount Rule"
2. Select discount type
3. Set condition (e.g., 5 days or 4 weeks)
4. Set percentage (e.g., 0.0500 for 5%)
5. Choose if stackable
6. Set date range (optional)
7. Submit

**Special Offers:**
- Use `discount_type = 'special_offer'`
- Set `valid_from` and `valid_to` dates
- Can be non-stackable for exclusive promos

---

## Testing

### Test Page

**URL:** `/admin/pricing/test`

**Features:**
- Automated test suite
- 5 predefined test cases
- Run individual or all tests
- View detailed results

**Test Cases:**

1. **Minimum Case**
   - 1 meal, 3 days, 1 week
   - No discounts
   - Expected: 135 MAD

2. **Combined Discounts**
   - 2 meals, 5 days, 4 weeks
   - 3% + 10% discounts
   - Expected: 1,746 MAD

3. **Maximum Discounts**
   - 3 meals, 7 days, 12 weeks
   - 7% + 20% discounts
   - Calculates actual price

4. **Invalid Meal**
   - Non-existent meal type
   - Should return 400 error

5. **Invalid Plan**
   - Non-existent plan
   - Should return 400 error

### Manual Testing

**Test Checklist:**

Pricing Calculation:
- [ ] Single meal, various days
- [ ] Multiple meals, various days
- [ ] All meal combinations
- [ ] All discount tiers
- [ ] Edge cases (1 day, 1 meal)
- [ ] Boundary cases (7 days, 3 meals, 12 weeks)

Admin Operations:
- [ ] Create new meal price
- [ ] Update existing meal price
- [ ] Delete unused meal price
- [ ] Create new discount rule
- [ ] Update existing discount rule
- [ ] Delete unused discount rule
- [ ] Toggle active/inactive status

API Testing:
- [ ] Valid request returns 200
- [ ] Invalid plan returns 400
- [ ] Invalid meal returns 400
- [ ] Invalid days/duration returns 400
- [ ] Missing fields returns 400

---

## Edge Cases & Special Scenarios

### Scenario 1: Single Meal, Full Week
\`\`\`json
{
  "plan": "Weight Loss",
  "meals": ["Breakfast"],
  "days": 7,
  "duration": 1
}
\`\`\`

**Calculation:**
- Daily: 45 MAD
- Gross weekly: 45 × 7 = 315 MAD
- Days discount (7%): 315 × 0.07 = 22.05 MAD
- Final: 315 - 22.05 = **292.95 MAD**

### Scenario 2: All Meals, Long Duration
\`\`\`json
{
  "plan": "Muscle Gain",
  "meals": ["Breakfast", "Lunch", "Dinner"],
  "days": 7,
  "duration": 12
}
\`\`\`

**Calculation:**
- Daily: 55 + 70 + 65 = 190 MAD
- Gross weekly: 190 × 7 = 1,330 MAD
- Days discount (7%): 1,330 × 0.07 = 93.10 MAD
- Weekly after days: 1,236.90 MAD
- Duration discount (20%): 1,236.90 × 0.20 = 247.38 MAD
- Final weekly: 989.52 MAD
- Total: 989.52 × 12 = **11,874.24 MAD**

### Scenario 3: Weekend Only
\`\`\`json
{
  "plan": "Stay Fit",
  "meals": ["Lunch", "Dinner"],
  "days": 2,
  "duration": 4
}
\`\`\`

**Calculation:**
- Daily: 60 + 55 = 115 MAD
- Gross weekly: 115 × 2 = 230 MAD
- Days discount: None (no 2-day discount)
- Duration discount (10%): 230 × 0.10 = 23 MAD
- Final weekly: 207 MAD
- Total: 207 × 4 = **828 MAD**

---

## Common Issues & Troubleshooting

### Issue 1: Price Calculation Incorrect

**Symptoms:**
- Total doesn't match expected
- Discounts not applied
- Wrong discount percentage

**Solutions:**
1. Check meal prices in database:
   \`\`\`sql
   SELECT * FROM meal_type_prices 
   WHERE plan_name = 'Plan Name' 
   AND is_active = true;
   \`\`\`

2. Verify discount rules:
   \`\`\`sql
   SELECT * FROM discount_rules 
   WHERE is_active = true 
   ORDER BY discount_type, condition_value;
   \`\`\`

3. Test calculation manually with price simulator

4. Check API response for `discountsApplied` array

### Issue 2: Meal Not Found

**Error:** `"Some meals not found"`

**Causes:**
- Meal type doesn't exist in database
- Meal is inactive (`is_active = false`)
- Typo in meal type name
- Plan doesn't have that meal type

**Solutions:**
1. Check exact meal type spelling
2. Verify meal exists for selected plan
3. Check `is_active` status
4. Add meal if missing

### Issue 3: No Discount Applied

**Symptoms:**
- Discount expected but not applied
- `discountsApplied` array is empty

**Causes:**
- Discount rule is inactive
- Condition value doesn't match
- Date range excludes current date
- Stackable setting incorrect

**Solutions:**
1. Check rule status:
   \`\`\`sql
   SELECT * FROM discount_rules 
   WHERE condition_value = 5 
   AND discount_type = 'days_per_week';
   \`\`\`

2. Verify date range:
   \`\`\`sql
   SELECT * FROM discount_rules 
   WHERE (valid_from IS NULL OR valid_from <= NOW())
   AND (valid_to IS NULL OR valid_to >= NOW());
   \`\`\`

3. Ensure rule is active: `is_active = true`

### Issue 4: Discount Stacking Problem

**Symptoms:**
- Multiple discounts not applying
- Only one discount applied

**Causes:**
- Stackable set to false
- Wrong discount type priority

**Solutions:**
1. Check stackable setting:
   \`\`\`sql
   SELECT discount_type, condition_value, stackable 
   FROM discount_rules 
   WHERE is_active = true;
   \`\`\`

2. Remember: days discount always applied first, then duration

3. Special offers may override other discounts if not stackable

---

## Business Rules Summary

### Pricing Rules

1. **Base prices** are per meal, not per day
2. **Plans** have different pricing (Muscle Gain > Stay Fit > Weight Loss)
3. **Breakfast** is typically cheapest, **Lunch** most expensive
4. **All prices** are in Moroccan Dirham (MAD)

### Discount Rules

1. **Days discounts** require exact match (5, 6, or 7 days)
2. **Duration discounts** apply to any duration >= threshold
3. **Highest applicable** discount is used (not cumulative per type)
4. **Discounts stack** multiplicatively (not additively)
5. **Special offers** can override standard discounts

### Business Logic

1. **Minimum order**: 1 meal, 1 day, 1 week
2. **Maximum flexibility**: Choose any meals, any days, any duration
3. **Price transparency**: Show full breakdown to customers
4. **Savings highlighted**: Always show discount amounts
5. **Real-time calculation**: No cached prices

---

## Integration Guide

### Frontend Integration

**React Component Example:**
\`\`\`typescript
import { useState } from 'react'

export function PriceCalculator() {
  const [result, setResult] = useState(null)
  
  const calculatePrice = async () => {
    const response = await fetch('/api/calculate-price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan: 'Weight Loss',
        meals: ['Breakfast', 'Lunch'],
        days: 5,
        duration: 4
      })
    })
    
    const data = await response.json()
    setResult(data)
  }
  
  return (
    <div>
      <button onClick={calculatePrice}>Calculate</button>
      {result && (
        <div>
          <p>Total: {result.totalRoundedMAD} MAD</p>
          <p>Per day: {result.pricePerDay} MAD</p>
        </div>
      )}
    </div>
  )
}
\`\`\`

### Backend Integration

**Using in API Route:**
\`\`\`typescript
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  // Call pricing API
  const priceResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/calculate-price`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  
  const pricing = await priceResponse.json()
  
  // Use pricing in order creation
  return NextResponse.json({
    orderId: '12345',
    pricing
  })
}
\`\`\`

---

## Migration Guide

### From Old Pricing System

If migrating from the old `lib/pricing-model.ts`:

**Old System:**
- Hardcoded prices in code
- Fixed discount tiers
- Days-based calculations

**New System:**
- Database-driven prices
- Configurable discounts
- Meal-based calculations

**Migration Steps:**

1. **Create tables:**
   \`\`\`bash
   Visit /admin/create-pricing-tables
   Click "Create & Seed Tables"
   \`\`\`

2. **Import existing prices:**
   \`\`\`sql
   INSERT INTO meal_type_prices (plan_name, meal_type, base_price_mad)
   SELECT plan, meal, price FROM old_pricing_table;
   \`\`\`

3. **Import discount rules:**
   \`\`\`sql
   INSERT INTO discount_rules (discount_type, condition_value, discount_percentage)
   SELECT type, condition, percentage FROM old_discounts_table;
   \`\`\`

4. **Update API calls:**
   \`\`\`typescript
   // Old
   import { calculatePrice } from '@/lib/pricing-model'
   const price = calculatePrice(selection)
   
   // New
   const response = await fetch('/api/calculate-price', {
     method: 'POST',
     body: JSON.stringify(selection)
   })
   const price = await response.json()
   \`\`\`

5. **Test thoroughly:**
   - Run all test cases
   - Compare old vs new calculations
   - Verify edge cases

---

## Performance Considerations

### Database Optimization

**Indexes (already created):**
\`\`\`sql
CREATE INDEX idx_meal_type_prices_plan ON meal_type_prices(plan_name);
CREATE INDEX idx_meal_type_prices_active ON meal_type_prices(is_active);
CREATE INDEX idx_discount_rules_type ON discount_rules(discount_type);
CREATE INDEX idx_discount_rules_active ON discount_rules(is_active);
CREATE INDEX idx_discount_rules_dates ON discount_rules(valid_from, valid_to);
\`\`\`

**Query Performance:**
- Meal price lookup: ~2ms
- Discount rules lookup: ~3ms
- Total calculation: ~10ms

### Caching Strategy

**Not Recommended:**
- Prices change frequently
- Discounts are time-sensitive
- Personalized calculations

**If Needed:**
\`\`\`typescript
// Cache meal prices for 5 minutes
const mealPrices = await cache(
  () => getMealPrices(),
  { ttl: 300 }
)
\`\`\`

### Rate Limiting

Implement if needed:
\`\`\`typescript
// Max 100 calculations per user per minute
const rateLimiter = new RateLimiter({
  windowMs: 60000,
  max: 100
})
\`\`\`

---

## FAQ

**Q: Can customers mix meals from different plans?**
A: No, each subscription is for a single plan. They must choose one plan and select meals from that plan only.

**Q: What if a meal price changes mid-subscription?**
A: Active subscriptions keep their original pricing. New calculations use updated prices.

**Q: Can we offer custom discounts to specific customers?**
A: Yes, use `special_offer` discount type with specific date ranges and mark as non-stackable if exclusive.

**Q: How do we handle promotional periods?**
A: Create discount rules with `valid_from` and `valid_to` dates. Set `is_active = true` during promo.

**Q: Can discounts be deactivated without deleting?**
A: Yes, set `is_active = false`. This preserves the rule but stops applying it.

**Q: What happens if database queries fail?**
A: API returns 500 error. Frontend should handle gracefully and show fallback message.

**Q: Can we add new meal types (e.g., Snacks)?**
A: Yes, just add new rows to `meal_type_prices` with the new `meal_type`.

**Q: How do we test price changes before going live?**
A: Use the Price Simulator in admin panel. Changes are immediate but can be tested before customer-facing changes.

---

**END OF PRICING SYSTEM GUIDE**

*Last updated: January 2025*
*Version: 2.0*
