# Migration Guide: Feature-First to Domain-First Architecture

## Overview

This guide provides step-by-step instructions for migrating from the current feature-first organization to the proposed domain-first architecture without disrupting existing functionality.

## Migration Strategy

### Principles

1. **Incremental Migration**: Migrate one domain at a time
2. **Backward Compatibility**: Keep existing imports working during transition
3. **Test-Driven**: Verify functionality after each migration step
4. **Minimal Downtime**: Production deployments continue working throughout migration

### Prerequisites

- [ ] All tests passing before migration
- [ ] Comprehensive test coverage for domains being migrated
- [ ] Team alignment on new architecture
- [ ] Development environment backup

## Phase 1: Setup New Architecture Foundation

### Step 1.1: Create Domain Directory Structure

```bash
# Create new domain directories
mkdir -p apps/web/src/domains/{bookings,cars,packages,pricing,drivers,analytics,notifications}

# Create context directories  
mkdir -p apps/web/src/contexts/{marketing,admin,driver}

# Create shared directory
mkdir -p apps/web/src/shared/{components,hooks,utils,types}

# Create app configuration directory
mkdir -p apps/web/src/app/{routing,providers,config}
```

### Step 1.2: Create Domain Template Structure

For each domain, create the following structure:

```bash
# Example for bookings domain
cd apps/web/src/domains/bookings

# Create context directories
mkdir -p contexts/{marketing,admin,driver}/{components,hooks,types}

# Create shared directory
mkdir -p shared/{components,hooks,utils,constants}

# Create domain files
mkdir -p _types _schemas
touch index.ts
```

### Step 1.3: Update TypeScript Configuration

Update `tsconfig.json` to include new path mappings:

```json
{
  "compilerOptions": {
    "paths": {
      "@/domains/*": ["./src/domains/*"],
      "@/contexts/*": ["./src/contexts/*"],
      "@/shared/*": ["./src/shared/*"],
      "@/app/*": ["./src/app/*"],
      // Keep existing paths for backward compatibility
      "@/features/*": ["./src/features/*"],
      "@/components/*": ["./src/components/*"],
      "@/hooks/*": ["./src/hooks/*"]
    }
  }
}
```

## Phase 2: Domain Migration (Per Domain)

### Migration Order

Recommended order based on complexity and dependencies:

1. **Pricing Domain** (least dependencies)
2. **Cars Domain** (foundational, used by others)
3. **Packages Domain** (depends on cars)
4. **Bookings Domain** (depends on cars and packages)
5. **Drivers Domain** (depends on bookings and cars)
6. **Analytics Domain** (depends on all others)
7. **Notifications Domain** (cross-cutting)

### Step 2.1: Migrate Pricing Domain (Example)

#### 2.1.1: Create Domain Structure

```bash
cd apps/web/src/domains/pricing

# Create context structure
mkdir -p contexts/{marketing,admin}/{components,hooks,types}
mkdir -p shared/{components,hooks,utils,constants}
mkdir -p _types _schemas
```

#### 2.1.2: Move Core Types and Schemas

```bash
# Move types from existing structure
cp apps/web/src/features/dashboard/_pages/pricing-config/_types/* domains/pricing/_types/
cp apps/web/src/features/dashboard/_pages/pricing-config/_schemas/* domains/pricing/_schemas/
```

#### 2.1.3: Create Context-Specific Components

**Move Admin Components:**
```bash
# Move admin pricing components
mkdir -p domains/pricing/contexts/admin/components
mv apps/web/src/features/dashboard/_pages/pricing-config/_components/* domains/pricing/contexts/admin/components/
```

**Move Admin Hooks:**
```bash
# Move admin hooks
mkdir -p domains/pricing/contexts/admin/hooks
mv apps/web/src/features/dashboard/_pages/pricing-config/_hooks/query/* domains/pricing/contexts/admin/hooks/
```

**Create Marketing Components:**
```bash
# Create marketing pricing components (quote calculator, pricing display)
touch domains/pricing/contexts/marketing/components/{quote-calculator.tsx,pricing-display.tsx}
touch domains/pricing/contexts/marketing/hooks/{use-calculate-quote.ts,use-pricing-display.ts}
```

#### 2.1.4: Create Shared Components

```bash
# Create shared pricing components
touch domains/pricing/shared/components/{price-formatter.tsx,pricing-tier-display.tsx}
touch domains/pricing/shared/hooks/{use-pricing-validation.ts}
touch domains/pricing/shared/utils/{pricing-calculations.ts,pricing-formatters.ts}
```

#### 2.1.5: Create Domain Index

Create `domains/pricing/index.ts`:

```typescript
// Admin exports
export * from './contexts/admin/components';
export * from './contexts/admin/hooks';

// Marketing exports  
export * from './contexts/marketing/components';
export * from './contexts/marketing/hooks';

// Shared exports
export * from './shared/components';
export * from './shared/hooks';
export * from './shared/utils';

// Types and schemas
export * from './_types';
export * from './_schemas';
```

#### 2.1.6: Update Import Statements

**Create migration script** `scripts/migrate-imports.js`:

```javascript
const fs = require('fs');
const path = require('path');

function updateImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Update pricing config imports
  content = content.replace(
    /from ["']@\/features\/dashboard\/_pages\/pricing-config\/_components\/(.*?)["']/g,
    "from '@/domains/pricing/contexts/admin/components/$1'"
  );
  
  content = content.replace(
    /from ["']@\/features\/dashboard\/_pages\/pricing-config\/_hooks\/query\/(.*?)["']/g,
    "from '@/domains/pricing/contexts/admin/hooks/$1'"
  );
  
  fs.writeFileSync(filePath, content);
}

// Run on all relevant files
// (Add logic to find and update files)
```

#### 2.1.7: Update Route Imports

Update dashboard routes to use new domain imports:

```typescript
// In apps/web/src/routes/dashboard/_layout/pricing-config/index.tsx
import { PricingConfigManagement } from '@/domains/pricing/contexts/admin/components/pricing-config-management';
```

#### 2.1.8: Test Migration

```bash
# Run tests for pricing domain
pnpm test -- --grep="pricing"

# Run type checking
pnpm check-types

# Start development server
pnpm dev:web
```

### Step 2.2: Migrate Cars Domain

Follow similar pattern as pricing domain but with more complexity:

#### 2.2.1: Identify Current Components

```bash
# Current admin car components
apps/web/src/features/dashboard/_pages/car-management/_components/

# Current marketing car components (in services)
apps/web/src/features/marketing/_pages/services/_components/car-*
```

#### 2.2.2: Create Domain Structure

```bash
cd apps/web/src/domains/cars

# Admin context
mkdir -p contexts/admin/{components,hooks,types}

# Marketing context  
mkdir -p contexts/marketing/{components,hooks,types}

# Driver context (for future)
mkdir -p contexts/driver/{components,hooks,types}

# Shared
mkdir -p shared/{components,hooks,utils,constants}
mkdir -p _types _schemas
```

#### 2.2.3: Move Components by Context

**Admin Components:**
- Car management table
- Car form
- Car features management
- Brand/model/category management
- Publication controls

**Marketing Components:**
- Car browser
- Car selection cards
- Car details modal
- Car filtering

**Shared Components:**
- Car image gallery
- Car specifications
- Car status indicators

### Step 2.3: Continue for Remaining Domains

Repeat similar process for:
- Packages domain
- Bookings domain
- Drivers domain
- Analytics domain

## Phase 3: Context Migration

### Step 3.1: Create Context Layouts

Move existing layouts to appropriate contexts:

```bash
# Marketing context
mkdir -p apps/web/src/contexts/marketing/{layouts,pages,routing}
mv apps/web/src/features/marketing/_components/layout/* contexts/marketing/layouts/

# Admin context
mkdir -p apps/web/src/contexts/admin/{layouts,pages,routing}
mv apps/web/src/features/dashboard/_components/* contexts/admin/layouts/

# Driver context
mkdir -p apps/web/src/contexts/driver/{layouts,pages,routing}
mv apps/web/src/features/driver/_components/* contexts/driver/layouts/
```

### Step 3.2: Update Route Definitions

Update routes to use domain imports:

```typescript
// apps/web/src/contexts/admin/pages/bookings.tsx
import { BookingManagement } from '@/domains/bookings/contexts/admin/components/booking-management';
import { BookingAnalytics } from '@/domains/analytics/contexts/admin/components/booking-analytics';

export function AdminBookingsPage() {
  return (
    <div>
      <BookingManagement />
      <BookingAnalytics />
    </div>
  );
}
```

## Phase 4: Cleanup and Optimization

### Step 4.1: Remove Legacy Directories

After all migrations are complete and tested:

```bash
# Remove old feature directories (CAREFULLY!)
rm -rf apps/web/src/features/dashboard/_pages/
rm -rf apps/web/src/features/marketing/_pages/
# Keep only routing and shared components in features/
```

### Step 4.2: Update Import Aliases

Remove legacy path mappings from `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/domains/*": ["./src/domains/*"],
      "@/contexts/*": ["./src/contexts/*"],
      "@/shared/*": ["./src/shared/*"],
      "@/app/*": ["./src/app/*"]
      // Remove: "@/features/*": ["./src/features/*"]
    }
  }
}
```

### Step 4.3: Update Documentation

Update all README files and documentation to reflect new structure.

## Testing Strategy

### Per-Domain Testing

After each domain migration:

1. **Unit Tests**: Verify components and hooks work correctly
2. **Integration Tests**: Verify context interactions
3. **E2E Tests**: Verify user workflows still function
4. **Type Checking**: Ensure no TypeScript errors

### Migration Validation

```bash
# Test script for each migration step
#!/bin/bash

echo "Testing domain migration..."

# Run type checking
pnpm check-types
if [ $? -ne 0 ]; then
  echo "Type checking failed"
  exit 1
fi

# Run unit tests
pnpm test
if [ $? -ne 0 ]; then
  echo "Unit tests failed"
  exit 1
fi

# Build application
pnpm build
if [ $? -ne 0 ]; then
  echo "Build failed"
  exit 1
fi

echo "Migration validation passed!"
```

## Rollback Strategy

### Before Each Migration Step

1. **Create Git Branch**: `git checkout -b migration/domain-[name]`
2. **Tag Current State**: `git tag before-migration-[domain]`
3. **Document Changes**: Keep migration log

### Rollback Process

If migration fails:

```bash
# Rollback to previous state
git checkout main
git reset --hard before-migration-[domain]

# Remove new directories
rm -rf apps/web/src/domains/[domain-name]

# Restore original files
git restore .
```

## Production Deployment Strategy

### Deployment Schedule

1. **Off-Peak Hours**: Schedule migrations during low traffic
2. **Incremental Deployments**: Deploy one domain at a time
3. **Feature Flags**: Use feature flags to control new vs old code paths
4. **Monitoring**: Monitor application performance and errors

### Deployment Checklist

- [ ] All tests passing
- [ ] Performance benchmarks met
- [ ] Error rates within acceptable limits
- [ ] User workflows verified
- [ ] Rollback plan ready

## Expected Timeline

### Small Team (2-3 developers)

- **Phase 1**: Setup (1 week)
- **Phase 2**: Domain migrations (3-4 weeks)
  - Pricing: 2-3 days
  - Cars: 1 week
  - Packages: 3-4 days
  - Bookings: 1 week
  - Drivers: 3-4 days
  - Analytics: 2-3 days
  - Notifications: 2-3 days
- **Phase 3**: Context migration (1 week)
- **Phase 4**: Cleanup (2-3 days)

**Total Estimated Time**: 5-6 weeks

### Risk Mitigation

1. **Parallel Development**: Keep feature development in legacy structure until migration complete
2. **Communication**: Regular team updates on migration progress
3. **Documentation**: Maintain both old and new documentation during transition
4. **Training**: Team training sessions on new architecture patterns

## Success Metrics

### Technical Metrics

- [ ] Import path length reduced by 50%+
- [ ] Code duplication reduced by 30%+
- [ ] Build time maintained or improved
- [ ] Bundle size maintained or reduced

### Development Metrics

- [ ] Feature development time reduced
- [ ] Developer onboarding time reduced
- [ ] Bug fixing time reduced
- [ ] Code review time reduced

### Quality Metrics

- [ ] Test coverage maintained or improved
- [ ] TypeScript strict mode compliance
- [ ] Zero breaking changes for end users
- [ ] Performance benchmarks maintained

**Next**: See `04-naming-conventions.md` for detailed naming and pattern guidelines.