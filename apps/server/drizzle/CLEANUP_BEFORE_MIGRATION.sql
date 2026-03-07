-- Run this in D1 Studio FIRST to clean up from a failed migration
-- Then run COMBINED_FOR_D1_STUDIO.sql again

DROP TABLE IF EXISTS __new_drivers;
DROP TABLE IF EXISTS __new_cars;
DROP TABLE IF EXISTS __new_bookings;
DROP TABLE IF EXISTS __new_packages;
DROP TABLE IF EXISTS __new_pricing_configs;
