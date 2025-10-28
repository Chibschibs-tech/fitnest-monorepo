# Fitnest.ma Pricing System Documentation

## Overview
The Fitnest.ma pricing system implements a flexible subscription model with volume and duration-based discounts. The system supports custom delivery schedules across different subscription periods.

## Business Rules

### Subscription Duration Options
- **1 Week**: Minimum 3 delivery days required
- **2 Weeks**: Minimum 6 delivery days required  
- **1 Month**: Minimum 10 delivery days required

### Delivery Day Requirements
- Customers can select any days within their subscription period
- No weekly limits - customers can distribute days freely across the subscription
- System validates minimum days based on subscription duration

### Pricing Structure

#### Base Pricing
- **Daily Rate**: 80 MAD per day (base price before discounts)
- Applied to each selected delivery day

#### Volume Discounts (Applied to Subtotal)
- **5+ days**: 5% discount
- **10+ days**: 10% discount  
- **15+ days**: 15% discount
- **20+ days**: 20% discount

#### Duration Discounts (Applied After Volume Discount)
- **2 Weeks**: 5% additional discount
- **1 Month**: 10% additional discount
- **1 Week**: No duration discount

## Pricing Calculation Flow

### Step 1: Calculate Subtotal
\`\`\`
Subtotal = Daily Rate × Number of Selected Days
\`\`\`

### Step 2: Apply Volume Discount
\`\`\`
Volume Discount = Subtotal × Volume Discount Rate
Subtotal After Volume = Subtotal - Volume Discount
\`\`\`

### Step 3: Apply Duration Discount
\`\`\`
Duration Discount = Subtotal After Volume × Duration Discount Rate
Final Total = Subtotal After Volume - Duration Discount
\`\`\`

### Step 4: Calculate Total Savings
\`\`\`
Total Savings = Volume Discount + Duration Discount
\`\`\`

## Example Calculations

### Example 1: 1 Week, 5 Days
- Base: 80 MAD × 5 days = 400 MAD
- Volume Discount (5%): 400 × 0.05 = 20 MAD
- Duration Discount: 0 MAD (1 week)
- **Final Total: 380 MAD**

### Example 2: 1 Month, 12 Days
- Base: 80 MAD × 12 days = 960 MAD
- Volume Discount (10%): 960 × 0.10 = 96 MAD
- After Volume: 960 - 96 = 864 MAD
- Duration Discount (10%): 864 × 0.10 = 86.40 MAD
- **Final Total: 777.60 MAD**
- **Total Savings: 182.40 MAD**

## Validation Rules

### Minimum Day Requirements
- System validates minimum days based on subscription duration
- Error messages guide users to select sufficient days
- No maximum day limits within subscription period

### Calendar Validation
- Users can select any available dates within subscription period
- System prevents selection of past dates
- Unavailable dates are clearly marked

## Display Logic

### Pricing Breakdown Display
- **1 Week Subscriptions**: Shows daily cost and weekly cost
- **Multi-Week Subscriptions**: Shows daily cost, skips weekly cost, goes to subtotal
- **All Subscriptions**: Shows volume discount, duration discount, and total savings when applicable

### User-Friendly Benefits
- Replaces technical discount percentages with benefit descriptions
- Shows savings amounts prominently
- Clear breakdown of all costs and discounts

## Error Handling

### Validation Errors
- Clear error messages for insufficient day selection
- Helpful guidance on minimum requirements
- Real-time validation feedback

### Pricing Errors
- Fallback to base pricing if discount calculation fails
- Error logging for debugging
- Graceful degradation of pricing features

## Technical Implementation

### Key Functions
- `calculatePricing()`: Main pricing calculation function
- `validateMealSelection()`: Validates day selection requirements
- `getPricingBreakdown()`: Returns detailed pricing information

### Data Structure
\`\`\`typescript
interface PricingResult {
  isValid: boolean
  dailyRate: number
  subtotal: number
  volumeDiscount: number
  durationDiscount: number
  totalSavings: number
  finalTotal: number
  errorMessage?: string
}
\`\`\`

## Future Enhancements

### Planned Features
- Seasonal pricing adjustments
- Loyalty program integration
- Promotional code system
- Dynamic pricing based on demand

### Scalability Considerations
- Modular discount system for easy addition of new discount types
- Configurable pricing rules
- A/B testing support for pricing strategies

---

*Last Updated: January 2025*
*Version: 2.0*
