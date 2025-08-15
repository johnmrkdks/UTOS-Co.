# Naming Conventions and Patterns

## Overview

This document establishes comprehensive naming conventions and patterns for the domain-first architecture to ensure consistency, readability, and maintainability across the Down Under Chauffeur codebase.

## File and Directory Naming

### Directory Structure Conventions

```
domains/[domain-name]/              # kebab-case domain names
├── contexts/
│   ├── [context-name]/            # kebab-case context names (marketing, admin, driver)
│   │   ├── components/            # always lowercase
│   │   ├── hooks/                 # always lowercase
│   │   └── types/                 # always lowercase
├── shared/                        # always lowercase
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── constants/
├── _types/                        # underscore prefix for domain-level files
├── _schemas/                      # underscore prefix for domain-level files
└── index.ts                       # always index.ts
```

### File Naming Patterns

#### Component Files
```
# Component files: kebab-case with .tsx extension
booking-form.tsx
car-selection-card.tsx
driver-assignment-dialog.tsx
package-management-table.tsx
```

#### Hook Files
```
# Hook files: kebab-case starting with 'use-'
use-create-booking.ts
use-car-management.ts
use-driver-assignment.ts
use-package-validation.ts
```

#### Type Files
```
# Type files: kebab-case with .types.ts suffix
booking.types.ts
car-feature.types.ts
driver-profile.types.ts
package-category.types.ts
```

#### Schema Files
```
# Schema files: kebab-case with .schemas.ts suffix
booking.schemas.ts
car-validation.schemas.ts
driver-profile.schemas.ts
package.schemas.ts
```

#### Utility Files
```
# Utility files: kebab-case describing function
booking-calculations.ts
car-formatters.ts
driver-helpers.ts
package-utils.ts
```

#### Constant Files
```
# Constant files: kebab-case describing constants
booking-statuses.ts
car-categories.ts
driver-roles.ts
package-types.ts
```

## Code Naming Conventions

### Components

#### Component Names
- **PascalCase** for component names
- **Descriptive and specific** to their purpose
- **Context-aware** naming when necessary

```typescript
// ✅ Good component names
export function BookingForm() { }
export function CarSelectionCard() { }
export function DriverAssignmentDialog() { }
export function AdminBookingManagementTable() { }

// ❌ Avoid generic names
export function Form() { }
export function Card() { }
export function Dialog() { }
export function Table() { }
```

#### Component File Structure
```typescript
// booking-form.tsx
import type { BookingFormProps } from '../types/booking-form.types';

interface InternalBookingFormState {
  // Internal component state types
}

export function BookingForm({ onSubmit, booking }: BookingFormProps) {
  // Component implementation
}

// Named exports for testing
export { BookingForm as default };
```

### Hook Naming

#### Hook Names
- **camelCase** starting with `use`
- **Action-oriented** naming
- **Context-specific** when necessary

```typescript
// ✅ Good hook names
export function useCreateBooking() { }
export function useCarManagement() { }
export function useDriverAssignment() { }
export function useAdminBookingFilters() { }

// ❌ Avoid generic names
export function useData() { }
export function useQuery() { }
export function useMutation() { }
```

#### Hook File Structure
```typescript
// use-create-booking.ts
import { trpc } from '@/trpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { CreateBookingInput } from '../types/booking.types';

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation(trpc.bookings.create.mutationOptions({
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: trpc.bookings.list.queryKey() });
      toast.success('Booking created successfully', {
        description: `Booking for ${data.customerName} has been created.`,
      });
    },
    onError: (error) => {
      toast.error('Failed to create booking', {
        description: error.message,
      });
    },
  }));
}
```

### Type and Interface Naming

#### Type Names
- **PascalCase** for all types and interfaces
- **Descriptive** and **domain-specific**
- **Suffix conventions** for clarity

```typescript
// ✅ Good type names
export interface Booking {
  id: string;
  customerName: string;
  // ...
}

export interface BookingFormData {
  customerName: string;
  pickupAddress: string;
  // ...
}

export interface BookingManagementFilters {
  status?: BookingStatus;
  dateRange?: DateRange;
  // ...
}

export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

// Context-specific types
export interface AdminBookingView extends Booking {
  adminNotes: string;
  internalStatus: string;
}

export interface CustomerBookingView extends Omit<Booking, 'adminNotes' | 'internalStatus'> {
  estimatedArrival: Date;
}
```

#### Type File Organization
```typescript
// booking.types.ts - Core domain types
export interface Booking { }
export interface BookingRoute { }
export type BookingStatus = '';

// admin-booking.types.ts - Admin context types
export interface AdminBookingView extends Booking { }
export interface AdminBookingFilters { }
export interface AdminBookingActions { }

// customer-booking.types.ts - Customer context types  
export interface CustomerBookingView extends Omit<Booking, 'sensitive'> { }
export interface CustomerBookingRequest { }
```

### Function and Variable Naming

#### Function Names
- **camelCase** for all functions
- **Verb-oriented** naming
- **Clear purpose** indication

```typescript
// ✅ Good function names
export function calculateBookingTotal(booking: Booking): number { }
export function formatBookingDate(date: Date): string { }
export function validateCarAvailability(carId: string, dateRange: DateRange): boolean { }
export function assignDriverToBooking(bookingId: string, driverId: string): Promise<void> { }

// ❌ Avoid unclear names
export function calculate() { }
export function format() { }
export function validate() { }
export function assign() { }
```

#### Variable Names
- **camelCase** for variables
- **Descriptive** names
- **Context-appropriate** specificity

```typescript
// ✅ Good variable names
const bookingTotal = calculateBookingTotal(booking);
const formattedDate = formatBookingDate(booking.createdAt);
const availableCars = cars.filter(car => car.isAvailable);
const assignedDriver = drivers.find(driver => driver.id === booking.driverId);

// ❌ Avoid unclear names
const total = calculate(booking);
const date = format(booking.createdAt);
const filtered = cars.filter(car => car.isAvailable);
const found = drivers.find(driver => driver.id === booking.driverId);
```

## Domain-Specific Patterns

### Booking Domain Patterns

```typescript
// Components
BookingForm                     // Form for creating/editing bookings
BookingCard                     // Display booking summary
BookingDetails                  // Detailed booking view
BookingStatusBadge             // Status indicator
BookingTimeline                // Status progression
BookingManagementTable         // Admin booking table
CustomerBookingHistory         // Customer booking list
DriverBookingNotifications     // Driver notification list

// Hooks
useCreateBooking               // Create new booking
useUpdateBookingStatus         // Update booking status
useBookingManagement           // Admin booking operations
useCustomerBookings            // Customer booking history
useDriverBookings              // Driver assigned bookings
useBookingValidation           // Form validation
useBookingCalculations         // Price calculations

// Types
Booking                        // Core booking entity
BookingStatus                  // Status enumeration
BookingRoute                   // Route information
BookingFormData                // Form input data
AdminBookingView               // Admin-specific view
CustomerBookingRequest         // Customer booking request
DriverBookingUpdate            // Driver status update

// Utils
calculateBookingTotal          // Calculate total price
formatBookingDate              // Format dates for display
validateBookingRoute           // Validate route data
getBookingStatusColor          // Status color mapping
```

### Car Domain Patterns

```typescript
// Components
CarBrowser                     // Car listing/filtering
CarSelectionCard               // Selectable car card
CarDetailsModal                // Detailed car information
CarManagementTable             // Admin car management
CarFeaturesList                // Car features display
CarImageGallery                // Car photo gallery
CarAvailabilityCalendar        // Availability display

// Hooks
usePublishedCars               // Public car listings
useCarManagement               // Admin car operations
useCarSelection                // Car selection state
useCarValidation               // Car form validation
useCarImageUpload              // Image upload handling
useCarAvailability             // Availability checking

// Types
Car                            // Core car entity
CarCategory                    // Car category
CarFeature                     // Car feature
CarBrand                       // Car brand
CarModel                       // Car model
PublishedCarView               // Customer view
AdminCarView                   // Admin management view
DriverCarAssignment            // Driver assignment

// Utils
formatCarSpecifications        // Format specs for display
calculateCarRating             // Calculate rating
validateCarData                // Validate car information
generateCarSlug                // Generate URL slug
```

### Package Domain Patterns

```typescript
// Components
PackageBrowser                 // Package listing
PackageCard                    // Package display card
PackageDetailsDialog           // Package information
PackageManagementTable         // Admin package management
PackageRouteBuilder            // Route planning tool
PackageCategoryManager         // Category management

// Hooks
usePublishedPackages           // Public package listings
usePackageManagement           // Admin package operations
usePackageCategories           // Category management
usePackageRoutes               // Route management
usePackageValidation           // Package validation

// Types
Package                        // Core package entity
PackageCategory                // Package category
PackageRoute                   // Package route
PackageStop                    // Route stop
PublishedPackageView           // Customer view
AdminPackageView               // Admin management view

// Utils
calculatePackageDistance       // Calculate route distance
formatPackageDuration          // Format duration display
validatePackageRoute           // Validate route data
generatePackageItinerary       // Generate itinerary
```

## Import and Export Patterns

### Domain Index Exports

```typescript
// domains/bookings/index.ts
// Admin context exports
export * from './contexts/admin/components';
export * from './contexts/admin/hooks';
export type * from './contexts/admin/types';

// Customer context exports
export * from './contexts/marketing/components';
export * from './contexts/marketing/hooks';
export type * from './contexts/marketing/types';

// Driver context exports
export * from './contexts/driver/components';
export * from './contexts/driver/hooks';
export type * from './contexts/driver/types';

// Shared exports
export * from './shared/components';
export * from './shared/hooks';
export * from './shared/utils';
export * from './shared/constants';

// Core domain exports
export type * from './_types';
export * from './_schemas';
```

### Context-Specific Exports

```typescript
// domains/bookings/contexts/admin/components/index.ts
export { BookingManagementTable } from './booking-management-table';
export { DriverAssignmentDialog } from './driver-assignment-dialog';
export { BookingStatusPipeline } from './booking-status-pipeline';
export { BookingRevenueReport } from './booking-revenue-report';

// domains/bookings/contexts/admin/hooks/index.ts
export { useBookingManagement } from './use-booking-management';
export { useAssignDriver } from './use-assign-driver';
export { useBookingAnalytics } from './use-booking-analytics';
```

### Import Patterns

```typescript
// ✅ Preferred import patterns

// Domain-specific imports
import { BookingForm } from '@/domains/bookings/contexts/marketing/components/booking-form';
import { useCreateBooking } from '@/domains/bookings/contexts/marketing/hooks/use-create-booking';

// Multiple imports from same domain
import {
  BookingManagementTable,
  DriverAssignmentDialog,
  BookingStatusPipeline
} from '@/domains/bookings/contexts/admin/components';

// Type-only imports
import type { Booking, BookingStatus } from '@/domains/bookings/_types/booking.types';

// Shared utilities
import { calculateBookingTotal } from '@/domains/bookings/shared/utils/booking-calculations';

// Cross-domain imports
import { CarSelectionCard } from '@/domains/cars/contexts/marketing/components/car-selection-card';
import { useCalculateQuote } from '@/domains/pricing/contexts/marketing/hooks/use-calculate-quote';
```

## Error Handling Patterns

### Error Message Naming

```typescript
// ✅ Consistent error patterns
const BOOKING_ERRORS = {
  CREATION_FAILED: 'Failed to create booking',
  UPDATE_FAILED: 'Failed to update booking',
  VALIDATION_FAILED: 'Booking validation failed',
  DRIVER_ASSIGNMENT_FAILED: 'Failed to assign driver',
  CANCELLATION_FAILED: 'Failed to cancel booking'
} as const;

const CAR_ERRORS = {
  FETCH_FAILED: 'Failed to load cars',
  CREATION_FAILED: 'Failed to create car',
  UPDATE_FAILED: 'Failed to update car',
  DELETION_FAILED: 'Failed to delete car',
  IMAGE_UPLOAD_FAILED: 'Failed to upload car image'
} as const;
```

### Error Handling in Hooks

```typescript
// ✅ Consistent error handling pattern
export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation(trpc.bookings.create.mutationOptions({
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: trpc.bookings.list.queryKey() });
      toast.success('Booking created successfully', {
        description: `Booking for ${data.customerName} has been created.`,
      });
    },
    onError: (error) => {
      toast.error(BOOKING_ERRORS.CREATION_FAILED, {
        description: error.message,
      });
    },
  }));
}
```

## Testing Patterns

### Test File Naming

```typescript
// Component tests
booking-form.test.tsx
car-selection-card.test.tsx
driver-assignment-dialog.test.tsx

// Hook tests
use-create-booking.test.ts
use-car-management.test.ts
use-driver-assignment.test.ts

// Utility tests
booking-calculations.test.ts
car-formatters.test.ts
driver-helpers.test.ts
```

### Test Structure Patterns

```typescript
// booking-form.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { BookingForm } from './booking-form';
import type { BookingFormProps } from '../types/booking-form.types';

describe('BookingForm', () => {
  const defaultProps: BookingFormProps = {
    onSubmit: jest.fn(),
    initialData: mockBookingData,
  };

  describe('rendering', () => {
    it('renders booking form fields correctly', () => {
      // Test implementation
    });
  });

  describe('validation', () => {
    it('validates required fields', () => {
      // Test implementation
    });
  });

  describe('submission', () => {
    it('calls onSubmit with correct data', () => {
      // Test implementation
    });
  });
});
```

## Documentation Patterns

### Component Documentation

```typescript
/**
 * BookingForm - A form component for creating and editing bookings
 * 
 * Used in:
 * - Marketing context: Customer booking creation
 * - Admin context: Admin booking management
 * 
 * Features:
 * - Real-time validation
 * - Auto-save functionality
 * - Multi-step form flow
 * 
 * @example
 * ```tsx
 * <BookingForm
 *   onSubmit={handleSubmit}
 *   initialData={booking}
 *   readonly={false}
 * />
 * ```
 */
export function BookingForm({ onSubmit, initialData, readonly }: BookingFormProps) {
  // Implementation
}
```

### Hook Documentation

```typescript
/**
 * useCreateBooking - Hook for creating new bookings
 * 
 * Handles:
 * - Form submission
 * - Success/error notifications
 * - Query cache invalidation
 * - Loading states
 * 
 * @returns Mutation object with create function and state
 * 
 * @example
 * ```tsx
 * function BookingForm() {
 *   const createBooking = useCreateBooking();
 *   
 *   const handleSubmit = (data) => {
 *     createBooking.mutate(data);
 *   };
 * }
 * ```
 */
export function useCreateBooking() {
  // Implementation
}
```

## Consistency Checklist

### Before Committing Code

- [ ] File names follow kebab-case convention
- [ ] Component names are PascalCase and descriptive
- [ ] Hook names start with 'use' and are camelCase
- [ ] Type names are PascalCase and domain-specific
- [ ] Function names are camelCase and verb-oriented
- [ ] Import paths follow domain-first pattern
- [ ] Error handling uses consistent patterns
- [ ] Tests follow naming conventions
- [ ] Documentation includes usage examples

### Code Review Checklist

- [ ] Naming follows established conventions
- [ ] Imports use correct domain paths
- [ ] Types are properly exported/imported
- [ ] Error handling is consistent
- [ ] Components are properly documented
- [ ] Tests cover main functionality
- [ ] No generic or unclear names used

This naming convention guide ensures consistency across the entire codebase and makes it easier for developers to understand and navigate the domain-first architecture.