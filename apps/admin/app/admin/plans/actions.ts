"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@fitnest/db/src/client";

export async function createPlan(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const title = String(formData.get("title") ?? "");
  const audience = String(formData.get("audience") ?? "balanced");

  const { error } = await supabase
    .from("plans")
    .insert([{ slug, title, audience, published: true }]);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/plans");
}

export async function addVariant(formData: FormData) {
  const mealPlanId = Number(formData.get("mealPlanId"));
  const label = String(formData.get("label") ?? "");
  const daysPerWeek = Number(formData.get("daysPerWeek") ?? 5);
  const mealsPerDay = Number(formData.get("mealsPerDay") ?? 3);
  const weeklyPriceMAD = Number(formData.get("weeklyPriceMAD") ?? 0);

  const { error } = await supabase
    .from("plan_variants")
    .insert([{ meal_plan_id: mealPlanId, label, days_per_week: daysPerWeek,
               meals_per_day: mealsPerDay, weekly_price_mad: weeklyPriceMAD, published: true }]);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/plans");
}

export async function deletePlan(id: number) {
  const { error } = await supabase.from("plans").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/plans");
}
