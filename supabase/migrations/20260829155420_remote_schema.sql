


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";





SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."cart_items" (
    "id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "item_type" character varying(20) DEFAULT 'product'::character varying NOT NULL,
    "product_id" integer,
    "plan_name" character varying(100),
    "meal_types" "jsonb",
    "days_per_week" integer,
    "duration_weeks" integer,
    "quantity" integer DEFAULT 1 NOT NULL,
    "unit_price" numeric(10,2) DEFAULT 0 NOT NULL,
    "total_price" numeric(10,2) DEFAULT 0 NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."cart_items" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."cart_items_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."cart_items_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."cart_items_id_seq" OWNED BY "public"."cart_items"."id";



CREATE TABLE IF NOT EXISTS "public"."company_leads" (
    "id" integer NOT NULL,
    "full_name" character varying(160) NOT NULL,
    "company" character varying(160) NOT NULL,
    "job_role" character varying(120),
    "email" character varying(255) NOT NULL,
    "phone" character varying(60) NOT NULL,
    "need_type" character varying(20) NOT NULL,
    "headcount" character varying(20),
    "event_date" "date",
    "message" "text",
    "status" character varying(20) DEFAULT 'new'::character varying NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "company_leads_need_type_chk" CHECK ((("need_type")::"text" = ANY ((ARRAY['event'::character varying, 'daily'::character varying, 'both'::character varying])::"text"[]))),
    CONSTRAINT "company_leads_status_chk" CHECK ((("status")::"text" = ANY ((ARRAY['new'::character varying, 'contacted'::character varying, 'qualified'::character varying, 'won'::character varying, 'lost'::character varying])::"text"[])))
);


ALTER TABLE "public"."company_leads" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."company_leads_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."company_leads_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."company_leads_id_seq" OWNED BY "public"."company_leads"."id";



CREATE TABLE IF NOT EXISTS "public"."compose_components" (
    "id" integer NOT NULL,
    "slot" character varying(20) NOT NULL,
    "name" character varying(120) NOT NULL,
    "portion_grams" integer DEFAULT 100 NOT NULL,
    "kcal" numeric(8,2) DEFAULT 0 NOT NULL,
    "protein_g" numeric(8,2) DEFAULT 0 NOT NULL,
    "carbs_g" numeric(8,2) DEFAULT 0 NOT NULL,
    "fat_g" numeric(8,2) DEFAULT 0 NOT NULL,
    "surcharge_mad" numeric(10,2) DEFAULT 0 NOT NULL,
    "extra_portion_price_mad" numeric(10,2) DEFAULT 0 NOT NULL,
    "allergens" "jsonb" DEFAULT '[]'::"jsonb",
    "is_active" boolean DEFAULT true NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "compose_components_slot_chk" CHECK ((("slot")::"text" = ANY ((ARRAY['protein'::character varying, 'carb'::character varying, 'veg'::character varying, 'sauce'::character varying, 'extra'::character varying])::"text"[])))
);


ALTER TABLE "public"."compose_components" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."compose_components_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."compose_components_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."compose_components_id_seq" OWNED BY "public"."compose_components"."id";



CREATE TABLE IF NOT EXISTS "public"."compose_settings" (
    "id" integer NOT NULL,
    "meal_type" character varying(20) NOT NULL,
    "base_price_mad" numeric(10,2) NOT NULL,
    "included_protein" integer DEFAULT 1 NOT NULL,
    "included_carb" integer DEFAULT 1 NOT NULL,
    "included_veg" integer DEFAULT 2 NOT NULL,
    "included_sauce" integer DEFAULT 1 NOT NULL,
    "max_extras" integer DEFAULT 3 NOT NULL,
    "protein_required" boolean DEFAULT true NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."compose_settings" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."compose_settings_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."compose_settings_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."compose_settings_id_seq" OWNED BY "public"."compose_settings"."id";



CREATE TABLE IF NOT EXISTS "public"."content_hero" (
    "id" integer NOT NULL,
    "desktop_image_url" "text",
    "mobile_image_url" "text",
    "title" character varying(200),
    "description" "text",
    "alt_text" character varying(255),
    "seo_title" character varying(200),
    "seo_description" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."content_hero" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."content_hero_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."content_hero_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."content_hero_id_seq" OWNED BY "public"."content_hero"."id";



CREATE TABLE IF NOT EXISTS "public"."custom_meals" (
    "id" integer NOT NULL,
    "user_id" integer,
    "cart_id" character varying(80),
    "name" character varying(120) NOT NULL,
    "meal_type" character varying(20) NOT NULL,
    "components" "jsonb" NOT NULL,
    "kcal" numeric(8,2) DEFAULT 0 NOT NULL,
    "protein_g" numeric(8,2) DEFAULT 0 NOT NULL,
    "carbs_g" numeric(8,2) DEFAULT 0 NOT NULL,
    "fat_g" numeric(8,2) DEFAULT 0 NOT NULL,
    "price_mad" numeric(10,2) DEFAULT 0 NOT NULL,
    "quantity_per_week" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."custom_meals" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."custom_meals_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."custom_meals_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."custom_meals_id_seq" OWNED BY "public"."custom_meals"."id";



CREATE TABLE IF NOT EXISTS "public"."customers" (
    "id" integer NOT NULL,
    "user_id" integer,
    "name" "text",
    "email" "text",
    "phone" "text",
    "status" "text" DEFAULT 'active'::"text",
    "city" "text",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."customers" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."customers_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."customers_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."customers_id_seq" OWNED BY "public"."customers"."id";



CREATE TABLE IF NOT EXISTS "public"."deliveries" (
    "id" integer NOT NULL,
    "subscription_id" integer,
    "order_id" integer,
    "delivery_date" "date" NOT NULL,
    "status" character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    "delivered_at" timestamp without time zone,
    "notes" "text",
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."deliveries" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."deliveries_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."deliveries_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."deliveries_id_seq" OWNED BY "public"."deliveries"."id";



CREATE TABLE IF NOT EXISTS "public"."discount_rules" (
    "id" integer NOT NULL,
    "discount_type" character varying(50) NOT NULL,
    "condition_value" integer NOT NULL,
    "discount_percentage" numeric(5,2) NOT NULL,
    "stackable" boolean DEFAULT false NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "valid_from" timestamp without time zone,
    "valid_to" timestamp without time zone,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "stacking_behavior" character varying(20) DEFAULT 'best'::character varying NOT NULL,
    "priority" integer DEFAULT 0 NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "discount_rules_stacking_behavior_chk" CHECK ((("stacking_behavior")::"text" = ANY ((ARRAY['stack'::character varying, 'exclusive'::character varying, 'best'::character varying])::"text"[])))
);


ALTER TABLE "public"."discount_rules" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."discount_rules_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."discount_rules_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."discount_rules_id_seq" OWNED BY "public"."discount_rules"."id";



CREATE TABLE IF NOT EXISTS "public"."meal_plan_meals" (
    "id" integer NOT NULL,
    "meal_plan_id" integer NOT NULL,
    "meal_id" integer NOT NULL,
    "sort_order" integer DEFAULT 0
);


ALTER TABLE "public"."meal_plan_meals" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."meal_plan_meals_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."meal_plan_meals_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."meal_plan_meals_id_seq" OWNED BY "public"."meal_plan_meals"."id";



CREATE TABLE IF NOT EXISTS "public"."meal_plans" (
    "id" integer NOT NULL,
    "slug" character varying(160) NOT NULL,
    "title" character varying(200) NOT NULL,
    "summary" "text",
    "audience" character varying(60),
    "mp_category_id" integer,
    "published" boolean DEFAULT false NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "image_url" "text"
);


ALTER TABLE "public"."meal_plans" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."meal_plans_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."meal_plans_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."meal_plans_id_seq" OWNED BY "public"."meal_plans"."id";



CREATE TABLE IF NOT EXISTS "public"."meal_type_prices" (
    "id" integer NOT NULL,
    "plan_name" character varying(100) NOT NULL,
    "meal_type" character varying(50) NOT NULL,
    "base_price_mad" numeric(10,2) NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "meal_plan_id" integer NOT NULL
);


ALTER TABLE "public"."meal_type_prices" OWNER TO "postgres";


COMMENT ON COLUMN "public"."meal_type_prices"."plan_name" IS 'DEPRECATED — do not read or write. Use meal_plan_id. Scheduled for removal.';



CREATE SEQUENCE IF NOT EXISTS "public"."meal_type_prices_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."meal_type_prices_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."meal_type_prices_id_seq" OWNED BY "public"."meal_type_prices"."id";



CREATE TABLE IF NOT EXISTS "public"."meals" (
    "id" integer NOT NULL,
    "slug" character varying(160) NOT NULL,
    "title" character varying(200) NOT NULL,
    "description" "text",
    "meal_type" character varying(50),
    "category" character varying(100) DEFAULT 'meal'::character varying,
    "kcal" integer DEFAULT 0 NOT NULL,
    "protein" numeric(6,2) DEFAULT 0,
    "carbs" numeric(6,2) DEFAULT 0,
    "fat" numeric(6,2) DEFAULT 0,
    "fiber" numeric(6,2) DEFAULT 0,
    "sodium" numeric(6,2) DEFAULT 0,
    "sugar" numeric(6,2) DEFAULT 0,
    "cholesterol" numeric(6,2) DEFAULT 0,
    "saturated_fat" numeric(6,2) DEFAULT 0,
    "allergens" "jsonb" DEFAULT '[]'::"jsonb",
    "tags" "jsonb" DEFAULT '[]'::"jsonb",
    "ingredients" "jsonb" DEFAULT '[]'::"jsonb",
    "image_url" "text",
    "published" boolean DEFAULT false NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."meals" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."meals_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."meals_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."meals_id_seq" OWNED BY "public"."meals"."id";



CREATE TABLE IF NOT EXISTS "public"."mp_categories" (
    "id" integer NOT NULL,
    "name" character varying(100) NOT NULL,
    "slug" character varying(100) NOT NULL,
    "description" "text",
    "variables" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."mp_categories" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."mp_categories_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."mp_categories_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."mp_categories_id_seq" OWNED BY "public"."mp_categories"."id";



CREATE TABLE IF NOT EXISTS "public"."notification_preferences" (
    "id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "email_enabled" boolean DEFAULT true NOT NULL,
    "push_enabled" boolean DEFAULT false NOT NULL,
    "sms_enabled" boolean DEFAULT false NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."notification_preferences" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."notification_preferences_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."notification_preferences_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."notification_preferences_id_seq" OWNED BY "public"."notification_preferences"."id";



CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "title" character varying(255) NOT NULL,
    "description" "text",
    "type" character varying(50),
    "is_read" boolean DEFAULT false NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."notifications_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."notifications_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."notifications_id_seq" OWNED BY "public"."notifications"."id";



CREATE TABLE IF NOT EXISTS "public"."order_items" (
    "id" integer NOT NULL,
    "order_id" integer NOT NULL,
    "product_id" integer,
    "description" character varying(255),
    "quantity" integer DEFAULT 1 NOT NULL,
    "unit_price" numeric(10,2) DEFAULT 0 NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."order_items" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."order_items_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."order_items_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."order_items_id_seq" OWNED BY "public"."order_items"."id";



CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" integer NOT NULL,
    "user_id" integer,
    "plan_name" character varying(100),
    "total_amount" numeric(10,2) DEFAULT 0 NOT NULL,
    "status" character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    "delivery_address" "text",
    "delivery_date" "date",
    "notes" "text",
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "payment_method" character varying(50) DEFAULT 'cod'::character varying,
    "payment_status" character varying(50) DEFAULT 'pending'::character varying
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."orders_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."orders_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."orders_id_seq" OWNED BY "public"."orders"."id";



CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" integer NOT NULL,
    "name" character varying(255) NOT NULL,
    "slug" character varying(200),
    "description" "text",
    "price" numeric(10,2) DEFAULT 0 NOT NULL,
    "sale_price" numeric(10,2),
    "image_url" "text",
    "category" character varying(100),
    "product_type" character varying(50) DEFAULT 'product'::character varying,
    "tags" "jsonb" DEFAULT '[]'::"jsonb",
    "nutritional_info" "jsonb" DEFAULT '{}'::"jsonb",
    "stock" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."products" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."products_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."products_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."products_id_seq" OWNED BY "public"."products"."id";



CREATE TABLE IF NOT EXISTS "public"."sessions" (
    "id" character varying(255) NOT NULL,
    "user_id" integer NOT NULL,
    "expires_at" timestamp without time zone NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscription_requests" (
    "id" integer NOT NULL,
    "plan" character varying(100),
    "meals" "text",
    "days" integer,
    "duration" integer,
    "total" numeric(10,2),
    "full_name" character varying(255),
    "email" character varying(255),
    "phone" character varying(50),
    "note" "text",
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."subscription_requests" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."subscription_requests_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."subscription_requests_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."subscription_requests_id_seq" OWNED BY "public"."subscription_requests"."id";



CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
    "id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "status" character varying(50) DEFAULT 'active'::character varying NOT NULL,
    "starts_at" timestamp without time zone,
    "renews_at" timestamp without time zone,
    "pause_start_date" timestamp without time zone,
    "pause_end_date" timestamp without time zone,
    "pause_reason" "text",
    "notes" "text",
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "payment_method" character varying(50) DEFAULT 'cod'::character varying,
    "payment_status" character varying(50) DEFAULT 'pending'::character varying,
    "meal_plan_id" integer NOT NULL,
    "meal_types" "text"[] NOT NULL,
    "days_per_week" integer NOT NULL,
    "duration_weeks" integer NOT NULL,
    "price_per_day_mad" numeric(10,2) NOT NULL,
    "discount_percentage" numeric(5,2) DEFAULT 0 NOT NULL,
    "total_mad" numeric(10,2) NOT NULL,
    CONSTRAINT "subscriptions_days_per_week_check" CHECK ((("days_per_week" >= 1) AND ("days_per_week" <= 7))),
    CONSTRAINT "subscriptions_discount_percentage_check" CHECK ((("discount_percentage" >= (0)::numeric) AND ("discount_percentage" <= (100)::numeric))),
    CONSTRAINT "subscriptions_duration_weeks_check" CHECK (("duration_weeks" >= 1)),
    CONSTRAINT "subscriptions_price_per_day_mad_check" CHECK (("price_per_day_mad" >= (0)::numeric)),
    CONSTRAINT "subscriptions_total_mad_check" CHECK (("total_mad" >= (0)::numeric))
);


ALTER TABLE "public"."subscriptions" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."subscriptions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."subscriptions_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."subscriptions_id_seq" OWNED BY "public"."subscriptions"."id";



CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" integer NOT NULL,
    "email" character varying(255) NOT NULL,
    "name" character varying(255),
    "password" character varying(255) NOT NULL,
    "phone" character varying(50),
    "role" character varying(50) DEFAULT 'customer'::character varying NOT NULL,
    "status" character varying(20) DEFAULT 'active'::character varying NOT NULL,
    "city" character varying(100),
    "admin_notes" "text",
    "last_login_at" timestamp without time zone,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "auth_id" "uuid"
);


ALTER TABLE "public"."users" OWNER TO "postgres";


COMMENT ON COLUMN "public"."users"."auth_id" IS 'FK to auth.users(id) once Supabase Auth is activated. NULL until then.';



CREATE SEQUENCE IF NOT EXISTS "public"."users_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."users_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."users_id_seq" OWNED BY "public"."users"."id";



CREATE TABLE IF NOT EXISTS "public"."waitlist" (
    "id" integer NOT NULL,
    "first_name" character varying(100),
    "last_name" character varying(100),
    "email" character varying(255) NOT NULL,
    "phone" character varying(50),
    "preferred_meal_plan" character varying(100),
    "city" character varying(100),
    "wants_notifications" boolean DEFAULT true,
    "position" integer,
    "status" character varying(50) DEFAULT 'waiting'::character varying NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."waitlist" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."waitlist_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."waitlist_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."waitlist_id_seq" OWNED BY "public"."waitlist"."id";



ALTER TABLE ONLY "public"."cart_items" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."cart_items_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."company_leads" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."company_leads_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."compose_components" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."compose_components_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."compose_settings" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."compose_settings_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."content_hero" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."content_hero_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."custom_meals" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."custom_meals_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."customers" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."customers_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."deliveries" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."deliveries_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."discount_rules" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."discount_rules_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."meal_plan_meals" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."meal_plan_meals_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."meal_plans" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."meal_plans_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."meal_type_prices" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."meal_type_prices_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."meals" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."meals_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."mp_categories" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."mp_categories_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."notification_preferences" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."notification_preferences_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."notifications" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."notifications_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."order_items" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."order_items_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."orders" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."orders_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."products" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."products_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."subscription_requests" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."subscription_requests_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."subscriptions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."subscriptions_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."users" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."users_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."waitlist" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."waitlist_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."company_leads"
    ADD CONSTRAINT "company_leads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."compose_components"
    ADD CONSTRAINT "compose_components_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."compose_settings"
    ADD CONSTRAINT "compose_settings_meal_type_key" UNIQUE ("meal_type");



ALTER TABLE ONLY "public"."compose_settings"
    ADD CONSTRAINT "compose_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."content_hero"
    ADD CONSTRAINT "content_hero_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."custom_meals"
    ADD CONSTRAINT "custom_meals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."deliveries"
    ADD CONSTRAINT "deliveries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."discount_rules"
    ADD CONSTRAINT "discount_rules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."meal_plan_meals"
    ADD CONSTRAINT "meal_plan_meals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."meal_plans"
    ADD CONSTRAINT "meal_plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."meal_plans"
    ADD CONSTRAINT "meal_plans_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."meal_type_prices"
    ADD CONSTRAINT "meal_type_prices_meal_plan_id_meal_type_key" UNIQUE ("meal_plan_id", "meal_type");



ALTER TABLE ONLY "public"."meal_type_prices"
    ADD CONSTRAINT "meal_type_prices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."meals"
    ADD CONSTRAINT "meals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."meals"
    ADD CONSTRAINT "meals_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."mp_categories"
    ADD CONSTRAINT "mp_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mp_categories"
    ADD CONSTRAINT "mp_categories_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."notification_preferences"
    ADD CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notification_preferences"
    ADD CONSTRAINT "notification_preferences_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscription_requests"
    ADD CONSTRAINT "subscription_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_auth_id_key" UNIQUE ("auth_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."waitlist"
    ADD CONSTRAINT "waitlist_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."waitlist"
    ADD CONSTRAINT "waitlist_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_cart_items_user" ON "public"."cart_items" USING "btree" ("user_id");



CREATE INDEX "idx_company_leads_status_created" ON "public"."company_leads" USING "btree" ("status", "created_at" DESC);



CREATE INDEX "idx_compose_components_slot" ON "public"."compose_components" USING "btree" ("slot", "sort_order");



CREATE INDEX "idx_custom_meals_cart" ON "public"."custom_meals" USING "btree" ("cart_id");



CREATE INDEX "idx_custom_meals_user" ON "public"."custom_meals" USING "btree" ("user_id");



CREATE INDEX "idx_customers_city" ON "public"."customers" USING "btree" ("city");



CREATE INDEX "idx_customers_status" ON "public"."customers" USING "btree" ("status");



CREATE INDEX "idx_deliveries_date" ON "public"."deliveries" USING "btree" ("delivery_date");



CREATE INDEX "idx_deliveries_order" ON "public"."deliveries" USING "btree" ("order_id");



CREATE INDEX "idx_deliveries_status" ON "public"."deliveries" USING "btree" ("status");



CREATE INDEX "idx_deliveries_subscription" ON "public"."deliveries" USING "btree" ("subscription_id", "delivery_date");



CREATE INDEX "idx_meal_plans_category" ON "public"."meal_plans" USING "btree" ("mp_category_id");



CREATE INDEX "idx_meal_plans_published" ON "public"."meal_plans" USING "btree" ("published");



CREATE INDEX "idx_meals_meal_type" ON "public"."meals" USING "btree" ("meal_type");



CREATE INDEX "idx_meals_published" ON "public"."meals" USING "btree" ("published");



CREATE INDEX "idx_mpm_meal" ON "public"."meal_plan_meals" USING "btree" ("meal_id");



CREATE INDEX "idx_mpm_meal_plan" ON "public"."meal_plan_meals" USING "btree" ("meal_plan_id");



CREATE INDEX "idx_notifications_user" ON "public"."notifications" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_order_items_order" ON "public"."order_items" USING "btree" ("order_id");



CREATE INDEX "idx_orders_status" ON "public"."orders" USING "btree" ("status");



CREATE INDEX "idx_orders_user" ON "public"."orders" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_products_category" ON "public"."products" USING "btree" ("category", "is_active");



CREATE INDEX "idx_sessions_expires_at" ON "public"."sessions" USING "btree" ("expires_at");



CREATE INDEX "idx_sessions_user_id" ON "public"."sessions" USING "btree" ("user_id");



CREATE INDEX "idx_subscriptions_meal_plan" ON "public"."subscriptions" USING "btree" ("meal_plan_id");



CREATE INDEX "idx_subscriptions_status" ON "public"."subscriptions" USING "btree" ("status");



CREATE INDEX "idx_subscriptions_user" ON "public"."subscriptions" USING "btree" ("user_id", "status");



CREATE INDEX "idx_waitlist_email" ON "public"."waitlist" USING "btree" ("email");



CREATE INDEX "idx_waitlist_status" ON "public"."waitlist" USING "btree" ("status");



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."custom_meals"
    ADD CONSTRAINT "custom_meals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."deliveries"
    ADD CONSTRAINT "deliveries_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."deliveries"
    ADD CONSTRAINT "deliveries_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."meal_plan_meals"
    ADD CONSTRAINT "meal_plan_meals_meal_id_fkey" FOREIGN KEY ("meal_id") REFERENCES "public"."meals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."meal_plan_meals"
    ADD CONSTRAINT "meal_plan_meals_meal_plan_id_fkey" FOREIGN KEY ("meal_plan_id") REFERENCES "public"."meal_plans"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."meal_plans"
    ADD CONSTRAINT "meal_plans_mp_category_id_fkey" FOREIGN KEY ("mp_category_id") REFERENCES "public"."mp_categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."meal_type_prices"
    ADD CONSTRAINT "meal_type_prices_meal_plan_id_fkey" FOREIGN KEY ("meal_plan_id") REFERENCES "public"."meal_plans"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notification_preferences"
    ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_meal_plan_id_fkey" FOREIGN KEY ("meal_plan_id") REFERENCES "public"."meal_plans"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE "public"."cart_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."company_leads" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."compose_components" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."compose_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."content_hero" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."custom_meals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."customers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."deliveries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."discount_rules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."meal_plan_meals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."meal_plans" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."meal_type_prices" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."meals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mp_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notification_preferences" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscription_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."waitlist" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";





































































































































































GRANT ALL ON TABLE "public"."cart_items" TO "service_role";



GRANT ALL ON SEQUENCE "public"."cart_items_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."cart_items_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."cart_items_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."company_leads" TO "service_role";



GRANT ALL ON SEQUENCE "public"."company_leads_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."company_leads_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."company_leads_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."compose_components" TO "service_role";



GRANT ALL ON SEQUENCE "public"."compose_components_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."compose_components_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."compose_components_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."compose_settings" TO "service_role";



GRANT ALL ON SEQUENCE "public"."compose_settings_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."compose_settings_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."compose_settings_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."content_hero" TO "service_role";



GRANT ALL ON SEQUENCE "public"."content_hero_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."content_hero_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."content_hero_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."custom_meals" TO "service_role";



GRANT ALL ON SEQUENCE "public"."custom_meals_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."custom_meals_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."custom_meals_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."customers" TO "service_role";



GRANT ALL ON SEQUENCE "public"."customers_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."customers_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."customers_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."deliveries" TO "service_role";



GRANT ALL ON SEQUENCE "public"."deliveries_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."deliveries_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."deliveries_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."discount_rules" TO "service_role";



GRANT ALL ON SEQUENCE "public"."discount_rules_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."discount_rules_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."discount_rules_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."meal_plan_meals" TO "service_role";



GRANT ALL ON SEQUENCE "public"."meal_plan_meals_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."meal_plan_meals_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."meal_plan_meals_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."meal_plans" TO "service_role";



GRANT ALL ON SEQUENCE "public"."meal_plans_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."meal_plans_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."meal_plans_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."meal_type_prices" TO "service_role";



GRANT ALL ON SEQUENCE "public"."meal_type_prices_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."meal_type_prices_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."meal_type_prices_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."meals" TO "service_role";



GRANT ALL ON SEQUENCE "public"."meals_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."meals_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."meals_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."mp_categories" TO "service_role";



GRANT ALL ON SEQUENCE "public"."mp_categories_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."mp_categories_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."mp_categories_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."notification_preferences" TO "service_role";



GRANT ALL ON SEQUENCE "public"."notification_preferences_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."notification_preferences_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."notification_preferences_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."order_items" TO "service_role";



GRANT ALL ON SEQUENCE "public"."order_items_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."order_items_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."order_items_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON SEQUENCE "public"."orders_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."orders_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."orders_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON SEQUENCE "public"."products_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."products_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."products_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."sessions" TO "service_role";



GRANT ALL ON TABLE "public"."subscription_requests" TO "service_role";



GRANT ALL ON SEQUENCE "public"."subscription_requests_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."subscription_requests_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."subscription_requests_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."subscriptions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."subscriptions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."subscriptions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."subscriptions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON SEQUENCE "public"."users_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."users_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."users_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."waitlist" TO "service_role";



GRANT ALL ON SEQUENCE "public"."waitlist_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."waitlist_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."waitlist_id_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";

revoke delete on table "public"."cart_items" from "anon";

revoke insert on table "public"."cart_items" from "anon";

revoke references on table "public"."cart_items" from "anon";

revoke select on table "public"."cart_items" from "anon";

revoke trigger on table "public"."cart_items" from "anon";

revoke truncate on table "public"."cart_items" from "anon";

revoke update on table "public"."cart_items" from "anon";

revoke delete on table "public"."cart_items" from "authenticated";

revoke insert on table "public"."cart_items" from "authenticated";

revoke references on table "public"."cart_items" from "authenticated";

revoke select on table "public"."cart_items" from "authenticated";

revoke trigger on table "public"."cart_items" from "authenticated";

revoke truncate on table "public"."cart_items" from "authenticated";

revoke update on table "public"."cart_items" from "authenticated";

revoke delete on table "public"."company_leads" from "anon";

revoke insert on table "public"."company_leads" from "anon";

revoke references on table "public"."company_leads" from "anon";

revoke select on table "public"."company_leads" from "anon";

revoke trigger on table "public"."company_leads" from "anon";

revoke truncate on table "public"."company_leads" from "anon";

revoke update on table "public"."company_leads" from "anon";

revoke delete on table "public"."company_leads" from "authenticated";

revoke insert on table "public"."company_leads" from "authenticated";

revoke references on table "public"."company_leads" from "authenticated";

revoke select on table "public"."company_leads" from "authenticated";

revoke trigger on table "public"."company_leads" from "authenticated";

revoke truncate on table "public"."company_leads" from "authenticated";

revoke update on table "public"."company_leads" from "authenticated";

revoke delete on table "public"."compose_components" from "anon";

revoke insert on table "public"."compose_components" from "anon";

revoke references on table "public"."compose_components" from "anon";

revoke select on table "public"."compose_components" from "anon";

revoke trigger on table "public"."compose_components" from "anon";

revoke truncate on table "public"."compose_components" from "anon";

revoke update on table "public"."compose_components" from "anon";

revoke delete on table "public"."compose_components" from "authenticated";

revoke insert on table "public"."compose_components" from "authenticated";

revoke references on table "public"."compose_components" from "authenticated";

revoke select on table "public"."compose_components" from "authenticated";

revoke trigger on table "public"."compose_components" from "authenticated";

revoke truncate on table "public"."compose_components" from "authenticated";

revoke update on table "public"."compose_components" from "authenticated";

revoke delete on table "public"."compose_settings" from "anon";

revoke insert on table "public"."compose_settings" from "anon";

revoke references on table "public"."compose_settings" from "anon";

revoke select on table "public"."compose_settings" from "anon";

revoke trigger on table "public"."compose_settings" from "anon";

revoke truncate on table "public"."compose_settings" from "anon";

revoke update on table "public"."compose_settings" from "anon";

revoke delete on table "public"."compose_settings" from "authenticated";

revoke insert on table "public"."compose_settings" from "authenticated";

revoke references on table "public"."compose_settings" from "authenticated";

revoke select on table "public"."compose_settings" from "authenticated";

revoke trigger on table "public"."compose_settings" from "authenticated";

revoke truncate on table "public"."compose_settings" from "authenticated";

revoke update on table "public"."compose_settings" from "authenticated";

revoke delete on table "public"."content_hero" from "anon";

revoke insert on table "public"."content_hero" from "anon";

revoke references on table "public"."content_hero" from "anon";

revoke select on table "public"."content_hero" from "anon";

revoke trigger on table "public"."content_hero" from "anon";

revoke truncate on table "public"."content_hero" from "anon";

revoke update on table "public"."content_hero" from "anon";

revoke delete on table "public"."content_hero" from "authenticated";

revoke insert on table "public"."content_hero" from "authenticated";

revoke references on table "public"."content_hero" from "authenticated";

revoke select on table "public"."content_hero" from "authenticated";

revoke trigger on table "public"."content_hero" from "authenticated";

revoke truncate on table "public"."content_hero" from "authenticated";

revoke update on table "public"."content_hero" from "authenticated";

revoke delete on table "public"."custom_meals" from "anon";

revoke insert on table "public"."custom_meals" from "anon";

revoke references on table "public"."custom_meals" from "anon";

revoke select on table "public"."custom_meals" from "anon";

revoke trigger on table "public"."custom_meals" from "anon";

revoke truncate on table "public"."custom_meals" from "anon";

revoke update on table "public"."custom_meals" from "anon";

revoke delete on table "public"."custom_meals" from "authenticated";

revoke insert on table "public"."custom_meals" from "authenticated";

revoke references on table "public"."custom_meals" from "authenticated";

revoke select on table "public"."custom_meals" from "authenticated";

revoke trigger on table "public"."custom_meals" from "authenticated";

revoke truncate on table "public"."custom_meals" from "authenticated";

revoke update on table "public"."custom_meals" from "authenticated";

revoke delete on table "public"."customers" from "anon";

revoke insert on table "public"."customers" from "anon";

revoke references on table "public"."customers" from "anon";

revoke select on table "public"."customers" from "anon";

revoke trigger on table "public"."customers" from "anon";

revoke truncate on table "public"."customers" from "anon";

revoke update on table "public"."customers" from "anon";

revoke delete on table "public"."customers" from "authenticated";

revoke insert on table "public"."customers" from "authenticated";

revoke references on table "public"."customers" from "authenticated";

revoke select on table "public"."customers" from "authenticated";

revoke trigger on table "public"."customers" from "authenticated";

revoke truncate on table "public"."customers" from "authenticated";

revoke update on table "public"."customers" from "authenticated";

revoke delete on table "public"."deliveries" from "anon";

revoke insert on table "public"."deliveries" from "anon";

revoke references on table "public"."deliveries" from "anon";

revoke select on table "public"."deliveries" from "anon";

revoke trigger on table "public"."deliveries" from "anon";

revoke truncate on table "public"."deliveries" from "anon";

revoke update on table "public"."deliveries" from "anon";

revoke delete on table "public"."deliveries" from "authenticated";

revoke insert on table "public"."deliveries" from "authenticated";

revoke references on table "public"."deliveries" from "authenticated";

revoke select on table "public"."deliveries" from "authenticated";

revoke trigger on table "public"."deliveries" from "authenticated";

revoke truncate on table "public"."deliveries" from "authenticated";

revoke update on table "public"."deliveries" from "authenticated";

revoke delete on table "public"."discount_rules" from "anon";

revoke insert on table "public"."discount_rules" from "anon";

revoke references on table "public"."discount_rules" from "anon";

revoke select on table "public"."discount_rules" from "anon";

revoke trigger on table "public"."discount_rules" from "anon";

revoke truncate on table "public"."discount_rules" from "anon";

revoke update on table "public"."discount_rules" from "anon";

revoke delete on table "public"."discount_rules" from "authenticated";

revoke insert on table "public"."discount_rules" from "authenticated";

revoke references on table "public"."discount_rules" from "authenticated";

revoke select on table "public"."discount_rules" from "authenticated";

revoke trigger on table "public"."discount_rules" from "authenticated";

revoke truncate on table "public"."discount_rules" from "authenticated";

revoke update on table "public"."discount_rules" from "authenticated";

revoke delete on table "public"."meal_plan_meals" from "anon";

revoke insert on table "public"."meal_plan_meals" from "anon";

revoke references on table "public"."meal_plan_meals" from "anon";

revoke select on table "public"."meal_plan_meals" from "anon";

revoke trigger on table "public"."meal_plan_meals" from "anon";

revoke truncate on table "public"."meal_plan_meals" from "anon";

revoke update on table "public"."meal_plan_meals" from "anon";

revoke delete on table "public"."meal_plan_meals" from "authenticated";

revoke insert on table "public"."meal_plan_meals" from "authenticated";

revoke references on table "public"."meal_plan_meals" from "authenticated";

revoke select on table "public"."meal_plan_meals" from "authenticated";

revoke trigger on table "public"."meal_plan_meals" from "authenticated";

revoke truncate on table "public"."meal_plan_meals" from "authenticated";

revoke update on table "public"."meal_plan_meals" from "authenticated";

revoke delete on table "public"."meal_plans" from "anon";

revoke insert on table "public"."meal_plans" from "anon";

revoke references on table "public"."meal_plans" from "anon";

revoke select on table "public"."meal_plans" from "anon";

revoke trigger on table "public"."meal_plans" from "anon";

revoke truncate on table "public"."meal_plans" from "anon";

revoke update on table "public"."meal_plans" from "anon";

revoke delete on table "public"."meal_plans" from "authenticated";

revoke insert on table "public"."meal_plans" from "authenticated";

revoke references on table "public"."meal_plans" from "authenticated";

revoke select on table "public"."meal_plans" from "authenticated";

revoke trigger on table "public"."meal_plans" from "authenticated";

revoke truncate on table "public"."meal_plans" from "authenticated";

revoke update on table "public"."meal_plans" from "authenticated";

revoke delete on table "public"."meal_type_prices" from "anon";

revoke insert on table "public"."meal_type_prices" from "anon";

revoke references on table "public"."meal_type_prices" from "anon";

revoke select on table "public"."meal_type_prices" from "anon";

revoke trigger on table "public"."meal_type_prices" from "anon";

revoke truncate on table "public"."meal_type_prices" from "anon";

revoke update on table "public"."meal_type_prices" from "anon";

revoke delete on table "public"."meal_type_prices" from "authenticated";

revoke insert on table "public"."meal_type_prices" from "authenticated";

revoke references on table "public"."meal_type_prices" from "authenticated";

revoke select on table "public"."meal_type_prices" from "authenticated";

revoke trigger on table "public"."meal_type_prices" from "authenticated";

revoke truncate on table "public"."meal_type_prices" from "authenticated";

revoke update on table "public"."meal_type_prices" from "authenticated";

revoke delete on table "public"."meals" from "anon";

revoke insert on table "public"."meals" from "anon";

revoke references on table "public"."meals" from "anon";

revoke select on table "public"."meals" from "anon";

revoke trigger on table "public"."meals" from "anon";

revoke truncate on table "public"."meals" from "anon";

revoke update on table "public"."meals" from "anon";

revoke delete on table "public"."meals" from "authenticated";

revoke insert on table "public"."meals" from "authenticated";

revoke references on table "public"."meals" from "authenticated";

revoke select on table "public"."meals" from "authenticated";

revoke trigger on table "public"."meals" from "authenticated";

revoke truncate on table "public"."meals" from "authenticated";

revoke update on table "public"."meals" from "authenticated";

revoke delete on table "public"."mp_categories" from "anon";

revoke insert on table "public"."mp_categories" from "anon";

revoke references on table "public"."mp_categories" from "anon";

revoke select on table "public"."mp_categories" from "anon";

revoke trigger on table "public"."mp_categories" from "anon";

revoke truncate on table "public"."mp_categories" from "anon";

revoke update on table "public"."mp_categories" from "anon";

revoke delete on table "public"."mp_categories" from "authenticated";

revoke insert on table "public"."mp_categories" from "authenticated";

revoke references on table "public"."mp_categories" from "authenticated";

revoke select on table "public"."mp_categories" from "authenticated";

revoke trigger on table "public"."mp_categories" from "authenticated";

revoke truncate on table "public"."mp_categories" from "authenticated";

revoke update on table "public"."mp_categories" from "authenticated";

revoke delete on table "public"."notification_preferences" from "anon";

revoke insert on table "public"."notification_preferences" from "anon";

revoke references on table "public"."notification_preferences" from "anon";

revoke select on table "public"."notification_preferences" from "anon";

revoke trigger on table "public"."notification_preferences" from "anon";

revoke truncate on table "public"."notification_preferences" from "anon";

revoke update on table "public"."notification_preferences" from "anon";

revoke delete on table "public"."notification_preferences" from "authenticated";

revoke insert on table "public"."notification_preferences" from "authenticated";

revoke references on table "public"."notification_preferences" from "authenticated";

revoke select on table "public"."notification_preferences" from "authenticated";

revoke trigger on table "public"."notification_preferences" from "authenticated";

revoke truncate on table "public"."notification_preferences" from "authenticated";

revoke update on table "public"."notification_preferences" from "authenticated";

revoke delete on table "public"."notifications" from "anon";

revoke insert on table "public"."notifications" from "anon";

revoke references on table "public"."notifications" from "anon";

revoke select on table "public"."notifications" from "anon";

revoke trigger on table "public"."notifications" from "anon";

revoke truncate on table "public"."notifications" from "anon";

revoke update on table "public"."notifications" from "anon";

revoke delete on table "public"."notifications" from "authenticated";

revoke insert on table "public"."notifications" from "authenticated";

revoke references on table "public"."notifications" from "authenticated";

revoke select on table "public"."notifications" from "authenticated";

revoke trigger on table "public"."notifications" from "authenticated";

revoke truncate on table "public"."notifications" from "authenticated";

revoke update on table "public"."notifications" from "authenticated";

revoke delete on table "public"."order_items" from "anon";

revoke insert on table "public"."order_items" from "anon";

revoke references on table "public"."order_items" from "anon";

revoke select on table "public"."order_items" from "anon";

revoke trigger on table "public"."order_items" from "anon";

revoke truncate on table "public"."order_items" from "anon";

revoke update on table "public"."order_items" from "anon";

revoke delete on table "public"."order_items" from "authenticated";

revoke insert on table "public"."order_items" from "authenticated";

revoke references on table "public"."order_items" from "authenticated";

revoke select on table "public"."order_items" from "authenticated";

revoke trigger on table "public"."order_items" from "authenticated";

revoke truncate on table "public"."order_items" from "authenticated";

revoke update on table "public"."order_items" from "authenticated";

revoke delete on table "public"."orders" from "anon";

revoke insert on table "public"."orders" from "anon";

revoke references on table "public"."orders" from "anon";

revoke select on table "public"."orders" from "anon";

revoke trigger on table "public"."orders" from "anon";

revoke truncate on table "public"."orders" from "anon";

revoke update on table "public"."orders" from "anon";

revoke delete on table "public"."orders" from "authenticated";

revoke insert on table "public"."orders" from "authenticated";

revoke references on table "public"."orders" from "authenticated";

revoke select on table "public"."orders" from "authenticated";

revoke trigger on table "public"."orders" from "authenticated";

revoke truncate on table "public"."orders" from "authenticated";

revoke update on table "public"."orders" from "authenticated";

revoke delete on table "public"."products" from "anon";

revoke insert on table "public"."products" from "anon";

revoke references on table "public"."products" from "anon";

revoke select on table "public"."products" from "anon";

revoke trigger on table "public"."products" from "anon";

revoke truncate on table "public"."products" from "anon";

revoke update on table "public"."products" from "anon";

revoke delete on table "public"."products" from "authenticated";

revoke insert on table "public"."products" from "authenticated";

revoke references on table "public"."products" from "authenticated";

revoke select on table "public"."products" from "authenticated";

revoke trigger on table "public"."products" from "authenticated";

revoke truncate on table "public"."products" from "authenticated";

revoke update on table "public"."products" from "authenticated";

revoke delete on table "public"."sessions" from "anon";

revoke insert on table "public"."sessions" from "anon";

revoke references on table "public"."sessions" from "anon";

revoke select on table "public"."sessions" from "anon";

revoke trigger on table "public"."sessions" from "anon";

revoke truncate on table "public"."sessions" from "anon";

revoke update on table "public"."sessions" from "anon";

revoke delete on table "public"."sessions" from "authenticated";

revoke insert on table "public"."sessions" from "authenticated";

revoke references on table "public"."sessions" from "authenticated";

revoke select on table "public"."sessions" from "authenticated";

revoke trigger on table "public"."sessions" from "authenticated";

revoke truncate on table "public"."sessions" from "authenticated";

revoke update on table "public"."sessions" from "authenticated";

revoke delete on table "public"."subscription_requests" from "anon";

revoke insert on table "public"."subscription_requests" from "anon";

revoke references on table "public"."subscription_requests" from "anon";

revoke select on table "public"."subscription_requests" from "anon";

revoke trigger on table "public"."subscription_requests" from "anon";

revoke truncate on table "public"."subscription_requests" from "anon";

revoke update on table "public"."subscription_requests" from "anon";

revoke delete on table "public"."subscription_requests" from "authenticated";

revoke insert on table "public"."subscription_requests" from "authenticated";

revoke references on table "public"."subscription_requests" from "authenticated";

revoke select on table "public"."subscription_requests" from "authenticated";

revoke trigger on table "public"."subscription_requests" from "authenticated";

revoke truncate on table "public"."subscription_requests" from "authenticated";

revoke update on table "public"."subscription_requests" from "authenticated";

revoke delete on table "public"."subscriptions" from "anon";

revoke insert on table "public"."subscriptions" from "anon";

revoke references on table "public"."subscriptions" from "anon";

revoke select on table "public"."subscriptions" from "anon";

revoke trigger on table "public"."subscriptions" from "anon";

revoke truncate on table "public"."subscriptions" from "anon";

revoke update on table "public"."subscriptions" from "anon";

revoke delete on table "public"."subscriptions" from "authenticated";

revoke insert on table "public"."subscriptions" from "authenticated";

revoke references on table "public"."subscriptions" from "authenticated";

revoke select on table "public"."subscriptions" from "authenticated";

revoke trigger on table "public"."subscriptions" from "authenticated";

revoke truncate on table "public"."subscriptions" from "authenticated";

revoke update on table "public"."subscriptions" from "authenticated";

revoke delete on table "public"."users" from "anon";

revoke insert on table "public"."users" from "anon";

revoke references on table "public"."users" from "anon";

revoke select on table "public"."users" from "anon";

revoke trigger on table "public"."users" from "anon";

revoke truncate on table "public"."users" from "anon";

revoke update on table "public"."users" from "anon";

revoke delete on table "public"."users" from "authenticated";

revoke insert on table "public"."users" from "authenticated";

revoke references on table "public"."users" from "authenticated";

revoke select on table "public"."users" from "authenticated";

revoke trigger on table "public"."users" from "authenticated";

revoke truncate on table "public"."users" from "authenticated";

revoke update on table "public"."users" from "authenticated";

revoke delete on table "public"."waitlist" from "anon";

revoke insert on table "public"."waitlist" from "anon";

revoke references on table "public"."waitlist" from "anon";

revoke select on table "public"."waitlist" from "anon";

revoke trigger on table "public"."waitlist" from "anon";

revoke truncate on table "public"."waitlist" from "anon";

revoke update on table "public"."waitlist" from "anon";

revoke delete on table "public"."waitlist" from "authenticated";

revoke insert on table "public"."waitlist" from "authenticated";

revoke references on table "public"."waitlist" from "authenticated";

revoke select on table "public"."waitlist" from "authenticated";

revoke trigger on table "public"."waitlist" from "authenticated";

revoke truncate on table "public"."waitlist" from "authenticated";

revoke update on table "public"."waitlist" from "authenticated";

alter table "public"."company_leads" drop constraint "company_leads_need_type_chk";

alter table "public"."company_leads" drop constraint "company_leads_status_chk";

alter table "public"."compose_components" drop constraint "compose_components_slot_chk";

alter table "public"."discount_rules" drop constraint "discount_rules_stacking_behavior_chk";

alter table "public"."company_leads" add constraint "company_leads_need_type_chk" CHECK (((need_type)::text = ANY ((ARRAY['event'::character varying, 'daily'::character varying, 'both'::character varying])::text[]))) not valid;

alter table "public"."company_leads" validate constraint "company_leads_need_type_chk";

alter table "public"."company_leads" add constraint "company_leads_status_chk" CHECK (((status)::text = ANY ((ARRAY['new'::character varying, 'contacted'::character varying, 'qualified'::character varying, 'won'::character varying, 'lost'::character varying])::text[]))) not valid;

alter table "public"."company_leads" validate constraint "company_leads_status_chk";

alter table "public"."compose_components" add constraint "compose_components_slot_chk" CHECK (((slot)::text = ANY ((ARRAY['protein'::character varying, 'carb'::character varying, 'veg'::character varying, 'sauce'::character varying, 'extra'::character varying])::text[]))) not valid;

alter table "public"."compose_components" validate constraint "compose_components_slot_chk";

alter table "public"."discount_rules" add constraint "discount_rules_stacking_behavior_chk" CHECK (((stacking_behavior)::text = ANY ((ARRAY['stack'::character varying, 'exclusive'::character varying, 'best'::character varying])::text[]))) not valid;

alter table "public"."discount_rules" validate constraint "discount_rules_stacking_behavior_chk";


