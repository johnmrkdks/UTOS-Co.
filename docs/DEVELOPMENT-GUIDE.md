# Development Guide

## Development Commands

### Core Development
- `pnpm dev` - Start all applications in development mode
- `pnpm dev:web` - Start only the web application (port 3001)
- `pnpm dev:server` - Start only the server (port 3000)
- `pnpm build` - Build all applications
- `pnpm check-types` - Check TypeScript types across all apps
- `pnpm check` - Run Biome formatting and linting

### Database Operations
- `pnpm db:push` - Push schema changes to database
- `pnpm db:studio` - Open database studio UI
- `pnpm db:generate` - Generate database migrations
- `pnpm db:migrate` - Run database migrations
- `pnpm db:seed-local` - Seed the local development database (when using local D1)

Note: Development uses a **local SQLite database** by default (see [LOCAL-DATABASE-HEIDISQL.md](./LOCAL-DATABASE-HEIDISQL.md) for HeidiSQL setup). Database commands support both D1 and Supabase configurations. Use specific suffixes in server directory:
- `-d1` for Cloudflare D1 (development and production)

### Package Manager
Always use `pnpm` for package management in this repository.

## Code Conventions

### Naming
- `kebab-case` - Files, folders, and routes
- `_kebab-case` - Feature-specific modules (prefixed with underscore)
- `PascalCase` - React components, types, interfaces
- `camelCase` - Functions, variables, object properties
- `snake_case` - Database tables, columns, Zod schemas

### File Organization
Features follow a modular structure with underscore-prefixed directories:
```
src/features/<feature-name>/
├── _components/    # Feature components
├── _hooks/         # Feature hooks and queries
├── _schemas/       # Feature validation schemas
├── _stores/        # Feature state stores
├── _types/         # Feature types
└── _utils/         # Feature utilities
```

## Import Guidelines
**CRITICAL**: Always use the correct import paths to avoid build failures:

### UI Components
- ✅ **Correct**: `import { Button } from "@workspace/ui/components/button";`
- ❌ **Wrong**: `import { Button } from "@/components/ui/button";`

### tRPC Integration
- **Client Setup**: Located at `apps/web/src/trpc/index.ts`
- **Usage**: `import { trpc } from "@/trpc";`

### Modal Management
- **Hook**: `apps/web/src/hooks/use-modal.ts`
- **Usage**: `import { useModal } from "@/hooks/use-modal";`

## Common Build Issues
- Use `@workspace/ui/components/*` for UI component imports
- Known TypeScript config issue in server - use `pnpm dev:web` for frontend development
- **TypeScript Compilation**: Run `pnpm check-types` to identify compilation errors that may prevent page loading
- **Mutation Type Errors**: Use type casting (`as any`) for complex tRPC mutations with booking data structures
- **Booking Stops Access**: Access booking stops using `(booking as any).stops` due to type definition limitations

## Following Conventions
When making changes to files, first understand the file's code conventions. Mimic code style, use existing libraries and utilities, and follow existing patterns.
- NEVER assume that a given library is available, even if it is well known
- When you create a new component, first look at existing components to see how they're written
- When you edit a piece of code, first look at the code's surrounding context
- Always follow security best practices. Never introduce code that exposes or logs secrets and keys

## Code Style
- IMPORTANT: DO NOT ADD ***ANY*** COMMENTS unless asked