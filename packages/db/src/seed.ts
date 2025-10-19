import { db } from "./client";
import { meals, mealPlans, planVariants } from "./schema";

async function run() {
  await db.insert(mealPlans).values({
    slug: "keto-classic",
    title: "Keto Classic",
    summary: "Keto, low-carb, high-protein",
    audience: "keto",
    published: true
  }).onConflictDoNothing?.();

  await db.insert(meals).values({
    slug: "chicken-avocado-bowl",
    title: "Chicken & Avocado Bowl",
    description: "Grilled chicken, avocado, greens",
    kcal: 520, protein: "42", carbs: "8", fat: "34",
    tags: ["keto","high-protein"],
    published: true
  }).onConflictDoNothing?.();

  await db.insert(planVariants).values({
    mealPlanId: 1, label: "5 jours • 3 repas/jour",
    daysPerWeek: 5, mealsPerDay: 3, weeklyPriceMAD: "899.00", published: true
  }).onConflictDoNothing?.();

  console.log("Seed done ✅");
}

run().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1);});
