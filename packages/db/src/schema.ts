import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  date,
  jsonb,
} from "drizzle-orm/pg-core";

/* =================== AUTHENTICATION & USERS =================== */

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  password: varchar("password", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  role: varchar("role", { length: 50 })
    .$type<"customer" | "staff" | "admin">()
    .default("customer")
    .notNull(),
  status: varchar("status", { length: 20 })
    .$type<"active" | "inactive" | "suspended">()
    .default("active")
    .notNull(),
  city: varchar("city", { length: 100 }),
  adminNotes: text("admin_notes"),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* =================== MEAL CATALOG =================== */

export const mpCategories = pgTable("mp_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  variables: jsonb("variables").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const mealPlans = pgTable("meal_plans", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  title: varchar("title", { length: 200 }).notNull(),
  summary: text("summary"),
  audience: varchar("audience", { length: 60 }),
  mpCategoryId: integer("mp_category_id").references(() => mpCategories.id, {
    onDelete: "set null",
  }),
  published: boolean("published").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const planVariants = pgTable("plan_variants", {
  id: serial("id").primaryKey(),
  mealPlanId: integer("meal_plan_id")
    .notNull()
    .references(() => mealPlans.id, { onDelete: "cascade" }),
  label: varchar("label", { length: 120 }).notNull(),
  daysPerWeek: integer("days_per_week").notNull().default(5),
  mealsPerDay: integer("meals_per_day").notNull().default(3),
  weeklyPriceMad: numeric("weekly_price_mad", { precision: 10, scale: 2 }).notNull(),
  published: boolean("published").default(true).notNull(),
});

export const meals = pgTable("meals", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  mealType: varchar("meal_type", { length: 50 }),
  category: varchar("category", { length: 100 }).default("meal"),
  kcal: integer("kcal").notNull().default(0),
  protein: numeric("protein", { precision: 6, scale: 2 }).default("0"),
  carbs: numeric("carbs", { precision: 6, scale: 2 }).default("0"),
  fat: numeric("fat", { precision: 6, scale: 2 }).default("0"),
  fiber: numeric("fiber", { precision: 6, scale: 2 }).default("0"),
  sodium: numeric("sodium", { precision: 6, scale: 2 }).default("0"),
  sugar: numeric("sugar", { precision: 6, scale: 2 }).default("0"),
  cholesterol: numeric("cholesterol", { precision: 6, scale: 2 }).default("0"),
  saturatedFat: numeric("saturated_fat", { precision: 6, scale: 2 }).default("0"),
  allergens: jsonb("allergens").$type<string[]>().default([]),
  tags: jsonb("tags").$type<string[]>().default([]),
  ingredients: jsonb("ingredients").$type<unknown[]>().default([]),
  imageUrl: text("image_url"),
  published: boolean("published").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mealPlanMeals = pgTable("meal_plan_meals", {
  id: serial("id").primaryKey(),
  mealPlanId: integer("meal_plan_id")
    .notNull()
    .references(() => mealPlans.id, { onDelete: "cascade" }),
  mealId: integer("meal_id")
    .notNull()
    .references(() => meals.id, { onDelete: "cascade" }),
  planVariantId: integer("plan_variant_id").references(() => planVariants.id, {
    onDelete: "set null",
  }),
  sortOrder: integer("sort_order").default(0),
});

/* =================== PRICING =================== */

export const mealTypePrices = pgTable("meal_type_prices", {
  id: serial("id").primaryKey(),
  planName: varchar("plan_name", { length: 100 }).notNull(),
  mealType: varchar("meal_type", { length: 50 }).notNull(),
  basePriceMad: numeric("base_price_mad", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const discountRules = pgTable("discount_rules", {
  id: serial("id").primaryKey(),
  discountType: varchar("discount_type", { length: 50 }).notNull(),
  conditionValue: integer("condition_value").notNull(),
  discountPercentage: numeric("discount_percentage", { precision: 5, scale: 2 }).notNull(),
  stackable: boolean("stackable").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  validFrom: timestamp("valid_from"),
  validTo: timestamp("valid_to"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* =================== COMMERCE =================== */

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 200 }),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull().default("0"),
  salePrice: numeric("sale_price", { precision: 10, scale: 2 }),
  imageUrl: text("image_url"),
  category: varchar("category", { length: 100 }),
  productType: varchar("product_type", { length: 50 }).default("product"),
  tags: jsonb("tags").$type<string[]>().default([]),
  nutritionalInfo: jsonb("nutritional_info").$type<Record<string, unknown>>().default({}),
  stock: integer("stock").notNull().default(0),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  itemType: varchar("item_type", { length: 20 }).notNull().default("product"),
  productId: integer("product_id").references(() => products.id, {
    onDelete: "set null",
  }),
  planName: varchar("plan_name", { length: 100 }),
  mealTypes: jsonb("meal_types"),
  daysPerWeek: integer("days_per_week"),
  durationWeeks: integer("duration_weeks"),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull().default("0"),
  totalPrice: numeric("total_price", { precision: 10, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  planName: varchar("plan_name", { length: 100 }),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  deliveryAddress: text("delivery_address"),
  deliveryDate: date("delivery_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").references(() => products.id, {
    onDelete: "set null",
  }),
  description: varchar("description", { length: 255 }),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* =================== SUBSCRIPTIONS & DELIVERIES =================== */

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  planVariantId: integer("plan_variant_id").references(() => planVariants.id, {
    onDelete: "set null",
  }),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  startsAt: timestamp("starts_at"),
  renewsAt: timestamp("renews_at"),
  pauseStartDate: timestamp("pause_start_date"),
  pauseEndDate: timestamp("pause_end_date"),
  pauseReason: text("pause_reason"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const deliveries = pgTable("deliveries", {
  id: serial("id").primaryKey(),
  subscriptionId: integer("subscription_id").references(() => subscriptions.id, {
    onDelete: "set null",
  }),
  orderId: integer("order_id").references(() => orders.id, { onDelete: "set null" }),
  deliveryDate: date("delivery_date").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  deliveredAt: timestamp("delivered_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* =================== ENGAGEMENT =================== */

export const waitlist = pgTable("waitlist", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 50 }),
  preferredMealPlan: varchar("preferred_meal_plan", { length: 100 }),
  city: varchar("city", { length: 100 }),
  wantsNotifications: boolean("wants_notifications").default(true),
  position: integer("position"),
  status: varchar("status", { length: 50 }).notNull().default("waiting"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notificationPreferences = pgTable("notification_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  emailEnabled: boolean("email_enabled").default(true).notNull(),
  pushEnabled: boolean("push_enabled").default(false).notNull(),
  smsEnabled: boolean("sms_enabled").default(false).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/* =================== CMS =================== */

export const contentHero = pgTable("content_hero", {
  id: serial("id").primaryKey(),
  desktopImageUrl: text("desktop_image_url"),
  mobileImageUrl: text("mobile_image_url"),
  title: varchar("title", { length: 200 }),
  description: text("description"),
  altText: varchar("alt_text", { length: 255 }),
  seoTitle: varchar("seo_title", { length: 200 }),
  seoDescription: text("seo_description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/* =================== LEGACY COMPAT =================== */

export const subscriptionRequests = pgTable("subscription_requests", {
  id: serial("id").primaryKey(),
  plan: varchar("plan", { length: 100 }),
  meals: text("meals"),
  days: integer("days"),
  duration: integer("duration"),
  total: numeric("total", { precision: 10, scale: 2 }),
  fullName: varchar("full_name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
