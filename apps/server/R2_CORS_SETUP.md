# R2 CORS Setup (fixes car image upload CORS error)

When uploading car images from the admin dashboard, the browser sends a PUT request directly to the R2 bucket using a presigned URL. R2 must have CORS configured to allow these cross-origin requests.

## Error you may see

```
Access to fetch at 'https://...r2.cloudflarestorage.com/...' from origin 'https://down-under-chauffeur-staging.downunderchauffeurs.workers.dev' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Fix: Apply CORS to your R2 buckets

### Option A: Wrangler CLI (recommended)

From the `apps/server` directory:

**Staging bucket** (used by `down-under-chauffeur-staging.downunderchauffeurs.workers.dev`):
```bash
pnpm wrangler r2 bucket cors set down-under-chauffeur-bucket --file r2-cors.json --env staging
```

**Production bucket** (used by `downunderchauffeurs.com`):
```bash
pnpm wrangler r2 bucket cors set downunderchauffeurs-bucket --file r2-cors.json --env production
```

**Dev/test bucket**:
```bash
pnpm wrangler r2 bucket cors set down-under-chauffeur-test-bucket --file r2-cors.json --env dev
```

### Option B: Cloudflare Dashboard

**Important:** Do NOT paste `r2-cors.json` into the Dashboard — it uses a different format and will show "This policy is not valid." Use the format below instead.

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **R2** → **down-under-chauffeur-bucket** → **Settings** → **CORS Policy** → **+ Add**
2. Delete any existing content and paste this JSON (copy exactly):
```json
[
  {
    "AllowedOrigins": [
      "https://down-under-chauffeur-staging.downunderchauffeurs.workers.dev",
      "https://downunderchauffeurs.com",
      "https://down-under-chauffeur-dev.luppy.workers.dev",
      "http://localhost:3001",
      "http://localhost:3002",
      "http://localhost:3003"
    ],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["Content-Type", "Content-Length"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```
3. Save

### Verify

```bash
pnpm wrangler r2 bucket cors list down-under-chauffeur-bucket --env staging
```

CORS propagation can take up to 30 seconds. Retry the upload after applying.
