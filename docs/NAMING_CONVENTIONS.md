# FitNest Naming Conventions

**Last Updated:** 2025-12-07

## Database Naming Convention

**Standard:** **lowercase** (no underscores)

### Products Table Columns
- `id` - Primary key
- `name` - Product name
- `description` - Product description
- `price` - Price in cents (INTEGER)
- `saleprice` - Sale price in cents (INTEGER, nullable)
- `imageurl` - Image URL (VARCHAR)
- `category` - Product category
- `tags` - Tags (TEXT)
- `stock` - Stock quantity
- `isactive` - Active status (BOOLEAN)
- `createdat` - Created timestamp
- `updatedat` - Updated timestamp

### Users Table Columns
- `id` - Primary key
- `email` - Email address
- `name` - User name
- `password` - Hashed password
- `role` - User role
- `created_at` - Created timestamp (snake_case exception)

**Note:** The `users` table uses `created_at` (snake_case) while `products` uses `createdat` (lowercase). This inconsistency exists in production and should be maintained for compatibility.

## API Response Naming Convention

**Standard:** **camelCase**

When querying the database, columns are aliased to camelCase:
```sql
SELECT 
  saleprice as "salePrice",
  imageurl as "imageUrl",
  isactive as "isActive"
FROM products
```

## TypeScript/JavaScript Naming

**Standard:** **camelCase** for variables and functions, **PascalCase** for components

### Variables
```typescript
const salePrice = product.salePrice
const imageUrl = product.imageUrl
const isActive = product.isActive
```

### Functions
```typescript
function calculatePrice() {}
function getProductById() {}
```

### Components
```typescript
function ProductCard() {}
function AdminDashboard() {}
```

### Files
- Components: `PascalCase.tsx` (e.g., `ProductCard.tsx`)
- Utilities: `kebab-case.ts` (e.g., `error-handler.ts`)
- API routes: `route.ts`
- Pages: `page.tsx`

## Database vs API Mapping

| Database Column | API Response Field |
|----------------|-------------------|
| `saleprice` | `salePrice` |
| `imageurl` | `imageUrl` |
| `isactive` | `isActive` |
| `createdat` | `createdAt` |
| `updatedat` | `updatedAt` |

## Best Practices

1. **Database:** Use lowercase (no underscores) for new tables
2. **API Responses:** Always use camelCase
3. **TypeScript:** Use camelCase for variables, PascalCase for components
4. **Files:** Use kebab-case for utilities, PascalCase for components

## Migration Notes

⚠️ **Important:** The current naming convention is established in production. Do NOT change database column names without:
1. Creating migration script
2. Updating all queries
3. Testing thoroughly
4. Coordinating with team

---

*This convention is documented to maintain consistency across the codebase.*

