-- Add share_token for public tracking/update links (no auth required)
ALTER TABLE bookings ADD COLUMN share_token TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_share_token ON bookings(share_token) WHERE share_token IS NOT NULL;
