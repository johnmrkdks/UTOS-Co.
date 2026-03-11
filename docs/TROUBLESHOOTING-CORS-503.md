# Troubleshooting: CORS and 503 Errors on Sign-In

When you see both a **CORS error** ("No 'Access-Control-Allow-Origin' header") and **503 Service Unavailable** on sign-in, the root cause is usually the **503**, not CORS. When the server returns 503 without CORS headers (e.g. before your Worker runs), the browser blocks the response and reports the CORS error.

## Quick Diagnostics

### 1. Check if the server is running

```bash
# Staging
curl https://down-under-chauffeur-server-staging.downunderchauffeurs.workers.dev/

# Should return: OK
```

### 2. Check the health endpoint (no auth, no DB)

```bash
# Staging
curl https://down-under-chauffeur-server-staging.downunderchauffeurs.workers.dev/api/health

# Should return: {"ok":true,"timestamp":"..."}
```

- **If `/` and `/api/health` both work** → Worker is running. The 503 is likely from the auth handler (Better Auth, D1, etc.).
- **If both fail** → Worker may not be deployed, or Cloudflare is returning 503 before your code runs.

### 3. Test auth endpoint directly (with CORS)

```bash
curl -X POST https://down-under-chauffeur-server-staging.downunderchauffeurs.workers.dev/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -H "Origin: https://down-under-chauffeur-staging.downunderchauffeurs.workers.dev" \
  -d '{"email":"test@example.com","password":"test"}'
```

Check the response: status code, body, and whether `Access-Control-Allow-Origin` is present.

## Common Causes of 503

| Cause | What to check |
|-------|----------------|
| **Server not deployed** | Run `pnpm --filter server deploy:staging` and verify in Cloudflare Dashboard |
| **D1 database unavailable** | Cloudflare Dashboard → D1 → `my-dev-db` (staging) exists; migrations applied |
| **Worker cold start / timeout** | Check Workers → Logs; first request after idle can be slow |
| **Better Auth / DB error** | Workers → Logs for "Auth handler error" or stack traces |
| **Missing secrets** | `wrangler secret list --env staging`; ensure `BETTER_AUTH_SECRET` etc. if used |
| **CPU limit exceeded** | Workers free tier has CPU limits; password hashing (PBKDF2) should stay within limits |

## CORS Configuration (Already Set Up)

Your server already:

- Handles `OPTIONS` preflight with CORS headers
- Adds CORS to all auth responses (including 503 from auth handler)
- Allows `https://down-under-chauffeur-staging.downunderchauffeurs.workers.dev` in `ALLOWED_ORIGINS` and `CORS_ORIGIN`

If you still see CORS errors, it usually means the 503 is coming from **Cloudflare** (before your Worker runs), not from your code.

## Before Pushing to Main

1. Run the curl checks above against staging.
2. Check Cloudflare Dashboard → Workers → your server → Logs for errors.
3. Ensure staging D1 has migrations applied (see `apps/server/drizzle/` and your migration workflow).
4. Redeploy server if needed: `pnpm --filter server deploy:staging`.

## Production vs Staging

Production uses `api.downunderchauffeurs.com` and `downunderchauffeurs.com`. Staging uses `*.downunderchauffeurs.workers.dev`. Both are in `CORS_ORIGIN` and `ALLOWED_ORIGINS` for their respective environments.
