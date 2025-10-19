import { pgTable, serial, varchar, text, integer, numeric, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 120 }),
  role: varchar("role", { length: 20 }).$type<"customer"|"staff"|"admin">().default("customer").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const meals = pgTable("meals", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  kcal: integer("kcal").notNull().default(0),
  protein: numeric("protein", { precision: 6, scale: 2 }).default("0"),
  carbs: numeric("carbs", { precision: 6, scale: 2 }).default("0"),
  fat: numeric("fat", { precision: 6, scale: 2 }).default("0"),
  allergens: jsonb("allergens").$type<string[]>().default([]),
  tags: jsonb("tags").$type<string[]>().default([]),
  imageUrl: text("image_url"),
  published: boolean("published").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mealPlans = pgTable("meal_plans", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  title: varchar("title", { length: 200 }).notNull(),
  summary: text("summary"),
  audience: varchar("audience", { length: 60 }).$type<"keto"|"lowcarb"|"balanced"|"muscle"|"custom">().notNull(),
  published: boolean("published").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const planVariants = pgTable("plan_variants", {
  id: serial("id").primaryKey(),
  mealPlanId: integer("meal_plan_id").notNull().references(()=> mealPlans.id),
  label: varchar("label", { length: 120 }).notNull(),
  daysPerWeek: integer("days_per_week").notNull().default(5),
  mealsPerDay: integer("meals_per_day").notNull().default(3),
  weeklyPriceMAD: numeric("weekly_price_mad", { precision: 10, scale: 2 }).notNull(),
  published: boolean("published").default(true).notNull(),
});

export const mealPlanMeals = pgTable("meal_plan_meals", {
  id: serial("id").primaryKey(),
  planVariantId: integer("plan_variant_id").notNull().references(()=> planVariants.id),
  dayIndex: integer("day_index").notNull(),
  slotIndex: integer("slot_index").notNull(),
  mealId: integer("meal_id").notNull().references(()=> meals.id),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(()=> users.id),
  planVariantId: integer("plan_variant_id").notNull().references(()=> planVariants.id),
  status: varchar("status", { length: 20 }).$type<"active"|"paused"|"canceled"|"expired">().default("active").notNull(),
  startsAt: timestamp("starts_at").defaultNow().notNull(),
  renewsAt: timestamp("renews_at"),
  notes: text("notes"),
});

export const deliveries = pgTable("deliveries", {
  id: serial("id").primaryKey(),
  subscriptionId: integer("subscription_id").notNull().references(()=> subscriptions.id),
  deliveryDate: timestamp("delivery_date").notNull(),
  window: varchar("window", { length: 40 }),
  addressLine1: varchar("address_line1", { length: 255 }),
  city: varchar("city", { length: 120 }),
  status: varchar("status", { length: 20 }).$type<"pending"|"preparing"|"out_for_delivery"|"delivered"|"failed">().default("pending").notNull(),
});
