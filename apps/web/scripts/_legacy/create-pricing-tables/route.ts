import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `

    // Create triggers
    await sql`
      DROP TRIGGER IF EXISTS update_meal_type_prices_updated_at ON meal_type_prices
    `
    await sql`
      CREATE TRIGGER update_meal_type_prices_updated_at 
        BEFORE UPDATE ON meal_type_prices 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `

    await sql`
      DROP TRIGGER IF EXISTS update_discount_rules_updated_at ON discount_rules
    `
    await sql`
      CREATE TRIGGER update_discount_rules_updated_at 
        BEFORE UPDATE ON discount_rules 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `

    // Seed meal type prices
    const existingPrices = await sql`SELECT COUNT(*) as count FROM meal_type_prices`
    if (Number.parseInt(existingPrices[0].count) === 0) {
      await sql`
        INSERT INTO meal_type_prices (plan_name, meal_type, base_price_mad) VALUES
        ('Weight Loss', 'Breakfast', 45.00),
        ('Weight Loss', 'Lunch', 55.00),
        ('Weight Loss', 'Dinner', 50.00),
        ('Stay Fit', 'Breakfast', 50.00),
        ('Stay Fit', 'Lunch', 60.00),
        ('Stay Fit', 'Dinner', 55.00),
        ('Muscle Gain', 'Breakfast', 55.00),
        ('Muscle Gain', 'Lunch', 70.00),
        ('Muscle Gain', 'Dinner', 65.00)
      `
    }

    // Seed discount rules
    const existingRules = await sql`SELECT COUNT(*) as count FROM discount_rules`
    if (Number.parseInt(existingRules[0].count) === 0) {
      await sql`
        INSERT INTO discount_rules (discount_type, condition_value, discount_percentage, stackable) VALUES
        ('days_per_week', 5, 0.0300, true),
        ('days_per_week', 6, 0.0500, true),
        ('days_per_week', 7, 0.0700, true),
        ('duration_weeks', 2, 0.0500, true),
        ('duration_weeks', 4, 0.1000, true),
        ('duration_weeks', 8, 0.1500, true),
        ('duration_weeks', 12, 0.2000, true)
      `
    }

    return NextResponse.json({
      success: true,
      message: "Pricing tables created and seeded successfully",
    })
  } catch (error) {
    console.error("Error creating pricing tables:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const mealPricesCount = await sql`SELECT COUNT(*) as count FROM meal_type_prices`
    const discountRulesCount = await sql`SELECT COUNT(*) as count FROM discount_rules`

    return NextResponse.json({
      success: true,
      mealPricesCount: Number.parseInt(mealPricesCount[0].count),
      discountRulesCount: Number.parseInt(discountRulesCount[0].count),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Tables may not exist yet",
      },
      { status: 404 },
    )
  }
}
