-- =============================================================================
-- PRODUCTION D1 MANUAL MIGRATIONS (0001 through 0012)
-- Run in Cloudflare Dashboard → Workers & Pages → D1 → downunderchauffeurs-db → Console
-- =============================================================================
-- IMPORTANT: D1 Console stops at the first error. Run ONE section at a time.
-- If a statement fails with "duplicate column" or "table already exists", skip that
-- section and continue to the next. Take a backup before running 0005.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0001: booking_extras table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS booking_extras (
  id TEXT PRIMARY KEY NOT NULL,
  booking_id TEXT NOT NULL,
  additional_wait_time INTEGER DEFAULT 0,
  unscheduled_stops INTEGER DEFAULT 0,
  parking_charges INTEGER DEFAULT 0,
  toll_charges INTEGER DEFAULT 0,
  toll_location TEXT,
  other_charges_description TEXT,
  other_charges_amount INTEGER DEFAULT 0,
  extra_type TEXT DEFAULT 'general' NOT NULL,
  notes TEXT,
  total_extra_amount INTEGER DEFAULT 0 NOT NULL,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- 0002: offload booking fields on bookings
-- -----------------------------------------------------------------------------
ALTER TABLE bookings ADD COLUMN offloader_name TEXT;
ALTER TABLE bookings ADD COLUMN job_type TEXT;
ALTER TABLE bookings ADD COLUMN vehicle_type TEXT;

-- -----------------------------------------------------------------------------
-- 0003: offload_booking_details table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS offload_booking_details (
  id TEXT PRIMARY KEY NOT NULL,
  booking_id TEXT NOT NULL,
  offloader_name TEXT NOT NULL,
  job_type TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS offload_booking_details_booking_id_unique ON offload_booking_details (booking_id);

-- -----------------------------------------------------------------------------
-- 0004: migrate offload data to new table
-- -----------------------------------------------------------------------------
INSERT INTO offload_booking_details (id, booking_id, offloader_name, job_type, vehicle_type, created_at, updated_at)
SELECT
  lower(hex(randomblob(16))) as id,
  b.id as booking_id,
  b.offloader_name,
  b.job_type,
  b.vehicle_type,
  b.created_at,
  b.updated_at
FROM bookings b
WHERE b.offloader_name IS NOT NULL
  AND b.job_type IS NOT NULL
  AND b.vehicle_type IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM offload_booking_details obd WHERE obd.booking_id = b.id);

-- -----------------------------------------------------------------------------
-- 0005: Convert distance to real (meters → kilometers)
-- *** WARNING: Recreates bookings table. BACKUP first. Skip if already applied. ***
-- -----------------------------------------------------------------------------
-- If bookings has reference_number and estimated_distance is REAL, skip this block.
-- Run each statement separately; stop if any fail.
ALTER TABLE bookings ADD COLUMN reference_number TEXT;

CREATE TABLE bookings_new AS SELECT * FROM bookings WHERE 1=0;
DROP TABLE bookings_new;

CREATE TABLE bookings_new (
  id TEXT PRIMARY KEY NOT NULL,
  reference_number TEXT,
  booking_type TEXT DEFAULT 'custom' NOT NULL,
  car_id TEXT,
  user_id TEXT NOT NULL,
  driver_id TEXT,
  package_id TEXT,
  driver_assigned_at INTEGER,
  origin_address TEXT NOT NULL,
  origin_latitude REAL,
  origin_longitude REAL,
  destination_address TEXT NOT NULL,
  destination_latitude REAL,
  destination_longitude REAL,
  scheduled_pickup_time INTEGER NOT NULL,
  timezone TEXT,
  estimated_duration INTEGER,
  actual_pickup_time INTEGER,
  actual_dropoff_time INTEGER,
  estimated_distance REAL,
  actual_distance REAL,
  quoted_amount REAL NOT NULL,
  final_amount REAL,
  base_fare REAL,
  distance_fare REAL,
  time_fare REAL,
  extra_charges REAL DEFAULT 0,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  passenger_count INTEGER DEFAULT 1 NOT NULL,
  luggage_count INTEGER DEFAULT 0,
  special_requests TEXT,
  additional_notes TEXT,
  status TEXT DEFAULT 'pending' NOT NULL,
  is_archived INTEGER,
  confirmed_at INTEGER,
  driver_en_route_at INTEGER,
  service_started_at INTEGER,
  service_completed_at INTEGER,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

INSERT INTO bookings_new
SELECT
  id, reference_number, booking_type, car_id, user_id, driver_id, package_id, driver_assigned_at,
  origin_address, origin_latitude, origin_longitude, destination_address, destination_latitude, destination_longitude,
  scheduled_pickup_time, NULL as timezone, estimated_duration, actual_pickup_time, actual_dropoff_time,
  CASE WHEN estimated_distance IS NOT NULL THEN CAST(estimated_distance AS REAL) / 1000.0 ELSE NULL END as estimated_distance,
  CASE WHEN actual_distance IS NOT NULL THEN CAST(actual_distance AS REAL) / 1000.0 ELSE NULL END as actual_distance,
  quoted_amount, final_amount, base_fare, distance_fare, time_fare, extra_charges,
  customer_name, customer_phone, customer_email, passenger_count, 0 as luggage_count,
  special_requests, NULL as additional_notes, status, NULL as is_archived,
  confirmed_at, driver_en_route_at, service_started_at, service_completed_at, created_at, updated_at
FROM bookings;

DROP TABLE bookings;
ALTER TABLE bookings_new RENAME TO bookings;

-- -----------------------------------------------------------------------------
-- 0006: system_settings and booking_reference_prefix
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS system_settings (
  id INTEGER PRIMARY KEY NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Australia/Sydney',
  booking_reference_prefix TEXT NOT NULL DEFAULT 'DUC',
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);
ALTER TABLE system_settings ADD COLUMN booking_reference_prefix TEXT NOT NULL DEFAULT 'DUC';
UPDATE system_settings SET booking_reference_prefix = 'DUC' WHERE id = 1;
INSERT OR IGNORE INTO system_settings (id, timezone, booking_reference_prefix) VALUES (1, 'Australia/Sydney', 'DUC');

-- -----------------------------------------------------------------------------
-- 0007: populate reference_number for existing bookings
-- -----------------------------------------------------------------------------
UPDATE bookings
SET reference_number = (
  SELECT 'DUC-' || substr(printf('%06d', (
    (SELECT COUNT(*) FROM bookings b2 WHERE b2.rowid <= bookings.rowid AND b2.reference_number IS NULL) +
    (COALESCE(created_at, 0) % 900000) + 100000
  )), 1, 6)
)
WHERE reference_number IS NULL;

-- -----------------------------------------------------------------------------
-- 0008: no-op (distance fix already in 0005)
-- -----------------------------------------------------------------------------
SELECT 1;

-- -----------------------------------------------------------------------------
-- 0009: driver commission_rate
-- -----------------------------------------------------------------------------
ALTER TABLE drivers ADD COLUMN commission_rate INTEGER DEFAULT 50;

-- -----------------------------------------------------------------------------
-- 0010: invoice_sent_logs table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invoice_sent_logs (
  id TEXT PRIMARY KEY NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('driver', 'company')),
  recipient_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  period_start INTEGER NOT NULL,
  period_end INTEGER NOT NULL,
  sent_by_user_id TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- -----------------------------------------------------------------------------
-- 0011: share_token on bookings
-- -----------------------------------------------------------------------------
ALTER TABLE bookings ADD COLUMN share_token TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_share_token ON bookings(share_token) WHERE share_token IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 0012: Square payments
-- -----------------------------------------------------------------------------
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

ALTER TABLE bookings ADD COLUMN payment_status TEXT;
