# Project Structure & Code Organization

## Package Manager
- Use `pnpm` for all package installations and management

## Core Libraries and Versions
- Hono: ^4.x.x
- Wrangler: ^26.x.x
- Drizzle ORM: ^44.x.x
- TypeScript: ^5.x.x
- Drizzle Kit: ^0.x.x
- Drizzle Zod: ^0.x.x
- Zod: ^4.x.x
- Better Auth: ^1.x.x
- nuqs: ^1.x.x
- TRPC Server: ^10.x.x
- @hono/trpc-server: ^0.x.x

## Naming Conventions
- `kebab-case` - for all folders/files
- `PascalCase` - for classes and types
- `snake_case` - for database tables, zod schemas and columns
- `camelCase` - for functions and etc.

## Common Modules
- `data` - for data layer (drizzle queries)
- `db` - for database drizzle schemas
- `lib` - for 3rd party integrations libraries
- `schemas` - for schemas and types
- `services` - for service layer 
- `trpc` - for trpc server routers and configs
- `types` - for types
- `utils` - for utilities
  
## Domain Folders
- `src` - main source code and shared common modules

