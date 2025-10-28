// app/api/admin/bootstrap/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Sécurisation simple : token en header ou en query
  const token =
    req.nextUrl.searchParams.get("token") ??
    req.headers.get("x-bootstrap-token") ??
    "";

  if (!process.env.BOOTSTRAP_TOKEN || token !== process.env.BOOTSTRAP_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // --- SCHEMA V1 MINIMAL & SAIN ---
    await sql/*sql*/`
    create table if not exists users (
      id serial primary key,
      name text not null,
      email text not null unique,
      password text not null,
      role text default 'user',
      acquisition_source text default 'direct',
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );

    create table if not exists meal_plans (
      id serial primary key,
      name text not null,
      description text,
      weekly_price numeric(10,2) not null,
      type text not null,
      calories_min int,
      calories_max int,
      active boolean default true,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );

    create table if not exists meals (
      id serial primary key,
      name text not null,
      description text,
      calories int,
      protein int,
      carbs int,
      fat int,
      image_url text,
      category text,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );

    create table if not exists meal_plan_meals (
      id serial primary key,
      meal_plan_id int not null references meal_plans(id) on delete cascade,
      meal_id int not null references meals(id) on delete cascade,
      day_of_week int,         -- 0..6
      slot text                -- breakfast/lunch/dinner/etc
    );

    create unique index if not exists meal_plan_meals_uq
      on meal_plan_meals(meal_plan_id, meal_id, day_of_week, slot);

    create table if not exists products (
      id serial primary key,
      name text not null,
      description text,
      price numeric(10,2) not null,
      sale_price numeric(10,2),
      image_url text,
      category text,
      tags text,
      nutritional_info jsonb,
      stock int default 0,
      is_active boolean default true,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );

    create table if not exists orders (
      id serial primary key,
      user_id int references users(id),
      total numeric(10,2) not null,
      status text default 'pending',
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );

    create table if not exists order_items (
      id serial primary key,
      order_id int not null references orders(id) on delete cascade,
      product_id int references products(id),
      meal_id int references meals(id),
      quantity int default 1,
      unit_price numeric(10,2) not null
    );

    create table if not exists deliveries (
      id serial primary key,
      order_id int not null references orders(id) on delete cascade,
      status text default 'scheduled',
      scheduled_date date,
      created_at timestamptz default now()
    );

    create table if not exists notification_preferences (
      id serial primary key,
      user_id int not null references users(id) on delete cascade,
      email_notifications boolean default true,
      sms_notifications boolean default false,
      push_notifications boolean default true,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );

    create table if not exists meal_preferences (
      id serial primary key,
      user_id int not null references users(id) on delete cascade,
      dietary_restrictions text,
      allergies text,
      preferred_cuisines text,
      disliked_ingredients text,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );

    create table if not exists waitlist (
      id serial primary key,
      name text not null,
      email text not null,
      phone text,
      meal_plan_preference text,
      city text,
      notifications boolean default true,
      created_at timestamptz default now()
    );

    -- Abos & pricing simples
    create table if not exists plans (
      id serial primary key,
      code text unique,            -- ex: weekly_basic
      name text not null,
      description text
    );

    create table if not exists plan_prices (
      id serial primary key,
      plan_id int not null references plans(id) on delete cascade,
      billing_period text not null,       -- weekly/monthly
      unit_amount numeric(10,2) not null
    );

    create unique index if not exists plan_prices_uq
      on plan_prices(plan_id, billing_period);

    create table if not exists subscriptions (
      id serial primary key,
      user_id int not null references users(id) on delete cascade,
      plan_id int not null references plans(id),
      status text default 'active',
      current_period_start date,
      current_period_end date,
      created_at timestamptz default now()
    );
    `;

    // --- Seeds mini (idempotents) ---
    await sql/*sql*/`
      insert into plans (code, name, description) values
        ('weekly_basic','Weekly Basic','Basic weekly plan')
      on conflict (code) do nothing;
    `;

    await sql/*sql*/`
      insert into plan_prices (plan_id, billing_period, unit_amount)
      select id, 'weekly', 199.00 from plans where code = 'weekly_basic'
      on conflict do nothing;
    `;

    await sql/*sql*/`
      insert into meal_plans (name, description, weekly_price, type, active)
      values ('Starter', 'Starter meal plan', 199.00, 'weekly', true)
      on conflict do nothing;
    `;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
