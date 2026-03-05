# Local Database Setup with HeidiSQL

When the remote Cloudflare D1 development database is unavailable, the app uses a **local SQLite database** for development. You can inspect and manage it with HeidiSQL.

## Quick Start

1. **Run migrations** (creates the local database and schema):
   ```bash
   pnpm db:migrate-local
   ```

2. **Seed the database** (optional, for test data):
   ```bash
   pnpm db:seed-local
   ```

3. **Start the dev server**:
   ```bash
   pnpm dev
   ```
   Or server only:
   ```bash
   pnpm dev:server
   ```
   If the seed SQL file is missing, generate it first:
   ```bash
   cd apps/server && pnpm db:seed-generate
   ```

3. **Connect with HeidiSQL** (see below).

## SQLite File Location

The local D1 database is a SQLite file created by Wrangler/Miniflare:

```
apps/server/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/<hash>.sqlite
```

The exact path includes a hash. To find it:

- Run `pnpm dev:server` once, then look in `apps/server/.wrangler/state/v3/d1/`
- Or check the path shown in the Wrangler dev output

## Connecting with HeidiSQL

1. Open HeidiSQL.
2. **Session** → **New session** (or press Ctrl+N).
3. **Network type**: choose **SQLite**.
4. **Database file**: browse to the `.sqlite` file in `apps/server/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/`.
5. Click **Open**.

> **Note:** Stop the dev server before editing data in HeidiSQL, or use read-only mode. The dev server keeps the database open, so concurrent writes can cause lock errors.

## Development Workflow

| Task | Command |
|------|---------|
| Run migrations (create schema) | `pnpm db:migrate-local` |
| Seed local DB | `pnpm db:seed-local` |
| Start dev (local DB) | `pnpm dev` |
| Generate seed SQL | `cd apps/server && pnpm db:seed-generate` |
| Reset local DB | Delete `apps/server/.wrangler/state/v3/d1/` folder, then run `pnpm db:migrate-local` |

## Switching Back to Remote D1

To use the remote D1 database again:

1. In `apps/server/wrangler.toml`, change the dev script to remove `--env development`:
   - `"dev": "wrangler types && wrangler dev --port=3000"`
2. Or add a separate script for remote dev and keep the current one for local.

## Schema and Migrations

- Migrations run automatically when you start `pnpm dev` (via `migrations_dir` in wrangler.toml).
- Schema is defined in `apps/server/src/db/sqlite/schema/`.
- Migration files: `apps/server/drizzle/migrations/sqlite/`.
