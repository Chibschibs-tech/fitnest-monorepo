import { sql, db } from "@/lib/db"


export interface DeliverySchedule {
  id: number
  subscription_id: number
  delivery_date: string
  status: "scheduled" | "delivered" | "skipped" | "paused"
  created_at: string
}

export interface PauseRequest {
  subscription_id: number
  pause_start_date: string
  pause_end_date: string
  reason?: string
}

export class DeliveryService {
  // Generate delivery schedule for a subscription
  static async generateDeliverySchedule(
    subscriptionId: number,
    startDate: Date,
    endDate: Date,
    deliveryDays: number[], // 0=Sunday, 1=Monday, etc.
  ): Promise<DeliverySchedule[]> {
    const deliveries: DeliverySchedule[] = []
    const current = new Date(startDate)

    while (current <= endDate) {
      if (deliveryDays.includes(current.getDay())) {
        const delivery = await sql`
          INSERT INTO delivery_schedule (subscription_id, delivery_date, status)
          VALUES (${subscriptionId}, ${current.toISOString().split("T")[0]}, 'scheduled')
          RETURNING *
        `
        deliveries.push(delivery[0] as DeliverySchedule)
      }
      current.setDate(current.getDate() + 1)
    }

    return deliveries
  }

  // Pause subscription deliveries
  static async pauseSubscription(pauseRequest: PauseRequest): Promise<boolean> {
    try {
      // Validate pause request
      const validation = await this.validatePauseRequest(pauseRequest)
      if (!validation.isValid) {
        throw new Error(validation.error)
      }

      // Update subscription status
      await sql`
        UPDATE subscriptions 
        SET status = 'paused', 
            pause_start_date = ${pauseRequest.pause_start_date},
            pause_end_date = ${pauseRequest.pause_end_date},
            pause_reason = ${pauseRequest.reason || ""}
        WHERE id = ${pauseRequest.subscription_id}
      `

      // Update delivery schedule to 'paused' for the pause period
      await sql`
        UPDATE delivery_schedule 
        SET status = 'paused'
        WHERE subscription_id = ${pauseRequest.subscription_id}
          AND delivery_date >= ${pauseRequest.pause_start_date}
          AND delivery_date <= ${pauseRequest.pause_end_date}
          AND status = 'scheduled'
      `

      return true
    } catch (error) {
      console.error("Error pausing subscription:", error)
      return false
    }
  }

  // Resume subscription deliveries
  static async resumeSubscription(subscriptionId: number): Promise<boolean> {
    try {
      // Update subscription status
      await sql`
        UPDATE subscriptions 
        SET status = 'active',
            pause_start_date = NULL,
            pause_end_date = NULL,
            pause_reason = NULL
        WHERE id = ${subscriptionId}
      `

      // Update future delivery schedule back to 'scheduled'
      const today = new Date().toISOString().split("T")[0]
      await sql`
        UPDATE delivery_schedule 
        SET status = 'scheduled'
        WHERE subscription_id = ${subscriptionId}
          AND delivery_date >= ${today}
          AND status = 'paused'
      `

      return true
    } catch (error) {
      console.error("Error resuming subscription:", error)
      return false
    }
  }

  // Validate pause request
  static async validatePauseRequest(pauseRequest: PauseRequest): Promise<{ isValid: boolean; error?: string }> {
    const { subscription_id, pause_start_date, pause_end_date } = pauseRequest

    // Check if subscription exists and is active
    const subscription = await sql`
      SELECT * FROM subscriptions WHERE id = ${subscription_id} AND status = 'active'
    `

    if (subscription.length === 0) {
      return { isValid: false, error: "Subscription not found or not active" }
    }

    // Check if subscription has already been paused
    const existingPause = await sql`
      SELECT * FROM subscriptions 
      WHERE id = ${subscription_id} 
        AND (pause_start_date IS NOT NULL OR status = 'paused')
    `

    if (existingPause.length > 0) {
      return {
        isValid: false,
        error: "Subscription has already been paused. Only one pause per subscription is allowed.",
      }
    }

    // Validate pause dates
    const startDate = new Date(pause_start_date)
    const endDate = new Date(pause_end_date)
    const today = new Date()
    const minNoticeDate = new Date()
    minNoticeDate.setHours(minNoticeDate.getHours() + 72) // 72 hours notice

    if (startDate < minNoticeDate) {
      return { isValid: false, error: "Pause must be requested at least 72 hours in advance" }
    }

    if (endDate <= startDate) {
      return { isValid: false, error: "Pause end date must be after start date" }
    }

    // Check pause duration (max 3 weeks = 21 days)
    const pauseDuration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    if (pauseDuration > 21) {
      return { isValid: false, error: "Pause duration cannot exceed 3 weeks (21 days)" }
    }

    return { isValid: true }
  }

  // Get delivery schedule for a subscription
  static async getDeliverySchedule(subscriptionId: number): Promise<DeliverySchedule[]> {
    const deliveries = await sql`
      SELECT * FROM delivery_schedule 
      WHERE subscription_id = ${subscriptionId}
      ORDER BY delivery_date ASC
    `

    return deliveries as DeliverySchedule[]
  }

  // Get upcoming deliveries (next 30 days)
  static async getUpcomingDeliveries(subscriptionId: number): Promise<DeliverySchedule[]> {
    const today = new Date().toISOString().split("T")[0]
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 30)
    const future = futureDate.toISOString().split("T")[0]

    const deliveries = await sql`
      SELECT * FROM delivery_schedule 
      WHERE subscription_id = ${subscriptionId}
        AND delivery_date >= ${today}
        AND delivery_date <= ${future}
      ORDER BY delivery_date ASC
    `

    return deliveries as DeliverySchedule[]
  }
}
