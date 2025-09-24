# Documentation Index

## Overview
This documentation is organized into focused sections to help you navigate the Down Under Chauffeurs codebase efficiently.

## Core Documentation

### 🏗️ [Architecture](./ARCHITECTURE.md)
Complete system architecture including:
- Monorepo structure (server + web apps)
- Backend: Hono + tRPC + Drizzle ORM + Cloudflare Workers
- Frontend: React 19 + TanStack Router + Tailwind CSS
- Database schema and publication system
- Authentication with Better Auth

### 🛠️ [Development Guide](./DEVELOPMENT-GUIDE.md)
Essential development information:
- Development commands (`pnpm dev`, `pnpm build`, etc.)
- Code conventions and naming patterns
- Import guidelines and common build issues
- File organization structure

### 🔗 [tRPC Patterns](./TRPC-PATTERNS.md)
Comprehensive guide to tRPC implementation:
- Query and mutation patterns
- File naming conventions
- Advanced patterns and error handling
- Common mistakes and debugging tips

### 📅 [Booking System](./BOOKING-SYSTEM.md)
Complete booking system documentation:
- Business model (custom vs package bookings)
- Customer booking flows and authentication gates
- Instant Quote Widget implementation
- Booking policies and validation system
- Google Maps integration

### 👑 [Admin Operations](./ADMIN-OPERATIONS.md)
Administrative functionality:
- User roles and access control
- Dashboard features and workflows
- Package, driver, and booking management
- Daily operations guide

### 🔍 [SEO Optimization](./SEO-OPTIMIZATION.md)
SEO and performance features:
- Technical SEO implementation
- Meta tags and structured data
- Social media optimization
- PWA capabilities and performance optimizations

### 📧 [Email Templates](./EMAIL-TEMPLATES.md)
React Email template system:
- Trip status notifications for customers
- Driver assignment emails
- Brand-consistent design system
- Template architecture and integration

## Quick Navigation

### Development Commands
```bash
# Start development
pnpm dev              # All applications
pnpm dev:web          # Frontend only (port 3001)
pnpm dev:server       # Backend only (port 3000)

# Build and validate
pnpm build            # Build all applications
pnpm check-types      # TypeScript validation
pnpm check            # Linting and formatting

# Database operations
pnpm db:push          # Push schema changes
pnpm db:studio        # Open database studio
```

### Key File Locations

**Frontend (apps/web):**
- Routes: `src/routes/`
- Features: `src/features/`
- Components: `src/components/`
- Hooks: `src/hooks/`

**Backend (apps/server):**
- tRPC Routers: `src/trpc/routers/`
- Services: `src/services/`
- Database: `src/db/`
- Data Layer: `src/data/`

### User Interfaces

**Customer Portal** (`/customer/*`):
- Dashboard, bookings, services, instant quote, profile

**Admin Dashboard** (`/dashboard/*`):
- Package management, pricing, drivers, bookings, analytics

**Driver Portal** (`/driver/*`):
- Trip management, availability, profile

**Marketing Pages** (`/`):
- Home, fleet, quote calculator, booking flows

## Getting Started

1. **New to the project?** Start with [Architecture](./ARCHITECTURE.md)
2. **Setting up development?** See [Development Guide](./DEVELOPMENT-GUIDE.md)
3. **Working with APIs?** Check [tRPC Patterns](./TRPC-PATTERNS.md)
4. **Understanding bookings?** Read [Booking System](./BOOKING-SYSTEM.md)
5. **Admin features?** Review [Admin Operations](./ADMIN-OPERATIONS.md)

## Project Status

✅ **Core Features Complete:**
- Full booking lifecycle management
- Customer portal with instant quotes
- Admin dashboard with real-time monitoring
- Driver management and trip tracking
- Comprehensive SEO implementation
- Professional email template system

📋 **Current Development:**
- Documentation restructuring
- Additional SEO optimizations
- Enhanced analytics features

---

*For the main project configuration, see [CLAUDE.md](../CLAUDE.md) in the root directory.*