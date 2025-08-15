# Proposed Domain-First Architecture

## Overview

This document outlines the recommended domain-first architecture solution for organizing the Down Under Chauffeur frontend application to solve cross-cutting domain issues.

## Architecture Philosophy

### Domain-First Approach

**Principle**: Organize code by business domain first, then by user context within each domain.

**Benefits**:
- Clear domain boundaries
- Reduced code duplication
- Better type safety
- Improved maintainability
- Easier feature development
- Simplified testing

## Proposed Directory Structure

### High-Level Organization

```
apps/web/src/
├── domains/                 # Domain-first organization
│   ├── bookings/           # Booking domain
│   ├── cars/               # Car domain
│   ├── packages/           # Package domain
│   ├── pricing/            # Pricing domain
│   ├── drivers/            # Driver domain
│   ├── analytics/          # Analytics domain
│   └── notifications/      # Notification domain
├── contexts/               # User context layouts and routing
│   ├── marketing/          # Customer-facing context
│   ├── admin/              # Admin management context
│   └── driver/             # Driver operation context
├── shared/                 # Cross-domain shared code
│   ├── components/         # Shared UI components
│   ├── hooks/              # Shared hooks
│   ├── utils/              # Shared utilities
│   └── types/              # Shared types
└── app/                    # App-level configuration
    ├── routing/            # Route definitions
    ├── providers/          # Context providers
    └── config/             # App configuration
```

### Domain Structure Template

Each domain follows a consistent internal structure:

```
domains/[domain-name]/
├── contexts/               # User context implementations
│   ├── marketing/          # Customer-facing components & hooks
│   │   ├── components/     # UI components for customers
│   │   ├── hooks/          # Customer-specific data hooks
│   │   └── types/          # Customer-specific types
│   ├── admin/              # Admin management components & hooks
│   │   ├── components/     # UI components for admins
│   │   ├── hooks/          # Admin-specific data hooks
│   │   └── types/          # Admin-specific types
│   └── driver/             # Driver operation components & hooks
│       ├── components/     # UI components for drivers
│       ├── hooks/          # Driver-specific data hooks
│       └── types/          # Driver-specific types
├── shared/                 # Cross-context domain code
│   ├── components/         # Reusable domain components
│   ├── hooks/              # Shared domain hooks
│   ├── utils/              # Domain-specific utilities
│   └── constants/          # Domain constants
├── _types/                 # Core domain types
├── _schemas/               # Validation schemas
└── index.ts               # Domain exports
```

## Detailed Domain Examples

### 1. Bookings Domain

```
domains/bookings/
├── contexts/
│   ├── marketing/
│   │   ├── components/
│   │   │   ├── booking-form.tsx
│   │   │   ├── quote-widget.tsx
│   │   │   ├── booking-confirmation.tsx
│   │   │   └── booking-history.tsx
│   │   ├── hooks/
│   │   │   ├── use-create-booking.ts
│   │   │   ├── use-calculate-quote.ts
│   │   │   └── use-customer-bookings.ts
│   │   └── types/
│   │       └── customer-booking.types.ts
│   ├── admin/
│   │   ├── components/
│   │   │   ├── booking-management-table.tsx
│   │   │   ├── driver-assignment-dialog.tsx
│   │   │   ├── booking-status-pipeline.tsx
│   │   │   └── booking-revenue-report.tsx
│   │   ├── hooks/
│   │   │   ├── use-booking-management.ts
│   │   │   ├── use-assign-driver.ts
│   │   │   └── use-booking-analytics.ts
│   │   └── types/
│   │       └── admin-booking.types.ts
│   └── driver/
│       ├── components/
│       │   ├── booking-notifications.tsx
│       │   ├── active-booking-card.tsx
│       │   └── booking-completion.tsx
│       ├── hooks/
│       │   ├── use-driver-bookings.ts
│       │   ├── use-accept-booking.ts
│       │   └── use-update-booking-status.ts
│       └── types/
│           └── driver-booking.types.ts
├── shared/
│   ├── components/
│   │   ├── booking-status-badge.tsx
│   │   ├── booking-timeline.tsx
│   │   └── booking-details-card.tsx
│   ├── hooks/
│   │   ├── use-booking-status.ts
│   │   └── use-booking-validation.ts
│   ├── utils/
│   │   ├── booking-calculations.ts
│   │   ├── booking-status-helpers.ts
│   │   └── booking-formatters.ts
│   └── constants/
│       ├── booking-statuses.ts
│       └── booking-types.ts
├── _types/
│   ├── booking.types.ts
│   ├── booking-status.types.ts
│   └── booking-route.types.ts
├── _schemas/
│   ├── booking.schemas.ts
│   └── booking-validation.schemas.ts
└── index.ts
```

### 2. Cars Domain

```
domains/cars/
├── contexts/
│   ├── marketing/
│   │   ├── components/
│   │   │   ├── car-browser.tsx
│   │   │   ├── car-selection-card.tsx
│   │   │   ├── car-details-modal.tsx
│   │   │   └── car-feature-list.tsx
│   │   ├── hooks/
│   │   │   ├── use-published-cars.ts
│   │   │   ├── use-car-filtering.ts
│   │   │   └── use-car-selection.ts
│   │   └── types/
│   │       └── customer-car.types.ts
│   ├── admin/
│   │   ├── components/
│   │   │   ├── car-management-table.tsx
│   │   │   ├── car-form.tsx
│   │   │   ├── car-features-management.tsx
│   │   │   ├── car-brand-management.tsx
│   │   │   └── car-publication-controls.tsx
│   │   ├── hooks/
│   │   │   ├── use-car-management.ts
│   │   │   ├── use-create-car.ts
│   │   │   ├── use-update-car.ts
│   │   │   └── use-car-features.ts
│   │   └── types/
│   │       └── admin-car.types.ts
│   └── driver/
│       ├── components/
│       │   ├── assigned-car-info.tsx
│       │   ├── car-maintenance-status.tsx
│       │   └── car-availability-toggle.tsx
│       ├── hooks/
│       │   ├── use-assigned-car.ts
│       │   ├── use-car-maintenance.ts
│       │   └── use-car-availability.ts
│       └── types/
│           └── driver-car.types.ts
├── shared/
│   ├── components/
│   │   ├── car-image-gallery.tsx
│   │   ├── car-specifications.tsx
│   │   └── car-status-indicator.tsx
│   ├── hooks/
│   │   ├── use-car-validation.ts
│   │   └── use-car-image-upload.ts
│   ├── utils/
│   │   ├── car-formatters.ts
│   │   └── car-calculations.ts
│   └── constants/
│       ├── car-categories.ts
│       └── car-features.ts
├── _types/
│   ├── car.types.ts
│   ├── car-feature.types.ts
│   ├── car-brand.types.ts
│   └── car-category.types.ts
├── _schemas/
│   ├── car.schemas.ts
│   └── car-validation.schemas.ts
└── index.ts
```

### 3. Packages Domain

```
domains/packages/
├── contexts/
│   ├── marketing/
│   │   ├── components/
│   │   │   ├── package-browser.tsx
│   │   │   ├── package-card.tsx
│   │   │   └── package-details.tsx
│   │   ├── hooks/
│   │   │   ├── use-published-packages.ts
│   │   │   └── use-package-selection.ts
│   │   └── types/
│   │       └── customer-package.types.ts
│   ├── admin/
│   │   ├── components/
│   │   │   ├── package-management-table.tsx
│   │   │   ├── package-form.tsx
│   │   │   ├── package-categories-management.tsx
│   │   │   └── package-routes-management.tsx
│   │   ├── hooks/
│   │   │   ├── use-package-management.ts
│   │   │   ├── use-create-package.ts
│   │   │   ├── use-package-categories.ts
│   │   │   └── use-package-routes.ts
│   │   └── types/
│   │       └── admin-package.types.ts
│   └── driver/
│       ├── components/
│       │   ├── package-delivery-info.tsx
│       │   └── package-completion.tsx
│       ├── hooks/
│       │   └── use-package-delivery.ts
│       └── types/
│           └── driver-package.types.ts
├── shared/
│   ├── components/
│   │   ├── package-route-display.tsx
│   │   └── package-pricing-display.tsx
│   ├── hooks/
│   │   └── use-package-validation.ts
│   ├── utils/
│   │   └── package-calculations.ts
│   └── constants/
│       └── package-types.ts
├── _types/
│   ├── package.types.ts
│   ├── package-category.types.ts
│   └── package-route.types.ts
├── _schemas/
│   ├── package.schemas.ts
│   └── package-validation.schemas.ts
└── index.ts
```

## Import Patterns

### Context-Specific Imports

```typescript
// Marketing context - customer-facing booking
import { BookingForm } from "@/domains/bookings/contexts/marketing/components/booking-form";
import { useCreateBooking } from "@/domains/bookings/contexts/marketing/hooks/use-create-booking";

// Admin context - booking management
import { BookingManagementTable } from "@/domains/bookings/contexts/admin/components/booking-management-table";
import { useBookingManagement } from "@/domains/bookings/contexts/admin/hooks/use-booking-management";

// Driver context - booking operations
import { BookingNotifications } from "@/domains/bookings/contexts/driver/components/booking-notifications";
import { useDriverBookings } from "@/domains/bookings/contexts/driver/hooks/use-driver-bookings";
```

### Shared Domain Imports

```typescript
// Shared components across contexts
import { BookingStatusBadge } from "@/domains/bookings/shared/components/booking-status-badge";
import { BookingTimeline } from "@/domains/bookings/shared/components/booking-timeline";

// Domain utilities
import { calculateBookingTotal } from "@/domains/bookings/shared/utils/booking-calculations";
import { formatBookingDate } from "@/domains/bookings/shared/utils/booking-formatters";

// Domain types
import type { Booking, BookingStatus } from "@/domains/bookings/_types/booking.types";
```

### Cross-Domain Imports

```typescript
// Importing from different domains
import { CarSelectionCard } from "@/domains/cars/contexts/marketing/components/car-selection-card";
import { PackageCard } from "@/domains/packages/contexts/marketing/components/package-card";
import { useCalculateQuote } from "@/domains/pricing/contexts/marketing/hooks/use-calculate-quote";
```

## Context Organization

### User Context Structure

```
contexts/
├── marketing/              # Customer-facing layouts & routing
│   ├── layouts/
│   │   ├── marketing-layout.tsx
│   │   └── customer-portal-layout.tsx
│   ├── pages/
│   │   ├── home.tsx
│   │   ├── services.tsx
│   │   ├── booking.tsx
│   │   └── profile.tsx
│   └── routing/
│       └── marketing-routes.tsx
├── admin/                  # Admin management layouts & routing
│   ├── layouts/
│   │   ├── dashboard-layout.tsx
│   │   └── admin-portal-layout.tsx
│   ├── pages/
│   │   ├── dashboard.tsx
│   │   ├── bookings.tsx
│   │   ├── cars.tsx
│   │   ├── packages.tsx
│   │   ├── drivers.tsx
│   │   └── analytics.tsx
│   └── routing/
│       └── admin-routes.tsx
└── driver/                 # Driver operation layouts & routing
    ├── layouts/
    │   ├── driver-layout.tsx
    │   └── driver-portal-layout.tsx
    ├── pages/
    │   ├── dashboard.tsx
    │   ├── bookings.tsx
    │   ├── profile.tsx
    │   └── earnings.tsx
    └── routing/
        └── driver-routes.tsx
```

## Benefits of This Architecture

### 1. Clear Domain Boundaries
- Each business domain is self-contained
- Domain logic is centralized and reusable
- Prevents domain logic from spreading across contexts

### 2. Context Isolation
- Marketing, admin, and driver concerns are clearly separated
- Context-specific implementations without interference
- Easy to add new user contexts (mobile, API consumers)

### 3. Reduced Duplication
- Shared domain logic in `shared/` directories
- Common components reused across contexts
- Consistent data access patterns

### 4. Improved Maintainability
- Changes to domain logic happen in one place
- Clear ownership boundaries for features
- Easier to refactor and test

### 5. Better Type Safety
- Domain-specific types prevent cross-context confusion
- Shared types ensure consistency
- Context-specific types allow for specialized implementations

### 6. Scalability
- Easy to add new domains
- Simple to extend existing domains with new contexts
- Clear patterns for new feature development

### 7. Team Collaboration
- Clear boundaries for team ownership
- Domain experts can focus on their area
- Reduced conflicts during development

## Migration Strategy

The migration from the current structure to this domain-first architecture should be done incrementally to minimize disruption. See the next document `03-migration-guide.md` for detailed implementation steps.

## Future Considerations

### Mobile App Integration
This architecture naturally supports mobile app development by providing clear domain boundaries that can be shared between web and mobile clients.

### Microservices Evolution
If the application grows to require microservices, this domain structure provides natural service boundaries.

### Third-Party Integrations
Each domain can independently integrate with external services without affecting other domains.

**Next**: See `03-migration-guide.md` for step-by-step implementation instructions.