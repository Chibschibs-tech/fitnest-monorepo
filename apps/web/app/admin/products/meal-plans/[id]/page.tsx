import { MealPlanDetailContent } from "./meal-plan-detail-content"

export default async function MealPlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <div className="container mx-auto p-6">
      <MealPlanDetailContent mealPlanId={id} />
    </div>
  )
}

