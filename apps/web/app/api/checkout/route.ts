import { NextResponse } from "next/server";
import { supabase } from "@fitnest/db";

export async function POST(req: Request){
  try{
    const b = await req.json();
    // validation minimaliste
    if(!b.full_name || !b.email || !b.phone){
      return NextResponse.json({ error: "Merci de renseigner nom, email et téléphone." }, { status: 400 });
    }
    // insert lead
    const { error } = await supabase.from("subscription_requests").insert({
      plan: b.plan,
      meals: b.meals,
      days: b.days,
      duration: b.duration,
      total: b.total,
      full_name: b.full_name,
      email: b.email,
      phone: b.phone,
      note: b.note ?? null,
    });
    if(error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }catch(e:any){
    return NextResponse.json({ error: e?.message || "Erreur" }, { status: 500 });
  }
}