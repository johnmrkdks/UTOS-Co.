-- Seed for my-dev-db (run in D1 Studio after migrations)
-- Enables: Instant quote calculator, Car Specifications dropdowns, basic auth, dashboard access

-- 1. Global pricing config (enables instant quote - "Instant quote service is temporarily unavailable" fix)
INSERT OR REPLACE INTO pricing_configs (id, name, car_id, first_km_rate, first_km_limit, price_per_km, car_type_id, created_at, updated_at)
VALUES ('dev_global_pricing_001', 'Standard', NULL, 150.0, 5.0, 4.85, NULL, unixepoch(), unixepoch());

-- 2. Fix existing users with null/empty role (so dashboard loads)
UPDATE users SET role = 'user' WHERE role IS NULL OR role = '';

-- 3. Car Body Types (required for Add Car form dropdowns)
INSERT OR IGNORE INTO car_body_types (id, name, created_at, updated_at) VALUES ('cbt_sedan_001', 'Sedan', unixepoch(), unixepoch());
INSERT OR IGNORE INTO car_body_types (id, name, created_at, updated_at) VALUES ('cbt_suv_002', 'SUV', unixepoch(), unixepoch());
INSERT OR IGNORE INTO car_body_types (id, name, created_at, updated_at) VALUES ('cbt_coupe_003', 'Coupe', unixepoch(), unixepoch());
INSERT OR IGNORE INTO car_body_types (id, name, created_at, updated_at) VALUES ('cbt_convertible_004', 'Convertible', unixepoch(), unixepoch());
INSERT OR IGNORE INTO car_body_types (id, name, created_at, updated_at) VALUES ('cbt_wagon_005', 'Wagon', unixepoch(), unixepoch());
INSERT OR IGNORE INTO car_body_types (id, name, created_at, updated_at) VALUES ('cbt_hatchback_006', 'Hatchback', unixepoch(), unixepoch());
INSERT OR IGNORE INTO car_body_types (id, name, created_at, updated_at) VALUES ('cbt_van_007', 'Van', unixepoch(), unixepoch());
INSERT OR IGNORE INTO car_body_types (id, name, created_at, updated_at) VALUES ('cbt_minibus_008', 'Minibus', unixepoch(), unixepoch());
INSERT OR IGNORE INTO car_body_types (id, name, created_at, updated_at) VALUES ('cbt_limousine_009', 'Limousine', unixepoch(), unixepoch());
INSERT OR IGNORE INTO car_body_types (id, name, created_at, updated_at) VALUES ('cbt_saloon_010', 'Saloon', unixepoch(), unixepoch());

-- 4. Car Brands & Models (chauffeur industry: Mercedes, BMW, Audi)
INSERT OR IGNORE INTO car_brands (id, name, created_at, updated_at) VALUES ('zv80hvylp7tr9968y4nndhpd', 'Mercedes-Benz', unixepoch(), unixepoch());
INSERT OR IGNORE INTO car_brands (id, name, created_at, updated_at) VALUES ('tuo8uhie5hsj5sjm2maxr0xj', 'BMW', unixepoch(), unixepoch());
INSERT OR IGNORE INTO car_brands (id, name, created_at, updated_at) VALUES ('y5fv2cswrtsf2mxk1ndjw2ix', 'Audi', unixepoch(), unixepoch());
-- Mercedes-Benz: V-Class, Sprinter 15 Seater, Sprinter 12 Seater, S-Class
INSERT OR IGNORE INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('mb_vclass_001', 'V-Class', 'zv80hvylp7tr9968y4nndhpd', 2024, unixepoch(), unixepoch());
INSERT OR IGNORE INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('mb_sprinter15_002', 'Sprinter 15 Seater', 'zv80hvylp7tr9968y4nndhpd', 2024, unixepoch(), unixepoch());
INSERT OR IGNORE INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('mb_sprinter12_003', 'Sprinter 12 Seater', 'zv80hvylp7tr9968y4nndhpd', 2024, unixepoch(), unixepoch());
INSERT OR IGNORE INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('q16pqt14kgmo1iukggg0kseb', 'S-Class', 'zv80hvylp7tr9968y4nndhpd', 2024, unixepoch(), unixepoch());
-- BMW: X7
INSERT OR IGNORE INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('bmw_x7_001', 'X7', 'tuo8uhie5hsj5sjm2maxr0xj', 2024, unixepoch(), unixepoch());
-- Audi: Q7
INSERT OR IGNORE INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('audi_q7_001', 'Q7', 'y5fv2cswrtsf2mxk1ndjw2ix', 2024, unixepoch(), unixepoch());

-- 5. Car Categories
INSERT OR IGNORE INTO car_categories (id, name, description, created_at, updated_at) VALUES ('ont8ojso1oiyzn0e38qw9b3j', 'Luxury Sedan', 'Premium executive sedans', unixepoch(), unixepoch());
INSERT OR IGNORE INTO car_categories (id, name, description, created_at, updated_at) VALUES ('p6pw8lkfdzf1mweslv9hxrip', 'SUV', 'Spacious luxury SUVs', unixepoch(), unixepoch());
INSERT OR IGNORE INTO car_categories (id, name, description, created_at, updated_at) VALUES ('gvydibjh7fb66z1h3d6ptg7u', 'Sports Car', 'High-performance luxury', unixepoch(), unixepoch());
INSERT OR IGNORE INTO car_categories (id, name, description, created_at, updated_at) VALUES ('qby59zna9o2ac23rp1qqxvl9', 'Van/Minibus', 'Group transportation', unixepoch(), unixepoch());

-- 6. Fuel Types
INSERT OR IGNORE INTO car_fuel_types (id, name, created_at, updated_at) VALUES ('h19fodw1klcoz6ho5g0x9bv2', 'Petrol', unixepoch(), unixepoch());
INSERT OR IGNORE INTO car_fuel_types (id, name, created_at, updated_at) VALUES ('o8da4hdbub6jkbsjfk9bgzvf', 'Diesel', unixepoch(), unixepoch());
INSERT OR IGNORE INTO car_fuel_types (id, name, created_at, updated_at) VALUES ('w82a9dtwi3mm4gzulth32ivk', 'Hybrid', unixepoch(), unixepoch());
INSERT OR IGNORE INTO car_fuel_types (id, name, created_at, updated_at) VALUES ('h6xxc8nzn4qkaiegyflfoa16', 'Electric', unixepoch(), unixepoch());

-- 7. Transmission Types
INSERT OR IGNORE INTO car_transmission_types (id, name, created_at, updated_at) VALUES ('xb554gidvdgnr3sw333jq0lt', 'Automatic', unixepoch(), unixepoch());
INSERT OR IGNORE INTO car_transmission_types (id, name, created_at, updated_at) VALUES ('eklesocfubznqom11g5w4mgx', 'Manual', unixepoch(), unixepoch());
INSERT OR IGNORE INTO car_transmission_types (id, name, created_at, updated_at) VALUES ('fa3y1xu6vbu0fh7yzyk168q8', 'Semi-Automatic', unixepoch(), unixepoch());

-- 8. Drive Types
INSERT OR IGNORE INTO car_drive_types (id, name, created_at, updated_at) VALUES ('lk5t2ir4xp9336pdrkl02ldl', 'Front-Wheel Drive (FWD)', unixepoch(), unixepoch());
INSERT OR IGNORE INTO car_drive_types (id, name, created_at, updated_at) VALUES ('m4vrhkp30dfmfjgtir9k1i43', 'Rear-Wheel Drive (RWD)', unixepoch(), unixepoch());
INSERT OR IGNORE INTO car_drive_types (id, name, created_at, updated_at) VALUES ('fchc2x87d0g67v86vq6uojnk', 'All-Wheel Drive (AWD)', unixepoch(), unixepoch());

-- 9. Condition Types
INSERT OR IGNORE INTO car_condition_types (id, name, created_at, updated_at) VALUES ('ssqq1v2q708cmuz4tmoavmws', 'Brand New', unixepoch(), unixepoch());
INSERT OR IGNORE INTO car_condition_types (id, name, created_at, updated_at) VALUES ('nt550tgnrc20wstkn82b3szy', 'Excellent', unixepoch(), unixepoch());
INSERT OR IGNORE INTO car_condition_types (id, name, created_at, updated_at) VALUES ('tmk3gwb1e0ek3tgd1x7g2rq5', 'Very Good', unixepoch(), unixepoch());
INSERT OR IGNORE INTO car_condition_types (id, name, created_at, updated_at) VALUES ('n0yzfs8lkama22hq5hru4952', 'Good', unixepoch(), unixepoch());
