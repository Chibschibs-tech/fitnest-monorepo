-- Add pause-related columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS pause_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS paused_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS pause_duration_days INTEGER NULL,
ADD COLUMN IF NOT EXISTS original_end_date DATE NULL,
ADD COLUMN IF NOT EXISTS extended_end_date DATE NULL,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- Create deliveries table for tracking individual deliveries
CREATE TABLE IF NOT EXISTS deliveries (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, delivered, skipped, paused
  delivered_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_scheduled_date ON deliveries(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Update existing orders to have active status if null
UPDATE orders SET status = 'active' WHERE status IS NULL;
