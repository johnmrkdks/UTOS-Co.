-- Quick option: Square payments only (0012). Use apply-all-migrations-manually.sql for full 0001-0012.

-- 1. Payment methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  square_customer_id TEXT,
  square_card_id TEXT,
  last_4 TEXT,
  brand TEXT,
  is_default INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);

-- 2. Booking payments table
CREATE TABLE IF NOT EXISTS booking_payments (
  id TEXT PRIMARY KEY NOT NULL,
  booking_id TEXT NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  square_payment_id TEXT NOT NULL,
  square_order_id TEXT,
  authorized_amount_cents INTEGER NOT NULL,
  captured_amount_cents INTEGER,
  final_amount_cents INTEGER,
  status TEXT NOT NULL,
  payment_method_id TEXT REFERENCES payment_methods(id) ON DELETE SET NULL,
  square_source_id TEXT,
  idempotency_key TEXT,
  captured_at INTEGER,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_booking_payments_booking_id ON booking_payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_payments_square_payment_id ON booking_payments(square_payment_id);

-- 3. Add payment_status to bookings (skip if you get "duplicate column" - it's already there)
ALTER TABLE bookings ADD COLUMN payment_status TEXT;
