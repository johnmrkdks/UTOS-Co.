# Email Setup for Cloudflare Workers (Resend)

**Nodemailer/SMTP does not work in Cloudflare Workers** because Workers lack raw TCP sockets required for SMTP. This project uses **Resend** (HTTP API) for sending emails in production.

## Quick Setup

### 1. Create Resend Account
- Sign up at [resend.com](https://resend.com)
- Free tier: 100 emails/day, 3,000/month

### 2. Get API Key
- Dashboard → API Keys → Create
- Copy the key (starts with `re_`)

### 3. Add to Cloudflare Worker

**Staging:**
```bash
wrangler secret put RESEND_API_KEY --env staging
# Paste your API key when prompted
```

**Production:**
```bash
wrangler secret put RESEND_API_KEY --env production
```

### 4. (Optional) Custom From Address
For production, verify your domain in Resend and set:
- `RESEND_FROM_EMAIL` = e.g. `bookings@downunderchauffeurs.com`
- `RESEND_FROM_NAME` = `Down Under Chauffeurs`

Add to wrangler.toml `[env.staging.vars]` or as secrets.

**Testing:** Without a verified domain, Resend uses `onboarding@resend.dev` as default (sends to any email for testing).

## Verify It Works

1. Deploy: `pnpm deploy:staging`
2. In admin: Confirm a booking or assign a driver
3. Check Resend dashboard → Emails for delivery status
