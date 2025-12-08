import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: Request){
  try{
    const b = await req.json();
    // validation minimaliste
    if(!b.full_name || !b.email || !b.phone){
      return NextResponse.json({ error: "Merci de renseigner nom, email et téléphone." }, { status: 400 });
    }
    
    // Create subscription_requests table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS subscription_requests (
        id SERIAL PRIMARY KEY,
        plan VARCHAR(100),
        meals TEXT[],
        days INTEGER,
        duration INTEGER,
        total NUMERIC(10,2),
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        note TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    // insert lead
    await sql`
      INSERT INTO subscription_requests (plan, meals, days, duration, total, full_name, email, phone, note)
      VALUES (
        ${b.plan || null},
        ${b.meals || null},
        ${b.days || null},
        ${b.duration || null},
        ${b.total || null},
        ${b.full_name},
        ${b.email},
        ${b.phone},
        ${b.note || null}
      )
    `;
    
    return NextResponse.json({ ok: true });
  }catch(e:any){
    return NextResponse.json({ error: e?.message || "Erreur" }, { status: 500 });
  }
}
