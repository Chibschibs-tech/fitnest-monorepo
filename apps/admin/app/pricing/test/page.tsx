"use client";
import { useState } from "react";

const WEB = process.env.NEXT_PUBLIC_WEB_BASE_URL || ""; // ex: https://<codespace>-3000.app.github.dev

export default function PricingTest() {
  const [out, setOut] = useState<any>(null);
  const [plan, setPlan] = useState("Weight Loss");
  const [meals, setMeals] = useState<string[]>(["Breakfast", "Lunch"]);
  const [days, setDays] = useState(5);
  const [duration, setDuration] = useState(4);

  async function run() {
    const r = await fetch(`${WEB}/api/calculate-price`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, meals, days, duration }),
    });
    const j = await r.json();
    setOut(j);
  }

  function toggle(meal: string) {
    setMeals((m) => (m.includes(meal) ? m.filter((x) => x !== meal) : [...m, meal]));
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Admin — Pricing Test</h1>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <input value={plan} onChange={(e) => setPlan(e.target.value)} />
        <label>
          <input type="checkbox" checked={meals.includes("Breakfast")} onChange={() => toggle("Breakfast")} /> Breakfast
        </label>
        <label>
          <input type="checkbox" checked={meals.includes("Lunch")} onChange={() => toggle("Lunch")} /> Lunch
        </label>
        <label>
          <input type="checkbox" checked={meals.includes("Dinner")} onChange={() => toggle("Dinner")} /> Dinner
        </label>
        <input type="number" value={days} onChange={(e) => setDays(Number(e.target.value))} />
        <input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
        <button onClick={run}>Calculate</button>
      </div>

      <pre>{out ? JSON.stringify(out, null, 2) : "No result"}</pre>
    </main>
  );
}
