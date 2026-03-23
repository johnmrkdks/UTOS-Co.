# Square Payment Setup

To fix the "Payment Setup Error" (Square is not configured), add these credentials to your server.

## 1. Get credentials from Square Developer Dashboard

1. Go to [Square Developer Dashboard](https://developer.squareup.com/apps)
2. Select your app (e.g. "down-under-chauffeurs-stagging")
3. **Application ID**: Credentials → Sandbox → copy **Application ID** (starts with `sandbox-sq0idp-`)
4. **Location ID**: Locations → select your location → copy **Location ID** (starts with `L`)
5. **Access Token**: Credentials → Sandbox → copy **Access Token** (starts with `sq0atp-`)

## 2. Add to staging server

### Option A: wrangler.toml (recommended for Application ID & Location ID)

Edit `apps/server/wrangler.toml`, find the Square section under `[env.staging.vars]`, and uncomment + set:

```toml
SQUARE_APPLICATION_ID = "sq0idp-YOUR_ACTUAL_APP_ID"
SQUARE_LOCATION_ID = "LYOUR_ACTUAL_LOCATION_ID"
SQUARE_ENVIRONMENT = "sandbox"
```

### Option B: Cloudflare secrets (for Access Token – keep this private)

```bash
cd apps/server
wrangler secret put SQUARE_ACCESS_TOKEN --env staging
# Paste your Square sandbox access token when prompted
```

## 3. Local development (.dev.vars)

Create or edit `apps/server/.dev.vars`:

```
SQUARE_APPLICATION_ID=sq0idp-YOUR_ACTUAL_APP_ID
SQUARE_LOCATION_ID=LYOUR_ACTUAL_LOCATION_ID
SQUARE_ACCESS_TOKEN=sq0atp-YOUR_ACTUAL_ACCESS_TOKEN
SQUARE_ENVIRONMENT=sandbox
```

## 4. Redeploy

After updating `wrangler.toml`:

```bash
pnpm --filter server deploy:staging
```

If you only added secrets, redeploy is not required – secrets take effect on the next request.

## Troubleshooting

### 404 on product-information / 400 on card-nonce

If you see:
- `POST https://pci-connect.squareupsandbox.com/v2/tokenization/product-information 404 (Not Found)`
- `POST https://pci-connect.squareupsandbox.com/v2/card-nonce 400 (Bad Request)`

**1. Environment mismatch (most common)**  
The Application ID used in the frontend must match the Access Token used in the backend. Both must come from the **same** Square sandbox application.

- In [Square Developer Dashboard](https://developer.squareup.com/apps) → your app → **Credentials** → **Sandbox**
- Copy **Application ID** (starts with `sandbox-sq0idp-`) and **Access Token** (starts with `sq0atp-`)
- Ensure `SQUARE_APPLICATION_ID` in wrangler.toml matches the Application ID exactly
- Ensure `SQUARE_ACCESS_TOKEN` (secret) is the Sandbox Access Token from the same app

**2. Location ID**  
The Location ID must be from your sandbox. In the Dashboard → **Locations** → select your sandbox location → copy the Location ID (starts with `L`).

**3. Use sandbox test cards**  
Sandbox does not accept real cards. Use:
- Visa: `4111 1111 1111 1111`
- CVV: `111`, any future expiry, any postal code

**4. Application ID format**  
Sandbox Application IDs typically start with `sandbox-sq0idp-` (with a **p**). If yours shows `sq0idb-` (with a **b**), double-check you copied it correctly from the Dashboard.

**5. HTTPS**  
The Web Payments SDK requires HTTPS. Localhost is allowed for sandbox; production domains must use HTTPS.

**6. Apple Pay**  
Apple Pay requires domain registration in the [Square Developer Console](https://developer.squareup.com/apps) → your app → **Apple Pay** → **Add Sandbox Domain**. Use your production domain (e.g. `downunderchauffeurs.com`). Apple Pay only works in Safari on iOS/macOS.


### 401 UNAUTHORIZED – "This request could not be authorized"

Square rejected the request because the **access token** is invalid or mismatched.

**Fix:**
1. Go to [Square Developer Dashboard](https://developer.squareup.com/apps) → your app → **Credentials** → **Sandbox**
2. Copy the **Access Token** (starts with `sq0atp-`)
3. Set it as a secret for staging:
   ```bash
   cd apps/server
   wrangler secret put SQUARE_ACCESS_TOKEN --env staging
   ```
   Paste the token when prompted.
4. Redeploy (or wait – secrets take effect on the next request):
   ```bash
   pnpm --filter server deploy:staging
   ```

**Check:** The access token must be from the **same** sandbox application as your Application ID. If you regenerated the token in the dashboard, the old one is invalid.

### 401 even with correct credentials – checklist

If you copied the exact IDs and token but still get 401:

**1. Where are you testing?**
- **Local** (`pnpm dev`, web on localhost:3001): The server uses `--env development`. Square vars are now in wrangler.toml, but **SQUARE_ACCESS_TOKEN** must be in `apps/server/.dev.vars` (wrangler loads secrets from there). Add:
  ```
  SQUARE_ACCESS_TOKEN=sq0atp-YOUR_SANDBOX_TOKEN
  ```
- **Staging** (deployed URL): The secret is set via `wrangler secret put SQUARE_ACCESS_TOKEN --env staging`. Ensure you ran this and pasted the token correctly.

**2. Paste issues**
- No leading/trailing spaces or newlines when pasting the token
- Copy the full token – sandbox tokens are long
- Try "Replace" in the Square dashboard to get a fresh token, then set it again

**3. Same app**
- Application ID, Location ID, and Access Token must all come from the **same** Square app
- In the dashboard, stay on **Sandbox** (not Production) when copying
- If you have multiple apps, confirm you're in the right one

**4. Regenerated token**
- If you clicked "Replace" on the access token, the old one is invalid
- Re-run `wrangler secret put SQUARE_ACCESS_TOKEN --env staging` with the new token

**5. Restart after changes**
- Local: Restart `pnpm dev` after editing `.dev.vars`
- Staging: Secrets apply immediately; no redeploy needed
