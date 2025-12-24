# API Documentation

**Last Updated:** 2025-12-24T16:30:59.757Z
**Total Routes:** 162

## Overview

This document is automatically generated from the codebase. It lists all API routes available in the FitNest application.

## Public API Routes (161)

### /apiadmin/bootstrap
- **Methods:** POST
- **File:** `\apps\web\app\api\admin\bootstrap\route.ts`

### /apiadmin/content/hero
- **Methods:** GET, POST
- **File:** `\apps\web\app\api\admin\content\hero\route.ts`

### /apiadmin/coupons
- **Methods:** GET, POST
- **File:** `\apps\web\app\api\admin\coupons\route.ts`

### /apiadmin/create-sample-data
- **Methods:** POST
- **File:** `\apps\web\app\api\admin\create-sample-data\route.ts`

### /apiadmin/customers
- **Methods:** GET, POST
- **File:** `\apps\web\app\api\admin\customers\route.ts`

### /apiadmin/customers/[id]
- **Methods:** GET, PUT, DELETE
- **File:** `\apps\web\app\api\admin\customers\[id]\route.ts`

### /apiadmin/customers/[id]/notes
- **Methods:** PUT
- **File:** `\apps\web\app\api\admin\customers\[id]\notes\route.ts`

### /apiadmin/customers/[id]/status
- **Methods:** PUT
- **File:** `\apps\web\app\api\admin\customers\[id]\status\route.ts`

### /apiadmin/customers/[id]/subscriptions
- **Methods:** GET
- **File:** `\apps\web\app\api\admin\customers\[id]\subscriptions\route.ts`

### /apiadmin/customers/[id]/subscriptions/create
- **Methods:** POST
- **File:** `\apps\web\app\api\admin\customers\[id]\subscriptions\create\route.ts`

### /apiadmin/dashboard
- **Methods:** GET
- **File:** `\apps\web\app\api\admin\dashboard\route.ts`

### /apiadmin/deliveries
- **Methods:** GET
- **File:** `\apps\web\app\api\admin\deliveries\route.ts`

### /apiadmin/deliveries/[id]/status
- **Methods:** PATCH
- **File:** `\apps\web\app\api\admin\deliveries\[id]\status\route.ts`

### /apiadmin/generate-deliveries
- **Methods:** GET, POST
- **File:** `\apps\web\app\api\admin\generate-deliveries\route.ts`

### /apiadmin/get-pending-deliveries
- **Methods:** GET
- **File:** `\apps\web\app\api\admin\get-pending-deliveries\route.ts`

### /apiadmin/init-customer-system
- **Methods:** GET, POST
- **File:** `\apps\web\app\api\admin\init-customer-system\route.ts`

### /apiadmin/init-database
- **Methods:** POST
- **File:** `\apps\web\app\api\admin\init-database\route.ts`

### /apiadmin/init-subscription-plans
- **Methods:** POST
- **File:** `\apps\web\app\api\admin\init-subscription-plans\route.ts`

### /apiadmin/mark-delivery-delivered
- **Methods:** POST
- **File:** `\apps\web\app\api\admin\mark-delivery-delivered\route.ts`

### /apiadmin/meal-plans
- **Methods:** GET, POST
- **File:** `\apps\web\app\api\admin\meal-plans\route.ts`

### /apiadmin/meal-plans/[id]/variants
- **Methods:** GET
- **File:** `\apps\web\app\api\admin\meal-plans\[id]\variants\route.ts`

### /apiadmin/meal-plans/id
- **Methods:** PUT, DELETE
- **File:** `\apps\web\app\api\admin\meal-plans\id\route.ts`

### /apiadmin/meal-plans/id/items
- **Methods:** GET, POST
- **File:** `\apps\web\app\api\admin\meal-plans\id\items\route.ts`

### /apiadmin/meal-plans/id/items/itemid
- **Methods:** DELETE
- **File:** `\apps\web\app\api\admin\meal-plans\id\items\itemid\route.ts`

### /apiadmin/meals
- **Methods:** GET, POST
- **File:** `\apps\web\app\api\admin\meals\route.ts`

### /apiadmin/meals/id
- **Methods:** PUT, DELETE
- **File:** `\apps\web\app\api\admin\meals\id\route.ts`

### /apiadmin/migrate-to-mp-categories
- **Methods:** POST
- **File:** `\apps\web\app\api\admin\migrate-to-mp-categories\route.ts`

### /apiadmin/mp-categories
- **Methods:** GET, POST
- **File:** `\apps\web\app\api\admin\mp-categories\route.ts`

### /apiadmin/mp-categories/[id]
- **Methods:** GET, PUT, DELETE
- **File:** `\apps\web\app\api\admin\mp-categories\[id]\route.ts`

### /apiadmin/orders
- **Methods:** GET
- **File:** `\apps\web\app\api\admin\orders\route.ts`

### /apiadmin/orders/[id]
- **Methods:** GET, PUT
- **File:** `\apps\web\app\api\admin\orders\[id]\route.ts`

### /apiadmin/orders/[id]/status
- **Methods:** PUT
- **File:** `\apps\web\app\api\admin\orders\[id]\status\route.ts`

### /apiadmin/orders/all
- **Methods:** GET
- **File:** `\apps\web\app\api\admin\orders\all\route.ts`

### /apiadmin/orders/update-status
- **Methods:** POST
- **File:** `\apps\web\app\api\admin\orders\update-status\route.ts`

### /apiadmin/pricing
- **Methods:** GET
- **File:** `\apps\web\app\api\admin\pricing\route.ts`

### /apiadmin/pricing/calculate
- **Methods:** POST
- **File:** `\apps\web\app\api\admin\pricing\calculate\route.ts`

### /apiadmin/pricing/data
- **Methods:** GET
- **File:** `\apps\web\app\api\admin\pricing\data\route.ts`

### /apiadmin/pricing/discount-rules
- **Methods:** GET, POST
- **File:** `\apps\web\app\api\admin\pricing\discount-rules\route.ts`

### /apiadmin/pricing/discount-rules/[id]
- **Methods:** PUT
- **File:** `\apps\web\app\api\admin\pricing\discount-rules\[id]\route.ts`

### /apiadmin/pricing/meal-prices
- **Methods:** GET, POST
- **File:** `\apps\web\app\api\admin\pricing\meal-prices\route.ts`

### /apiadmin/pricing/meal-prices/[id]
- **Methods:** PUT
- **File:** `\apps\web\app\api\admin\pricing\meal-prices\[id]\route.ts`

### /apiadmin/pricing/meal-types
- **Methods:** GET, POST, PUT, DELETE
- **File:** `\apps\web\app\api\admin\pricing\meal-types\route.ts`

### /apiadmin/products/accessories
- **Methods:** GET, POST
- **File:** `\apps\web\app\api\admin\products\accessories\route.ts`

### /apiadmin/products/accessories/[id]
- **Methods:** PUT, DELETE
- **File:** `\apps\web\app\api\admin\products\accessories\[id]\route.ts`

### /apiadmin/products/accessories/bulk
- **Methods:** POST
- **File:** `\apps\web\app\api\admin\products\accessories\bulk\route.ts`

### /apiadmin/products/accessories/export
- **Methods:** GET
- **File:** `\apps\web\app\api\admin\products\accessories\export\route.ts`

### /apiadmin/products/express-shop
- **Methods:** GET, POST
- **File:** `\apps\web\app\api\admin\products\express-shop\route.ts`

### /apiadmin/products/express-shop/[id]
- **Methods:** PUT, DELETE
- **File:** `\apps\web\app\api\admin\products\express-shop\[id]\route.ts`

### /apiadmin/products/express-shop/bulk
- **Methods:** POST
- **File:** `\apps\web\app\api\admin\products\express-shop\bulk\route.ts`

### /apiadmin/products/express-shop/export
- **Methods:** GET
- **File:** `\apps\web\app\api\admin\products\express-shop\export\route.ts`

### /apiadmin/products/meal-plans
- **Methods:** GET, POST
- **File:** `\apps\web\app\api\admin\products\meal-plans\route.ts`

### /apiadmin/products/meal-plans/[id]
- **Methods:** GET, PUT, DELETE
- **File:** `\apps\web\app\api\admin\products\meal-plans\[id]\route.ts`

### /apiadmin/products/meal-plans/[id]/meals
- **Methods:** GET, POST
- **File:** `\apps\web\app\api\admin\products\meal-plans\[id]\meals\route.ts`

### /apiadmin/products/meal-plans/[id]/meals/[assignmentId]
- **Methods:** PUT, DELETE
- **File:** `\apps\web\app\api\admin\products\meal-plans\[id]\meals\[assignmentId]\route.ts`

### /apiadmin/products/meal-plans/[id]/variants
- **Methods:** GET, POST
- **File:** `\apps\web\app\api\admin\products\meal-plans\[id]\variants\route.ts`

### /apiadmin/products/meal-plans/[id]/variants/[variantId]
- **Methods:** PUT, DELETE
- **File:** `\apps\web\app\api\admin\products\meal-plans\[id]\variants\[variantId]\route.ts`

### /apiadmin/products/meals
- **Methods:** GET, POST
- **File:** `\apps\web\app\api\admin\products\meals\route.ts`

### /apiadmin/products/meals/[id]
- **Methods:** PUT, DELETE
- **File:** `\apps\web\app\api\admin\products\meals\[id]\route.ts`

### /apiadmin/products/meals/[id]/status
- **Methods:** PATCH
- **File:** `\apps\web\app\api\admin\products\meals\[id]\status\route.ts`

### /apiadmin/products/meals/bulk
- **Methods:** POST
- **File:** `\apps\web\app\api\admin\products\meals\bulk\route.ts`

### /apiadmin/products/meals/export
- **Methods:** GET
- **File:** `\apps\web\app\api\admin\products\meals\export\route.ts`

### /apiadmin/products/snacks
- **Methods:** GET, POST
- **File:** `\apps\web\app\api\admin\products\snacks\route.ts`

### /apiadmin/products/snacks/[id]
- **Methods:** PUT, DELETE
- **File:** `\apps\web\app\api\admin\products\snacks\[id]\route.ts`

### /apiadmin/products/snacks/bulk
- **Methods:** POST
- **File:** `\apps\web\app\api\admin\products\snacks\bulk\route.ts`

### /apiadmin/products/snacks/export
- **Methods:** GET
- **File:** `\apps\web\app\api\admin\products\snacks\export\route.ts`

### /apiadmin/setup-unified-cart
- **Methods:** POST
- **File:** `\apps\web\app\api\admin\setup-unified-cart\route.ts`

### /apiadmin/subscription-plans
- **Methods:** GET, POST
- **File:** `\apps\web\app\api\admin\subscription-plans\route.ts`

### /apiadmin/subscription-plans/[id]
- **Methods:** GET, PUT, DELETE
- **File:** `\apps\web\app\api\admin\subscription-plans\[id]\route.ts`

### /apiadmin/subscriptions
- **Methods:** GET
- **File:** `\apps\web\app\api\admin\subscriptions\route.ts`

### /apiadmin/subscriptions/[id]/status
- **Methods:** PUT
- **File:** `\apps\web\app\api\admin\subscriptions\[id]\status\route.ts`

### /apiadmin/subscriptions/active
- **Methods:** GET
- **File:** `\apps\web\app\api\admin\subscriptions\active\route.ts`

### /apiadmin/subscriptions/paused
- **Methods:** GET
- **File:** `\apps\web\app\api\admin\subscriptions\paused\route.ts`

### /apiadmin/waitlist
- **Methods:** GET
- **File:** `\apps\web\app\api\admin\waitlist\route.ts`

### /apiadmin/waitlist/export
- **Methods:** GET
- **File:** `\apps\web\app\api\admin\waitlist\export\route.ts`

### /apiauth-direct
- **Methods:** GET
- **File:** `\apps\web\app\api\auth-direct\route.ts`

### /apiauth-status
- **Methods:** GET
- **File:** `\apps\web\app\api\auth-status\route.ts`

### /apiauth-test
- **Methods:** GET
- **File:** `\apps\web\app\api\auth-test\route.ts`

### /apiauth/[...nextauth]
- **Methods:** GET, POST
- **File:** `\apps\web\app\api\auth\[...nextauth]\route.ts`

### /apiauth/login
- **Methods:** POST
- **File:** `\apps\web\app\api\auth\login\route.ts`

### /apiauth/logout
- **Methods:** POST
- **File:** `\apps\web\app\api\auth\logout\route.ts`

### /apiauth/register
- **Methods:** POST
- **File:** `\apps\web\app\api\auth\register\route.ts`

### /apiauth/session
- **Methods:** GET
- **File:** `\apps\web\app\api\auth\session\route.ts`

### /apiauth/signout
- **Methods:** GET
- **File:** `\apps\web\app\api\auth\signout\route.ts`

### /apibatch-verify-ingredients
- **Methods:** POST
- **File:** `\apps\web\app\api\batch-verify-ingredients\route.ts`

### /apicalculate-price
- **Methods:** POST
- **File:** `\apps\web\app\api\calculate-price\route.ts`

### /apicart
- **Methods:** GET, POST, PUT, DELETE
- **File:** `\apps\web\app\api\cart\route.ts`

### /apicart-direct
- **Methods:** GET, POST, PUT, DELETE
- **File:** `\apps\web\app\api\cart-direct\route.ts`

### /apicart-direct/count
- **Methods:** GET
- **File:** `\apps\web\app\api\cart-direct\count\route.ts`

### /apicart-fix
- **Methods:** GET, POST
- **File:** `\apps\web\app\api\cart-fix\route.ts`

### /apicart-simple
- **Methods:** GET, POST
- **File:** `\apps\web\app\api\cart-simple\route.ts`

### /apicart/add
- **Methods:** POST
- **File:** `\apps\web\app\api\cart\add\route.ts`

### /apicart/clear
- **Methods:** POST
- **File:** `\apps\web\app\api\cart\clear\route.ts`

### /apicart/count
- **Methods:** GET
- **File:** `\apps\web\app\api\cart\count\route.ts`

### /apicart/init-table
- **Methods:** GET
- **File:** `\apps\web\app\api\cart\init-table\route.ts`

### /apicart/remove
- **Methods:** POST
- **File:** `\apps\web\app\api\cart\remove\route.ts`

### /apicart/setup
- **Methods:** GET
- **File:** `\apps\web\app\api\cart\setup\route.ts`

### /apicart/setup-safe
- **Methods:** GET
- **File:** `\apps\web\app\api\cart\setup-safe\route.ts`

### /apicart/update
- **Methods:** POST
- **File:** `\apps\web\app\api\cart\update\route.ts`

### /apicheckout
- **Methods:** POST
- **File:** `\apps\web\app\api\checkout\route.ts`

### /apicreate-admin
- **Methods:** GET
- **File:** `\apps\web\app\api\create-admin\route.ts`

### /apicreate-cart-table
- **Methods:** GET
- **File:** `\apps\web\app\api\create-cart-table\route.ts`

### /apicreate-test-data
- **Methods:** POST
- **File:** `\apps\web\app\api\create-test-data\route.ts`

### /apidb-diagnostic
- **Methods:** GET
- **File:** `\apps\web\app\api\db-diagnostic\route.ts`

### /apidb/check-connection
- **Methods:** GET
- **File:** `\apps\web\app\api\db\check-connection\route.ts`

### /apidirect-seed-products
- **Methods:** GET
- **File:** `\apps\web\app\api\direct-seed-products\route.ts`

### /apiemail-diagnostic
- **Methods:** GET
- **File:** `\apps\web\app\api\email-diagnostic\route.ts`

### /apiensure-cart-table
- **Methods:** GET
- **File:** `\apps\web\app\api\ensure-cart-table\route.ts`

### /apiensure-products
- **Methods:** GET
- **File:** `\apps\web\app\api\ensure-products\route.ts`

### /apiexecute-migration
- **Methods:** POST
- **File:** `\apps\web\app\api\execute-migration\route.ts`

### /apifix-cart-schema
- **Methods:** GET
- **File:** `\apps\web\app\api\fix-cart-schema\route.ts`

### /apifix-orders-table
- **Methods:** POST
- **File:** `\apps\web\app\api\fix-orders-table\route.ts`

### /apifix-sessions-table
- **Methods:** GET
- **File:** `\apps\web\app\api\fix-sessions-table\route.ts`

### /apiguest-orders
- **Methods:** POST
- **File:** `\apps\web\app\api\guest-orders\route.ts`

### /apihealth
- **Methods:** GET
- **File:** `\apps\web\app\api\health\route.ts`

### /apihealth-check
- **Methods:** GET
- **File:** `\apps\web\app\api\health-check\route.ts`

### /apiimport-meals
- **Methods:** POST
- **File:** `\apps\web\app\api\import-meals\route.ts`

### /apiimport-meals-direct
- **Methods:** POST
- **File:** `\apps\web\app\api\import-meals-direct\route.ts`

### /apiinit-cart-table
- **Methods:** GET
- **File:** `\apps\web\app\api\init-cart-table\route.ts`

### /apiinit-db
- **Methods:** GET
- **File:** `\apps\web\app\api\init-db\route.ts`

### /apiinit-delivery-schema
- **Methods:** GET, POST
- **File:** `\apps\web\app\api\init-delivery-schema\route.ts`

### /apiinit-products
- **Methods:** GET
- **File:** `\apps\web\app\api\init-products\route.ts`

### /apimeal-plans
- **Methods:** GET
- **File:** `\apps\web\app\api\meal-plans\route.ts`

### /apimeal-plans/[id]
- **Methods:** GET
- **File:** `\apps\web\app\api\meal-plans\[id]\route.ts`

### /apimeal-preferences
- **Methods:** GET, POST
- **File:** `\apps\web\app\api\meal-preferences\route.ts`

### /apimeals
- **Methods:** GET
- **File:** `\apps\web\app\api\meals\route.ts`

### /apimigration-plan
- **Methods:** GET
- **File:** `\apps\web\app\api\migration-plan\route.ts`

### /apinotification-preferences
- **Methods:** GET, PATCH
- **File:** `\apps\web\app\api\notification-preferences\route.ts`

### /apinotifications
- **Methods:** GET, POST, PATCH
- **File:** `\apps\web\app\api\notifications\route.ts`

### /apinutrition-lookup
- **Methods:** GET
- **File:** `\apps\web\app\api\nutrition-lookup\route.ts`

### /apiorders
- **Methods:** GET, POST
- **File:** `\apps\web\app\api\orders\route.ts`

### /apiorders/[id]
- **Methods:** GET
- **File:** `\apps\web\app\api\orders\[id]\route.ts`

### /apiorders/create
- **Methods:** POST
- **File:** `\apps\web\app\api\orders\create\route.ts`

### /apiorders/create-unified
- **Methods:** POST
- **File:** `\apps\web\app\api\orders\create-unified\route.ts`

### /apiproducts
- **Methods:** GET, POST
- **File:** `\apps\web\app\api\products\route.ts`

### /apiproducts-basic
- **Methods:** GET
- **File:** `\apps\web\app\api\products-basic\route.ts`

### /apiproducts-simple
- **Methods:** GET
- **File:** `\apps\web\app\api\products-simple\route.ts`

### /apiproducts/[id]
- **Methods:** GET, PUT, DELETE
- **File:** `\apps\web\app\api\products\[id]\route.ts`

### /apirebuild-database
- **Methods:** GET
- **File:** `\apps\web\app\api\rebuild-database\route.ts`

### /apiseed-db
- **Methods:** GET
- **File:** `\apps\web\app\api\seed-db\route.ts`

### /apiseed-products
- **Methods:** GET
- **File:** `\apps\web\app\api\seed-products\route.ts`

### /apiseed-products-simple
- **Methods:** GET
- **File:** `\apps\web\app\api\seed-products-simple\route.ts`

### /apisetup-cart-tables
- **Methods:** GET
- **File:** `\apps\web\app\api\setup-cart-tables\route.ts`

### /apisubscriptions/[id]/deliveries
- **Methods:** GET
- **File:** `\apps\web\app\api\subscriptions\[id]\deliveries\route.ts`

### /apisubscriptions/[id]/pause
- **Methods:** POST
- **File:** `\apps\web\app\api\subscriptions\[id]\pause\route.ts`

### /apisubscriptions/[id]/resume
- **Methods:** POST
- **File:** `\apps\web\app\api\subscriptions\[id]\resume\route.ts`

### /apisubscriptions/create
- **Methods:** POST
- **File:** `\apps\web\app\api\subscriptions\create\route.ts`

### /apitest-blob
- **Methods:** GET
- **File:** `\apps\web\app\api\test-blob\route.ts`

### /apitest-cart-system
- **Methods:** GET
- **File:** `\apps\web\app\api\test-cart-system\route.ts`

### /apitest-email
- **Methods:** GET, POST
- **File:** `\apps\web\app\api\test-email\route.ts`

### /apiupdate-ingredient
- **Methods:** POST
- **File:** `\apps\web\app\api\update-ingredient\route.ts`

### /apiupload
- **Methods:** POST
- **File:** `\apps\web\app\api\upload\route.ts`

### /apiuser/dashboard
- **Methods:** GET
- **File:** `\apps\web\app\api\user\dashboard\route.ts`

### /apiuser/subscriptions
- **Methods:** GET
- **File:** `\apps\web\app\api\user\subscriptions\route.ts`

### /apivalidate-meals
- **Methods:** GET
- **File:** `\apps\web\app\api\validate-meals\route.ts`

### /apiverify-nutrition-data
- **Methods:** GET
- **File:** `\apps\web\app\api\verify-nutrition-data\route.ts`

### /apiwaitlist
- **Methods:** POST
- **File:** `\apps\web\app\api\waitlist\route.ts`

### /apiwaitlist-debug
- **Methods:** GET
- **File:** `\apps\web\app\api\waitlist-debug\route.ts`

### /apiwaitlist-email
- **Methods:** POST
- **File:** `\apps\web\app\api\waitlist-email\route.ts`

### /apiwaitlist-hero-image
- **Methods:** GET, POST
- **File:** `\apps\web\app\api\waitlist-hero-image\route.ts`

### /apiwaitlist-simple
- **Methods:** POST
- **File:** `\apps\web\app\api\waitlist-simple\route.ts`

### /apiwaitlist/check
- **Methods:** GET
- **File:** `\apps\web\app\api\waitlist\check\route.ts`


## Admin API Routes (0)



## Debug/Test Routes (1)

⚠️ **These routes should be removed or protected in production**

### /apiauth/debug-login
- **Methods:** GET, POST
- **File:** `\apps\web\app\api\auth\debug-login\route.ts`


---

*This documentation is auto-generated. Do not edit manually.*
