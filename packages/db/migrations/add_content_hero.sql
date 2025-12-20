-- Create content_hero table for managing hero section content
CREATE TABLE IF NOT EXISTS "content_hero" (
  "id" serial PRIMARY KEY NOT NULL,
  "desktop_image_url" text,
  "mobile_image_url" text,
  "title" varchar(200),
  "description" text,
  "alt_text" varchar(255),
  "seo_title" varchar(200),
  "seo_description" text,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);



