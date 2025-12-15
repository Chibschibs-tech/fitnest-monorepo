# How to Create a Meal Plan with MP Categories

## Prerequisites

1. **Run the migration first** (if not already done):
   - Go to: `http://localhost:3002/admin/migrate-mp-categories`
   - Click "Run Migration" button
   - Wait for success message

2. **Verify categories exist**:
   - Go to: `http://localhost:3002/admin/products/mp-categories`
   - You should see 5 default categories: Keto, Low Carb, Balanced, Muscle Gain, Custom

## Steps to Create a Meal Plan

### Option 1: Through Admin UI (Recommended)

1. **Navigate to Meal Plans**:
   - Go to: `http://localhost:3002/admin/products/meal-plans`
   - Or click "Products" → "Meal Plans" in the sidebar

2. **Click "Add New Meal Plan"**:
   - The button is in the top right corner

3. **Fill in the form**:
   - **Plan Name***: e.g., "Keto Classic Plan"
   - **Description**: e.g., "A classic ketogenic meal plan for weight loss"
   - **MP Category***: Select from dropdown (e.g., "Keto")
   - **Available**: Check if you want it published

4. **Click "Create"**:
   - The meal plan will be created and linked to the selected category
   - You'll see it in the meal plans list

### Option 2: Using API (For Testing)

If you want to test via API, use this curl command:

```bash
# First, login to get session cookie
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"chihab@ekwip.ma","password":"FITnest123!"}' \
  -c cookies.txt

# Then create meal plan (replace CATEGORY_ID with actual ID from step 1)
curl -X POST http://localhost:3002/api/admin/products/meal-plans \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Test Keto Plan",
    "description": "A test ketogenic meal plan",
    "mp_category_id": 1,
    "published": true
  }'
```

## Expected Result

After creating a meal plan, you should see:

1. **In the Meal Plans list**:
   - The new meal plan appears
   - Category badge shows the selected category name
   - Status shows "Available" or "Unavailable"

2. **In the database**:
   - `meal_plans` table has a new row
   - `mp_category_id` is set to the selected category ID
   - `slug` is auto-generated from the name

3. **When editing**:
   - The category dropdown shows the current category
   - You can change it to a different category

## Troubleshooting

### "No categories available" error
- **Solution**: Run the migration first at `/admin/migrate-mp-categories`

### "Invalid category" error
- **Solution**: Make sure the category ID exists. Check `/admin/products/mp-categories`

### Category dropdown is empty
- **Solution**: 
  1. Go to `/admin/products/mp-categories`
  2. Create at least one category
  3. Refresh the meal plans page

## Example Meal Plans to Create

1. **Keto Classic**:
   - Category: Keto
   - Description: "Low-carb, high-fat meal plan for ketosis"

2. **Balanced Weekly**:
   - Category: Balanced
   - Description: "Well-rounded nutrition for everyday health"

3. **Muscle Builder**:
   - Category: Muscle Gain
   - Description: "High-protein plan for muscle growth"

4. **Low Carb Starter**:
   - Category: Low Carb
   - Description: "Reduced carbohydrate meal plan"




