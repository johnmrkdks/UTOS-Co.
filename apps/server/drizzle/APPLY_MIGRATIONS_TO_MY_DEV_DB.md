# How to Apply Migrations to my-dev-db (D1 Studio)

Development uses **Cloudflare D1** (`my-dev-db`) with **downunderchauffeurs.workers.dev** URLs. Apply migrations via **D1 Studio** in the Cloudflare dashboard.

## Step 1: Open D1 Studio

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. **Switch to Downunderchauffeurs account** (8357cb0b)
3. Click **Workers & Pages** → **D1 SQL database**
4. Click **my-dev-db**
5. Click the **Console** tab (or **Studio**)

## Step 2: Run the Combined Migration

1. Open the file: `apps/server/drizzle/COMBINED_FOR_D1_STUDIO.sql` (in your project folder)
2. Select **all** the SQL (Ctrl+A)
3. Copy it (Ctrl+C)
4. Paste into the D1 Studio query editor
5. Click **Run**

That's it! The migration will create all tables.

## Step 3: Seed for Instant Quote & Features

Run `SEED_DEV_DB.sql` to enable the instant quote calculator and basic features:

1. Open `apps/server/drizzle/SEED_DEV_DB.sql`
2. Copy all → Paste in D1 Studio → Run

Without this, you'll see "Instant quote service is temporarily unavailable".

## Step 4: Google OAuth (for sign-in / sign-up)

Add these to your [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials → OAuth 2.0 Client:

**Authorized JavaScript origins:**
- `https://down-under-chauffeur-staging.downunderchauffeurs.workers.dev`

**Authorized redirect URIs:**
- `https://down-under-chauffeur-server-staging.downunderchauffeurs.workers.dev/api/auth/callback/google`

Save and wait a few minutes for changes to propagate.

---

## Alternative: Run Each File Manually

If the combined file fails, run each migration file **one at a time** in this order:

1. `0000_long_hairball.sql`
2. `0001_add_booking_extras.sql`
3. `0002_add_offload_booking_fields.sql`
4. `0003_add_offload_booking_details.sql`
5. `0004_migrate_offload_data.sql`
6. `0005_convert_distance_to_real.sql`
7. `0006_complex_xorn.sql`
8. `0006_complex_xorn_2_add_booking_reference_prefix.sql`
9. `0007_populate_booking_references.sql`
10. `0008_fix_distance_types.sql`
11. `0009_add_driver_commission_rate.sql`
12. `0010_add_invoice_sent_logs.sql`

For each file: open it, copy contents, paste in D1 Studio, click Run.
