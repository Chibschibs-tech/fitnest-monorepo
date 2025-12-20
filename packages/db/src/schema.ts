import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

/* ---------------- USERS ---------------- */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 120 }),
  role: varchar("role", { length: 20 })
    .$type<"customer" | "staff" | "admin">()
    .default("customer")
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* ---------------- MEALS ---------------- */
export const meals = pgTable("meals", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  mealType: varchar("meal_type", { length: 50 })
    .$type<"Breakfast" | "Lunch" | "Dinner" | "Snack">(),
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
  imageUrl: text("image_url"),
  published: boolean("published").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* ---------------- MEAL PLANS ---------------- */
export const mealPlans = pgTable("meal_plans", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  title: varchar("title", { length: 200 }).notNull(),
  summary: text("summary"),
  audience: varchar("audience", { length: 60 })
    .$type<"keto" | "lowcarb" | "balanced" | "muscle" | "custom">()
    .notNull(),
  published: boolean("published").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* ---------------- PLAN VARIANTS ---------------- */
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

/* ---------------- CONTENT MANAGEMENT ---------------- */
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
