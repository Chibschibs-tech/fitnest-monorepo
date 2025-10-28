import { db } from "./db-connection"

export async function getAllWaitlistSubmissions() {
  try {
    const result = await db.query(`
      SELECT * FROM waitlist_entries
      ORDER BY created_at DESC
    `)

    return { success: true, data: result.rows }
  } catch (error) {
    console.error("Error fetching waitlist submissions:", error)
    return { success: false, error: "Failed to fetch waitlist submissions" }
  }
}

// Function to check if the waitlist table exists
export async function checkWaitlistTable() {
  try {
    const result = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'waitlist_entries'
      );
    `)

    return result.rows[0].exists
  } catch (error) {
    console.error("Error checking waitlist table:", error)
    return false
  }
}

// Create the waitlist table if it doesn't exist
export async function createWaitlistTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS waitlist_entries (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        meal_plan VARCHAR(100),
        city VARCHAR(100),
        notifications BOOLEAN,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    return { success: true }
  } catch (error) {
    console.error("Error creating waitlist table:", error)
    return { success: false, error: "Failed to create waitlist table" }
  }
}
