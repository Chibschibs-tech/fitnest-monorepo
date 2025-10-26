"use client";
import { useState } from "react";
export default function Home() {
  const [out, setOut] = useState<any>(null);
  async function test() {
    const r = await fetch("/api/calculate-price", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plan: "Weight Loss",
        meals: ["Breakfast","Lunch"],
        days: 5,
        duration: 4
      })
    });
    setOut(await r.json());
  }
  return (
    <main style={{padding:24}}>
      <h1>Fitnest — Web</h1>
      <button onClick={test}>Test Pricing</button>
      <pre>{out ? JSON.stringify(out, null, 2) : "No result yet."}</pre>
    </main>
  );
}
