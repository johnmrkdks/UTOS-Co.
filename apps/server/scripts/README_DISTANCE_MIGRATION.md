# Distance Field Migration Script

## Overview
This script migrates booking distance fields from **INTEGER (meters)** to **REAL (kilometers with decimals)** using Drizzle ORM and better-sqlite3.

---

## Quick Start

### 1. Run the Migration

```bash
cd apps/server

# Run the migration script
pnpm migrate:distance
```

### 2. What It Does

The script will:
1. ✅ Check current database schema
2. ✅ Show sample data before migration
3. ✅ Create new table with REAL distance fields
4. ✅ Copy all data, converting meters → kilometers (÷1000)
5. ✅ Drop old table and rename new one
6. ✅ Verify the migration
7. ✅ Show summary and sample converted data

---

## Example Output

```
🚀 Distance Migration Script

📁 Database: .wrangler/state/v3/d1/miniflare-D1DatabaseObject/db.sqlite

🔍 Checking current schema...

Current estimated_distance type: INTEGER
Current actual_distance type: INTEGER

📊 Found 42 bookings to migrate

📋 Sample data BEFORE migration:
  - ID: abc123... | Estimated: 15500 | Actual: 15500
  - ID: def456... | Estimated: 25000 | Actual: 24800
  - ID: ghi789... | Estimated: 42300 | Actual: N/A

🔄 Starting migration...

Step 1/5: Creating new table with REAL fields...
✅ New table created

Step 2/5: Copying and converting data...
✅ Data copied and converted

📋 Sample data AFTER migration:
  - ID: abc123... | Estimated: 15.5 km | Actual: 15.5 km
  - ID: def456... | Estimated: 25.0 km | Actual: 24.8 km
  - ID: ghi789... | Estimated: 42.3 km | Actual: N/A km

Step 3/5: Dropping old table...
✅ Old table dropped

Step 4/5: Renaming new table...
✅ Table renamed

Step 5/5: Verifying migration...
✅ Verification complete

🎉 Migration completed successfully!

📊 Summary:
  - Bookings migrated: 42
  - Final count: 42
  - Distance field type: REAL
  - Format: INTEGER (meters) → REAL (kilometers)
  - Example: 15500 → 15.5 km

✨ Migration complete!
```

---

## Safety Features

### 1. Pre-Migration Checks
- Checks if database exists
- Shows current schema
- Displays sample data before migration

### 2. Confirmation for Already-Migrated
If fields are already REAL type:
```
✅ Distance fields are already REAL type. Migration may have already been applied.

Do you want to continue anyway? (This will recreate the table)
Press Ctrl+C to cancel, or wait 5 seconds to continue...
```

### 3. Data Verification
- Shows sample data before and after
- Counts bookings before and after
- Verifies final schema

---

## Manual SQL (Alternative)

If you prefer to run the raw SQL manually:

```bash
# Using wrangler
cd apps/server
wrangler d1 execute down-under-chauffeur-test-db \
  --local \
  --file=drizzle/migrations/sqlite/0005_convert_distance_to_real.sql
```

---

## What Gets Converted

### Before Migration:
```sql
-- Table schema
estimated_distance INTEGER  -- meters as integer
actual_distance INTEGER      -- meters as integer

-- Sample data
id: "abc-123"
estimated_distance: 15500    -- 15,500 meters
actual_distance: 15500       -- 15,500 meters
```

### After Migration:
```sql
-- Table schema
estimated_distance REAL      -- kilometers with decimals
actual_distance REAL         -- kilometers with decimals

-- Sample data
id: "abc-123"
estimated_distance: 15.5     -- 15.5 kilometers
actual_distance: 15.5        -- 15.5 kilometers
```

---

## Conversion Formula

```typescript
// From meters (integer) to kilometers (real)
kilometersValue = metersValue / 1000.0

// Examples:
15500 meters → 15.5 kilometers
25743 meters → 25.743 kilometers
42000 meters → 42.0 kilometers
```

---

## Troubleshooting

### Error: Database file not found

**Solution:**
```bash
# Start the dev server to create the database
pnpm dev:server

# Then run migration in another terminal
pnpm migrate:distance
```

### Error: Table already exists

The migration recreates the table, so this shouldn't happen. If it does:

```bash
# Delete local database and restart
rm -rf .wrangler
pnpm dev:server
pnpm migrate:distance
```

### Error: Foreign key constraint failed

This means there's data inconsistency. Check:
```sql
-- Find orphaned records
SELECT * FROM bookings WHERE user_id NOT IN (SELECT id FROM users);
```

---

## Rollback

If you need to rollback the migration:

### Option 1: Delete and Recreate
```bash
# Stop dev server
# Delete local database
rm -rf .wrangler

# Restart dev server (creates fresh database)
pnpm dev:server
```

### Option 2: Manual Rollback SQL
```sql
-- Backup first!
CREATE TABLE bookings_backup AS SELECT * FROM bookings;

-- Convert back to meters
CREATE TABLE bookings_rollback AS
SELECT
  *,
  CAST(estimated_distance * 1000 AS INTEGER) as estimated_distance,
  CAST(actual_distance * 1000 AS INTEGER) as actual_distance
FROM bookings;

DROP TABLE bookings;
ALTER TABLE bookings_rollback RENAME TO bookings;
```

---

## Post-Migration

### Verify Application Code

Make sure your application is using kilometers:

```typescript
// ✅ Correct (after migration)
estimatedDistance: parseFloat((totalDistance / 1000).toFixed(3)), // 15.5 km

// ❌ Wrong (before migration)
estimatedDistance: Math.round(totalDistance), // 15500 meters
```

### Frontend Display

Update distance displays if needed:

```typescript
// Before: {booking.estimatedDistance}m → "15500m"
// After:  {booking.estimatedDistance}km → "15.5km"
```

---

## Migration Checklist

- [ ] Backup database (if using production data)
- [ ] Run migration: `pnpm migrate:distance`
- [ ] Verify output shows successful conversion
- [ ] Check sample data is converted correctly
- [ ] Test creating new bookings
- [ ] Verify new bookings use decimal kilometers
- [ ] Update frontend if needed

---

## Files Involved

### Migration Script
- `/apps/server/scripts/run-distance-migration.ts` - Main migration script
- `/apps/server/drizzle/migrations/sqlite/0005_convert_distance_to_real.sql` - Raw SQL

### Schema
- `/apps/server/src/db/sqlite/schema/bookings.ts` - Updated schema with REAL type

### Application Code
- `/apps/server/src/services/bookings/calculate-instant-quote.ts` - Uses kilometers
- `/apps/server/src/services/bookings/calculate-car-specific-quote.ts` - Uses kilometers
- `/apps/server/src/services/bookings/create-custom-booking.ts` - Uses kilometers

---

## Support

If you encounter issues:
1. Check the error message
2. Verify database exists (run `pnpm dev:server`)
3. Check sample data before/after
4. Restore from backup if needed

🎉 **Migration complete! Your distances are now in decimal kilometers!**
