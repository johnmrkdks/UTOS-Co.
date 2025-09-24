# Booking System

## Business Model
The system supports two types of bookings:
- **Custom Bookings**: Tailored bookings with custom origin/destination and stops (includes Instant Quote feature)
- **Package Bookings**: Fixed packages combining luxury cars and travel

## Customer Booking Flows

### Fleet-to-Booking Flow
Complete customer journey from fleet selection to booking confirmation with authentication gates:

#### For Non-Authenticated Users:
1. **Our Fleet Page** (`/fleet`) → Car Selection
2. **Calculate Quote** (`/calculate-quote`) → Enter origin, destination, stops (with pre-selected car shown)
3. **Quote Results** (`/quote-results`) → View results with detailed fare breakdown
4. **🔐 Authentication Gate** → "Complete Your Booking" screen with quote summary and selected car
5. **Sign In/Sign Up** → Required to proceed with booking
6. **Book Quote** (`/book-quote/$quoteId`) → Complete booking form (after authentication)
7. **Confirmation** → Booking created successfully

#### For Authenticated Users:
1. **Our Fleet Page** (`/fleet`) → Car Selection
2. **Calculate Quote** (`/calculate-quote`) → Enter origin, destination, stops
3. **Quote Results** (`/quote-results`) → View results
4. **Book Quote** (`/book-quote/$quoteId`) → Pre-filled booking form
5. **Confirmation** → Booking created and visible in `/my-bookings`

### Instant Quote Widget

#### Implementation:
- **Location**: `apps/web/src/features/marketing/_pages/home/_components/instant-quote-widget.tsx`
- **Hook**: `apps/web/src/features/marketing/_pages/home/_hooks/query/use-calculate-instant-quote-mutation.ts`
- **Backend Service**: `apps/server/src/services/bookings/calculate-instant-quote.ts`
- **tRPC Router**: `apps/server/src/trpc/routers/instant-quote.ts`

#### Features:
- **Stepper UI**: Two-step form (Input → Results → Back functionality)
- **Places Autocomplete**: Australian locations with establishments and geocoding support
- **Real-time Calculations**: Google Maps Distance Matrix API for accurate distances
- **Fallback System**: Haversine formula if Google Maps API fails
- **Detailed Fare Breakdown**: Transparent pricing with itemized costs
- **Compact Design**: Optimized for minimal scrolling

#### Pricing Logic & Fare Breakdown:
```typescript
// Two-Tier Chauffeur Pricing Model (Updated 2025)
Total Fare = First Tier Flat Rate + Additional Distance Rate

if (distance <= firstKmLimit) {
  totalFare = firstKmRate; // Flat rate for short distances
} else {
  totalFare = firstKmRate + (additionalDistance × additionalKmRate);
}

// Example Breakdown Display:
// • First 10km (Flat Rate): $200.00
// • Additional 5.5km @ $8.50/km: $46.75
// ─────────────────────────────
// Total Fare: $246.75
```

### Guest Booking System

The application supports comprehensive booking flows for non-authenticated users through the guest booking system:

#### Guest Features
- **Service Booking**: Direct package/service booking without account creation
- **Car Booking**: Individual car booking with custom routes
- **Quote Booking**: Convert quotes to bookings through guest flow
- **Contact Information**: Simplified forms for guest customer data
- **Schema Validation**: Dedicated schemas for guest booking forms

#### Implementation
- **Components**: `guest/_components/` - Service, car, and quote booking forms
- **Pages**: `guest/_pages/` - Standalone booking pages for guest users
- **Schemas**: `guest/_schemas/service-booking-schema.ts` - Form validation
- **Integration**: Seamless conversion to authenticated bookings post-registration

## Booking Policies System

The application implements a flexible booking policies system that governs when customers can edit or cancel their bookings:

### Booking Policy Schema
- **Edit Policy**: `editAllowedHours` (default: 4 hours before pickup)
- **Edit Restrictions**: `editDisabledAfterDriverAssignment` (default: true)
- **Cancellation Policy**: `cancellationAllowedHours` (default: 4 hours before pickup)
- **Cancellation Fees**: `cancellationFeePercentage` (0-100%, default: 0%)
- **Cancellation Restrictions**: `cancellationDisabledAfterDriverAssignment` (default: false)

### Booking Operations Validation
The `validateBookingOperations` service provides real-time validation:
- **Time-based Validation**: Checks hours remaining until scheduled pickup
- **Driver Assignment Validation**: Considers whether a driver has been assigned
- **Status Validation**: Prevents operations on completed/cancelled bookings
- **Policy Application**: Applies active booking policy rules

### Customer Booking Management
- **Edit Bookings**: Customers can modify booking details within policy timeframes
- **Cancel Bookings**: Policy-based cancellation with optional fees and restrictions
- **Real-time Validation**: UI shows available actions based on current booking state
- **Status Tracking**: Enhanced status pipeline including cancellation support

## Google Maps Integration

### Overview
The application integrates with Google Maps APIs for location services and distance calculations:

#### APIs Used:
- **Places API**: Location autocomplete restricted to Australia (`componentRestrictions: { country: "au" }`)
- **Distance Matrix API**: Real-time distance and duration calculations between locations
- **Geocoding**: Converting addresses to coordinates for accurate calculations

#### Configuration:
```bash
# Frontend (Vite)
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here

# Backend (Cloudflare Workers)
GOOGLE_MAPS_API_KEY=your_api_key_here  # In wrangler.toml [vars] section
```

## Quote Calculation System Fixes (January 2025)

### Car-Specific Pricing Implementation
- **Fixed**: Quote calculations now properly use selected car's pricing configuration instead of generic rates
- **Updated Service**: `apps/server/src/services/bookings/calculate-instant-quote.ts` now queries car-specific pricing configs
- **Logic**: Prioritizes car-specific pricing → global pricing → any available config as fallback

### Standardized Two-Tier Pricing Logic
- **Unified Calculations**: All quote systems (instant quote, fleet selection, admin tester) now use identical pricing logic
- **Two-Tier Model**: `firstKmRate` (flat fee for initial distance) + `additionalKmRate` (per-km for excess distance)

### Enhanced Fare Display
- **Decimal Formatting**: All monetary values show proper decimals (e.g., $246.75 instead of $247)
- **Quote Booking Page**: Estimated fare shows exact pricing instead of rounded values
- **Breakdown Components**: Protected against undefined values with fallback displays

### Vehicle Details in Quote Booking
- **Enhanced Pre-selected Vehicle Section**: Shows comprehensive car information
- **Displays**: Car name, brand/model, category, and up to 3 key features
- **Loading States**: Graceful loading indicators while fetching car data
- **Fallback**: Maintains generic display if car data unavailable

## Booking Stops Functionality (September 2025)

### Stops Data Persistence Verification
- **Database Schema**: Confirmed `booking_stops` table properly configured with all required fields
- **Backend Integration**: Verified complete data flow from quote creation to database persistence
- **Frontend Mapping**: Fixed critical issue in quote booking page where `stopOrder` field was missing

### Stops System Features
- **Multi-stop Support**: Full support for custom routes with intermediate stops
- **Ordered Sequences**: Stops maintain proper order through `stopOrder` field
- **Location Data**: Stores address, latitude, and longitude for each stop
- **Waiting Time**: Configurable waiting time at each stop location
- **Notes Support**: Optional notes for each stop with specific instructions