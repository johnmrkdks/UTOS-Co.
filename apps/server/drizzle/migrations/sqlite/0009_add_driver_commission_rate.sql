-- Add commission_rate to drivers table (percentage 0-100, default 50 for 50/50 split)
ALTER TABLE drivers ADD COLUMN commission_rate integer DEFAULT 50;
