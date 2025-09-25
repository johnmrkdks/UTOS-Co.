# Database Seeder

This directory contains the seeder files for populating the Down Under Chauffeurs database with initial data.

## Files

- `seed.ts` - Main seeder function with comprehensive data
- `run-seed.ts` - Example script to execute the seeder
- `README.md` - This documentation

## Seed Data Includes

### User Data
- 1 Super Admin account (`admin@downunderchauffeurs.com`)

### Car Data
- **20 Premium Brands**: Mercedes-Benz, BMW, Audi, Lexus, Porsche, Jaguar, Land Rover, Tesla, Bentley, Rolls-Royce, etc.
- **47 Car Models**: Luxury sedans, SUVs, sports cars, and executive vehicles
- **8 Categories**: Luxury Sedan, SUV, Sports Car, Electric Vehicle, Van/Minibus, Convertible, Coupe, Wagon
- **25 Features**: Bluetooth, Wi-Fi Hotspot, Leather Seats, Heated/Cooled Seats, Massage Seats, Navigation, Premium Sound, etc.
- **6 Fuel Types**: Petrol, Diesel, Hybrid, Electric, Plug-in Hybrid, Hydrogen
- **6 Transmission Types**: Automatic, Manual, CVT, Semi-Automatic, Dual-Clutch, Single-Speed
- **4 Drive Types**: FWD, RWD, AWD, 4WD
- **5 Condition Types**: Brand New, Excellent, Very Good, Good, Fair

### Package Data
- **3 Service Types**: Transfer, Tours, Event
- **4 Package Categories**: Airport Transfer, Corporate Transfers, Private Tours, Wedding/Special Events

## Usage

### Option 1: Direct Import (Recommended)
```typescript
import seed from './drizzle/seed/seed';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './src/db/sqlite/schema';

// In your database setup or migration script
const db = drizzle(yourD1Instance, { schema });
await seed(db);
```

### Option 2: Standalone Script
1. Update `run-seed.ts` with your database connection
2. Run: `pnpm tsx drizzle/seed/run-seed.ts`

### Option 3: Add to package.json
Add this script to your `package.json`:
```json
{
  "scripts": {
    "db:seed": "tsx drizzle/seed/run-seed.ts"
  }
}
```

Then run: `pnpm db:seed`

## Notes

- The seeder uses `createId()` from `@paralleldrive/cuid2` for generating IDs
- All data is designed for a luxury chauffeur service context
- Car brands and models focus on premium/luxury vehicles suitable for professional chauffeur services
- The super admin account allows full system access for initial setup

## Car Brands Included

Premium luxury brands suitable for chauffeur services:
- **German Luxury**: Mercedes-Benz, BMW, Audi, Porsche
- **British Luxury**: Jaguar, Land Rover, Bentley, Rolls-Royce, Aston Martin
- **American Luxury**: Cadillac, Chrysler
- **Japanese Luxury**: Lexus
- **Italian Luxury**: Maserati, Ferrari, Lamborghini
- **Electric**: Tesla
- **Others**: Genesis, Volvo, McLaren

Each brand includes multiple appropriate models for different service categories (sedan, SUV, sports, etc.).