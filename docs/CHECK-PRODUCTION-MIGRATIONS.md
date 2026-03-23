# Check If Production Database Needs Migrations

Use this guide to verify whether your production D1 database is up to date and whether migrations need to be applied.

## Deploy Production After Merge

From the **project root**, after merging to `main`:

1. **Run migrations first** (if you fixed the API token):
   ```powershell
   cd apps/server
   pnpm db:sync-production
   cd ../..
   ```

2. **Deploy server + web:**
   ```powershell
   pnpm deploy:production
   ```

This deploys the **server** (api.downunderchauffeurs.com), then the **web** (downunderchauffeurs.com). You need wrangler logged in (`wrangler login`) and `CLOUDFLARE_API_TOKEN` in `.env.production` for migrations. Deployment uses wrangler OAuth or your logged-in session.

---

## Manual migration (when API token 7403 persists)

If `pnpm db:sync-production` keeps failing with 7403, apply migrations manually:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **D1**
2. Open **downunderchauffeurs-db** (production)
3. Click **Console** (or **Query**)
4. Run the SQL from `apps/server/scripts/apply-all-migrations-manually.sql`

**How to run:** Execute each section in order. If a statement fails with "duplicate column name" or "table already exists", skip it—that change is already applied.

**0005 warning:** That section recreates the `bookings` table (distance meters→km). Take a backup in the D1 dashboard first. Skip 0005 if production already has `reference_number` and `estimated_distance` as REAL.

---

## Quick sync (after fixing API token)

Once your Cloudflare API token has **D1 Edit** permission, run from `apps/server`:

```powershell
pnpm db:sync-production
```

This lists migrations on staging and production, then applies any pending ones to production so both have the same tables.

---

## API Token vs OAuth

Wrangler can authenticate via:

| Method | How | D1 migrations |
|--------|-----|----------------|
| **API token** | `CLOUDFLARE_API_TOKEN` in `.env.production` | Requires D1 Edit permission |
| OAuth | Browser login when token empty | Full access |

Prefer the API token for CI/CD and scripting. If you get error 7403, fix the token permissions (see below).

---

## Fix API Token for D1 (Error 7403)

Error **7403** usually means the API token lacks **D1 Edit** permission. Fix it:

1. Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Find the token used in `CLOUDFLARE_API_TOKEN` (e.g. in `.env.production`)
3. Click **Edit** on that token
4. Under **Account Permissions**, click **Add more**
5. Add: **D1** → **Edit**
6. Save the token

Then run the wrangler command again (with production env loaded). No need to regenerate the token—only its permissions change.

---

## Important: Account ID Fix

If you get **"Authentication error [code: 10000]"** or **"account is not valid or is not authorized [code: 7403]"**, your `CLOUDFLARE_ACCOUNT_ID` in `.env` may point to the wrong account. Your D1 databases are in account **8357cb0b** (Downunderchauffeurs).

**PowerShell** (run before the wrangler command):
```powershell
$env:CLOUDFLARE_ACCOUNT_ID="8357cb0b206399da0d4027d5f6961df9"
```

**Cmd:**
```cmd
set CLOUDFLARE_ACCOUNT_ID=8357cb0b206399da0d4027d5f6961df9
```

**Bash:**
```bash
export CLOUDFLARE_ACCOUNT_ID=8357cb0b206399da0d4027d5f6961df9
```

---

## Step 1: List Unapplied Migrations (Production)

From the project root, run:

```bash
cd apps/server
pnpm wrangler d1 migrations list DB --remote --env production
```

This shows **migrations that have NOT yet been applied** to the production database.

- **Empty output** → All migrations are applied. Production is up to date.
- **List of migration names** → Those migrations still need to be applied.

---

## Step 2: Compare With Available Migrations

Your migration journal lists these migrations in order:

| Migration | Description |
|-----------|-------------|
| 0000_long_hairball | Initial schema |
| 0001_add_booking_extras | Booking extras |
| 0002_add_offload_booking_fields | Offload fields |
| 0003_add_offload_booking_details | Offload details |
| 0004_migrate_offload_data | Offload data migration |
| 0005_convert_distance_to_real | Distance type |
| 0006_add_booking_reference_prefix | Booking reference |
| 0007_populate_booking_references | Reference population |
| 0008_fix_distance_types | Distance fixes |
| 0009_add_driver_commission_rate | Driver commission |
| 0010_add_invoice_sent_logs | Invoice logs |
| 0011_add_booking_share_token | Share token |
| 0012_square_payments | Payment methods, booking_payments, payment_status |

If `0012_square_payments` appears in the "unapplied" list, the Square payment tables (`payment_methods`, `booking_payments`, `bookings.payment_status`) are not in production yet.

---

## Step 3: Optionally Inspect via D1 Studio

You can see which migrations have been applied by querying the migrations tracking table:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **D1**
2. Open the production database: **downunderchauffeurs-db**
3. Click **Console** (or **Studio**)
4. Run:

```sql
SELECT * FROM d1_migrations ORDER BY id;
```

This shows all applied migrations. Compare with the files in `apps/server/drizzle/migrations/sqlite/`.

---

## Step 4: Apply Migrations (When Needed)

**⚠️ Backup first.** Wrangler captures a backup when you apply, but it's good practice to take a manual backup for critical changes.

To apply all pending migrations to production:

```bash
cd apps/server
pnpm wrangler d1 migrations apply DB --remote --env production
```

You will be prompted to confirm. Review the list of migrations before proceeding.

---

## Quick Reference

| Environment | Database name | Command |
|-------------|---------------|---------|
| **Production** | downunderchauffeurs-db | `--env production --remote` |
| **Staging** | my-dev-db | `--env staging --remote` |
| **Local** | — | `--env development --local` (or omit `--remote`) |

---

## If You're Unsure

1. Run **list** first (Step 1) – it's read-only and safe.
2. If migrations are listed, production schema is behind; apply them.
3. If no migrations are listed, production is up to date and your code should work.
