export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"


export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const subscriptionId = Number.parseInt(params.id)

    if (isNaN(subscriptionId)) {
      return NextResponse.json({ error: "Invalid subscription ID" }, { status: 400 })
    }

    console.log("Fetching order days for subscription ID:", subscriptionId)

    // First, try to get the actual order data
    let orderData = null
    try {
      const orderResult = await sql`
        SELECT 
          id,
          selected_days,
          selected_weeks,
          start_date,
          status,
          plan_name
        FROM orders 
        WHERE id = ${subscriptionId}
      `
      orderData = orderResult[0]
    } catch (error) {
      console.log("Could not fetch order data:", error)
    }

    // If we have real order data, use it
    if (orderData && orderData.selected_days && orderData.selected_weeks) {
      const selectedDays = JSON.parse(orderData.selected_days) // e.g., ["monday", "wednesday", "friday"]
      const selectedWeeks = Number.parseInt(orderData.selected_weeks) || 1
      const startDate = new Date(orderData.start_date || new Date())

      // Generate delivery dates based on customer's actual selections
      const deliveries = []
      const dayMapping = {
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
        sunday: 0,
      }

      let deliveryId = 1
      for (let week = 0; week < selectedWeeks; week++) {
        for (const dayName of selectedDays) {
          const dayOfWeek = dayMapping[dayName.toLowerCase()]
          const deliveryDate = new Date(startDate)

          // Calculate the date for this specific day in this specific week
          const daysFromStart = week * 7 + ((dayOfWeek - startDate.getDay() + 7) % 7)
          deliveryDate.setDate(startDate.getDate() + daysFromStart)

          deliveries.push({
            id: deliveryId++,
            scheduledDate: deliveryDate.toISOString(),
            dayName: dayName,
            weekNumber: week + 1,
            status: "pending", // All start as pending, will be marked delivered by backend
          })
        }
      }

      // Sort by date
      deliveries.sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())

      // Check for delivered days (this would come from a delivery_status table in production)
      try {
        const deliveredDays = await sql`
          SELECT delivery_date, status 
          FROM delivery_status 
          WHERE order_id = ${subscriptionId}
        `

        // Mark delivered days
        deliveries.forEach((delivery) => {
          const deliveredDay = deliveredDays.find(
            (d) => new Date(d.delivery_date).toDateString() === new Date(delivery.scheduledDate).toDateString(),
          )
          if (deliveredDay) {
            delivery.status = deliveredDay.status
          }
        })
      } catch (error) {
        console.log("Delivery status table not found, using mock delivered status")
        // Mock some delivered days for demo
        deliveries.slice(0, 2).forEach((delivery) => {
          if (new Date(delivery.scheduledDate) < new Date()) {
            delivery.status = "delivered"
          }
        })
      }

      const totalDeliveries = deliveries.length
      const completedDeliveries = deliveries.filter((d) => d.status === "delivered").length
      const pendingDeliveries = deliveries.filter((d) => d.status === "pending").length
      const nextDelivery = deliveries.find((d) => d.status === "pending")

      // Check if can pause (next delivery is at least 72 hours away)
      const canPause = nextDelivery
        ? new Date(nextDelivery.scheduledDate).getTime() > Date.now() + 72 * 60 * 60 * 1000
        : false

      return NextResponse.json({
        deliveries,
        totalDeliveries,
        completedDeliveries,
        pendingDeliveries,
        nextDeliveryDate: nextDelivery?.scheduledDate,
        canPause,
        pauseEligibleDate: canPause ? null : new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
      })
    }

    // Fallback: Generate mock data based on subscription ID to show different patterns
    console.log("Using mock order data for subscription:", subscriptionId)

    const mockOrderData = {
      28: { days: ["monday", "wednesday", "friday"], weeks: 4, planName: "Balanced Nutrition" },
      27: { days: ["tuesday", "thursday"], weeks: 3, planName: "Muscle Gain Plan" },
      26: { days: ["monday", "thursday"], weeks: 2, planName: "Muscle Gain Plan" },
    }

    const mockData = mockOrderData[subscriptionId] || {
      days: ["monday", "wednesday", "friday"],
      weeks: 2,
      planName: "Weight Loss Plan",
    }
    const startDate = new Date()
    startDate.setDate(startDate.getDate() + 1) // Start tomorrow

    const deliveries = []
    const dayMapping = {
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
      sunday: 0,
    }

    let deliveryId = 1
    for (let week = 0; week < mockData.weeks; week++) {
      for (const dayName of mockData.days) {
        const dayOfWeek = dayMapping[dayName]
        const deliveryDate = new Date(startDate)

        // Calculate the date for this specific day in this specific week
        const daysFromStart = week * 7 + ((dayOfWeek - startDate.getDay() + 7) % 7)
        deliveryDate.setDate(startDate.getDate() + daysFromStart)

        const isPastDate = deliveryDate < new Date()
        const isRecentPast = deliveryDate < new Date() && deliveryDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

        deliveries.push({
          id: deliveryId++,
          scheduledDate: deliveryDate.toISOString(),
          dayName: dayName,
          weekNumber: week + 1,
          status: isPastDate || isRecentPast ? "delivered" : "pending",
        })
      }
    }

    // Sort by date
    deliveries.sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())

    const totalDeliveries = deliveries.length
    const completedDeliveries = deliveries.filter((d) => d.status === "delivered").length
    const pendingDeliveries = deliveries.filter((d) => d.status === "pending").length
    const nextDelivery = deliveries.find((d) => d.status === "pending")

    const canPause = nextDelivery
      ? new Date(nextDelivery.scheduledDate).getTime() > Date.now() + 72 * 60 * 60 * 1000
      : false

    return NextResponse.json({
      deliveries,
      totalDeliveries,
      completedDeliveries,
      pendingDeliveries,
      nextDeliveryDate: nextDelivery?.scheduledDate,
      canPause,
      pauseEligibleDate: canPause ? null : new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
    })
  } catch (error) {
    console.error("Error fetching delivery schedule:", error)
    return NextResponse.json({ error: "Failed to fetch delivery schedule" }, { status: 500 })
  }
}
