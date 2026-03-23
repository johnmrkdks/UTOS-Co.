# Project Rules

Cursor rules for maintainability and performance are in `.cursor/rules/`:

| Rule | Applies | Purpose |
|------|---------|---------|
| `core-maintainability.mdc` | Always | Tech stack, structure, conventions |
| `server-backend.mdc` | `apps/server/**/*.ts` | tRPC, Drizzle, error handling |
| `web-frontend.mdc` | `apps/web/**/*.{ts,tsx}` | React, TanStack, performance |
| `typescript-performance.mdc` | `**/*.{ts,tsx}` | TypeScript, performance patterns |

Run `pnpm check` before committing to enforce Biome formatting and linting.
