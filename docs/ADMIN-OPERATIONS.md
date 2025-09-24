# Admin Operations

## User Types
- **Customers** (role: 'user'): End customers who book luxury cars and travel packages via customer dashboard (/customer/*)
- **Drivers** (role: 'driver'): Service providers who fulfill bookings via driver portal (/driver/*)
- **Admins** (role: 'admin' & 'super_admin'): System administrators who manage the platform via admin dashboard (/dashboard/*)

## Access Control
- **Dashboard Access**: Only `admin` and `super_admin` roles can access `/dashboard`
- **Role Hierarchy**: `super_admin` > `admin` > `driver` > `user`

## Booking Management
- **Package Bookings**: Fixed packages with predetermined services and pricing
- **Custom Bookings**: Dynamic pricing using instant quote system with custom routes
- **Status Tracking**: `pending` → `confirmed` → `driver_assigned` → `in_progress` → `completed` → `cancelled`
- **Booking Operations**: Policy-based edit and cancellation with configurable timeframes
- **Validation System**: Automated checks for booking modifications based on pickup time and driver assignment

## Dashboard Features

### Core Management Systems
- **Package Management** (`/dashboard/packages`): CRUD operations, analytics, categories, and route planning
- **Pricing Configuration** (`/dashboard/pricing-config`): Dynamic pricing rules with quote testing
- **Driver Management** (`/dashboard/drivers`): Driver approval, assignment, and profile management
- **Booking Management** (`/dashboard/booking-management`): Comprehensive booking dashboard with filtering
- **Analytics Dashboard** (`/dashboard/analytics`): Revenue tracking, performance metrics, and reporting
- **Admin Testing** (`/dashboard/admin-testing`): End-to-end workflow testing and validation
- **Real-time Updates**: WebSocket integration for live status tracking

## Admin Workflows

### Package Management
1. Navigate to `/dashboard/packages`
2. Create packages with pricing and availability settings
3. Organize into categories and configure routes
4. Use analytics to monitor performance

### Booking Management
**Note**: Admins manually create bookings on behalf of customers

1. Access `/dashboard/booking-management`
2. Monitor real-time booking metrics
3. Use advanced filters to find specific bookings
4. Manage status with drag-and-drop pipeline
5. Assign drivers and track progress
6. Analyze revenue and performance

### Driver Management
1. Navigate to `/dashboard/drivers`
2. Review and approve driver applications
3. Manage driver profiles and vehicle assignments
4. Monitor driver availability and performance

### Daily Operations
- **Morning**: Check pending bookings, review driver availability, approve applications
- **Ongoing**: Track active bookings, handle notifications, update configurations
- **Evening**: Review completed bookings, export reports, run system validation

## Key File Locations

### Backend
- **tRPC Routers**: `apps/server/src/trpc/routers/` - API endpoints (including `instant-quote.ts`, `bookings.ts`)
- **Database Schemas**: `apps/server/src/db/sqlite/schema/` - Database structure (including `booking-policies.ts`)
- **Services Layer**: `apps/server/src/services/` - Business logic layer
  - `bookings/` - Booking operations (calculate quotes, create, edit, cancel, validate)
  - `analytics/` - Dashboard analytics and reporting
- **Data Layer**: `apps/server/src/data/` - Database queries and operations
  - `booking-policies/` - Booking policy management
- **Google Maps Integration**: `apps/server/src/lib/google-maps.ts` - Distance Matrix API service

### Frontend
- **Admin Routes**: `apps/web/src/routes/admin/dashboard/_layout/` - Admin interface
- **Marketing Routes**: `apps/web/src/routes/_marketing/` - Public pages and booking flow
- **Customer Routes**: `apps/web/src/routes/dashboard/_layout/` - Customer portal
- **Feature Components**: `apps/web/src/features/` - Feature-specific components

## Implementation Status

✅ **All core features are fully implemented and operational:**
- Complete booking lifecycle management with visual status pipeline
- Comprehensive admin dashboard with real-time monitoring
- Customer portal with booking system and enhanced instant quotes
- Driver management with approval workflows
- Advanced analytics and reporting capabilities
- Real-time WebSocket integration for live updates
- Google Maps integration with Places API and Distance Matrix API for accurate calculations