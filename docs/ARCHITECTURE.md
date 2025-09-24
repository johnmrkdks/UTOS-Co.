# Architecture

## Monorepo Structure
```
apps/
├── server/     # Hono + tRPC API (Cloudflare Workers)
└── web/        # React + TanStack Router frontend
```

## Backend (apps/server)
- **Framework**: Hono with tRPC for type-safe APIs
- **Database**: Drizzle ORM with SQLite/D1 and Postgres/Supabase support
- **Authentication**: Better Auth with email/password and Google OAuth
- **Payments**: Stripe integration (PayID, Apple Pay, Google Pay, Debit/Credit Cards)
- **Google Maps API**: Distance Matrix API for accurate route calculations and Places API for location autocomplete
- **Deployment**: Cloudflare Workers via Wrangler
- **File Storage**: Cloudflare R2 buckets for images (with presigned URLs)

### Server Structure
- `src/data/` - Database queries using Drizzle
- `src/db/` - Database schemas and configurations
- `src/services/` - Business logic layer
- `src/trpc/` - tRPC routers and configurations
- `src/schemas/` - Zod validation schemas
- `src/lib/` - Third-party integrations (S3, auth, Google Maps, etc.)

## Frontend (apps/web)
- **Framework**: React 19 with TanStack Router
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **State**: TanStack Query for server state, Zustand for client state
- **Forms**: React Hook Form with Zod validation
- **Deployment**: Cloudflare Pages

### Frontend Structure
- `src/features/` - Feature-based organization
  - `auth/` - Authentication components and logic
  - `dashboard/` - Admin dashboard for car management
  - `marketing/` - Public-facing pages
  - `customer/` - Customer portal pages (services, instant quote, booking management)
  - `guest/` - Non-authenticated user booking flows
  - `driver/` - Driver portal components
  - `profile/` - Customer profile management components
  - `account/` - Customer account settings components
- `src/components/` - Shared UI components
- `src/hooks/` - Shared custom hooks and queries
- `src/routes/` - Route definitions
  - `customer/_layout/` - Customer portal routes
    - `index.tsx` - Customer dashboard with dual quick actions
    - `bookings.tsx` - Customer booking history and management
    - `services.tsx` - Dedicated services browsing with search/filter
    - `instant-quote.tsx` - Enhanced instant quote calculator
    - `profile.tsx` - Customer profile management
    - `account/settings.tsx` - Account settings and security

## Database Schema

The application manages a comprehensive car rental system with:
- **Cars**: Multi-table normalization with brands, models, categories, features, etc.
- **Packages**: Fixed service packages with pricing and availability
- **Bookings**: Rental bookings with status tracking and policy-based operations
- **Booking Policies**: Configurable edit/cancellation rules and timeframes
- **Users/Auth**: Better Auth integration with roles
- **File Management**: Car images with S3 storage

### Publication System
Both cars and packages implement a robust publication system:

#### Cars Publication Logic
A car is publicly visible to customers when ALL conditions are met:
- `isPublished = true` (Admin approval through pricing configuration)
- `isActive = true` (Car is in active service)
- `isAvailable = true` (Currently available for booking)
- `status = 'available'` (Operational status)

#### Packages Publication Logic
A package is publicly visible when:
- `isPublished = true` (Admin approval)
- `isAvailable = true` (Package is currently offered)

#### Publication Endpoints
- `[entity].listPublished` - Public endpoint for customer-facing listings
- `[entity].getPublished` - Public endpoint for individual item access
- `[entity].togglePublish` - Admin endpoint for quick publish/unpublish
- `[entity].list` - Admin endpoint showing all items regardless of status

Key relationships:
- Cars have many-to-many relationships with features
- Cars belong to brands, models, categories, etc.
- Packages can belong to categories for organization
- Bookings link users to cars/packages with date ranges
- Booking policies define edit/cancellation rules with configurable hours and fees

## Authentication
- Uses Better Auth for session management
- Supports email/password and Google OAuth authentication
- Role-based permissions with four distinct user roles:
  - `user`: Customers with access to /customer/* routes
  - `driver`: Drivers with access to /driver/* routes
  - `admin`: Administrators with access to /dashboard/* routes
  - `super_admin`: Super administrators with full system access

## Type Safety
- Full end-to-end type safety with tRPC
- Shared schemas between frontend and backend
- Drizzle provides type-safe database operations

## Code Quality
- Biome for linting and formatting (tab indentation, double quotes)
- TypeScript strict mode enabled
- Organized imports and consistent code style