# Square Payment Integration – Implementation Plan

## Overview

Integrate Square payments with authorization + delayed capture for Down Under Chauffeur. Payment is authorized at booking time and captured after trip completion (auto-capture if no waiting time; admin finalization if waiting time added).

---

## 1. Database Schema Changes

### New Tables

**`payment_methods`** – Saved cards for registered users
- `id`, `userId`, `squareCustomerId`, `squareCardId`, `last4`, `brand`, `isDefault`, `createdAt`, `updatedAt`

**`booking_payments`** – Payment state per booking
- `id`, `bookingId`, `squarePaymentId`, `squareOrderId` (optional)
- `authorizedAmount` (cents), `capturedAmount` (cents), `finalAmount` (cents)
- `paymentStatus`: `pending_authorization` | `authorized` | `captured` | `voided` | `failed` | `refunded`
- `paymentMethodId` (nullable – for saved card), `squareSourceId` (token used for auth)
- `idempotencyKey`, `capturedAt`, `createdAt`, `updatedAt`
- For guests: store `squareSourceId` or card fingerprint to capture later (Square supports capturing from payment ID)

### Booking Table Additions

- `paymentStatus`: `pending_payment` | `payment_authorized` | `awaiting_capture` | `payment_captured` | `payment_failed` | `payment_cancelled` | `refunded`
- Optional: `squarePaymentId` denormalized for quick lookup

### Status Flow (Booking + Payment)

| Booking Status | Payment Status | Meaning |
|----------------|----------------|---------|
| `pending` | `pending_payment` | Booking created, payment not yet authorized |
| `confirmed` | `payment_authorized` | Payment held, booking confirmed |
| `completed` | `payment_captured` | Trip done, payment captured (no waiting time) |
| `awaiting_pricing_review` | `payment_authorized` | Trip done with waiting time, admin must finalize |
| After admin finalize | `payment_captured` | Admin set final amount, payment captured |

---

## 2. Square Setup

### Environment Variables

- `SQUARE_ACCESS_TOKEN` – Server-side (secret)
- `SQUARE_APPLICATION_ID` – For Web Payments SDK (can be public)
- `SQUARE_LOCATION_ID` – Merchant location
- `VITE_SQUARE_APPLICATION_ID` – Injected at build for frontend

### Square APIs Used

1. **Payments API** – `createPayment` (with `delayCapture: true`), `completePayment` (capture), `getPayment`
2. **Customers API** – Create customer for saved cards, link cards
3. **Cards API** – Store card on file for returning customers
4. **Web Payments SDK** – Card, Apple Pay, Google Pay tokenization

---

## 3. Backend Implementation

### New Services

- `services/payments/square-client.ts` – Square SDK wrapper
- `services/payments/authorize-payment.ts` – Create payment with delay capture
- `services/payments/capture-payment.ts` – Capture authorized payment
- `services/payments/void-payment.ts` – Void if cancelled
- `services/payments/saved-cards.ts` – CRUD for payment_methods

### New tRPC Procedures (`payments` router)

- `createPaymentIntent` – Returns `{ clientSecret, squareApplicationId }` for Web SDK (or we use token flow)
- `authorizeBookingPayment` – Accept token, create payment with delay capture, link to booking
- `captureBookingPayment` – Capture for booking (idempotent)
- `voidBookingPayment` – Void authorization
- `getSavedPaymentMethods` – List user's saved cards
- `addPaymentMethod` – Save card via token
- `setDefaultPaymentMethod` – Set preferred card
- `removePaymentMethod` – Delete saved card

### Webhook Handler

- `POST /api/webhooks/square` – Handle `payment.created`, `payment.updated`, `payment.captured`
- Verify webhook signature
- Update `booking_payments` and `bookings.paymentStatus`

### Integration Points

1. **createPackageBooking** / **createCustomBooking** / **createCustomBookingFromQuote** / **createCustomBookingFromQuoteAsGuest**
   - Require payment authorization before creating booking (or create booking in `pending_payment`, then authorize and move to `confirmed`)

2. **closeTripWithExtras** (no waiting time) → `Completed` → trigger `captureBookingPayment`
3. **closeTripWithoutExtras** → `Completed` → trigger `captureBookingPayment`
4. **updateBooking** (admin finalizes) → when status `awaiting_pricing_review` → `completed` and finalAmount set → trigger `captureBookingPayment` with updated amount

---

## 4. Frontend Implementation

### Payment Components

- `SquarePaymentForm` – Card entry + Apple Pay + Google Pay (Web Payments SDK)
- `SavedPaymentMethodSelector` – Dropdown for saved cards
- `PaymentHoldMessage` – "Your payment will be authorized now and charged after your trip."

### Booking Flow Changes

1. **Guest booking** – Add payment step before final submit; tokenize → authorize → create booking
2. **Logged-in booking** – Same flow; allow selecting saved card or new card
3. **Admin-created booking** – Optional: skip payment or use "pay later" for walk-ins

### Pages to Update

- `quote-booking-page.tsx` – Add payment step
- `service-booking-form.tsx` – Add payment step
- `car-appointment-booking-dialog.tsx` – Add payment step
- `create-custom-booking-dialog.tsx` – Admin: optional payment
- Customer dashboard – Show payment status per booking
- Admin booking details – Show payment status, capture button for awaiting_pricing_review

---

## 5. Email / Notifications

- **After authorization** – Booking confirmation email (existing, ensure it fires)
- **After capture** – Trip completion receipt (existing `sendTripStatusNotification`)
- **Awaiting admin** – Notify admin when booking is `awaiting_pricing_review`
- **Do not** send final summary until payment captured

---

## 6. Security & Best Practices

- Idempotency keys for all payment API calls
- Never log or store raw card data
- Validate amounts server-side before capture
- Admin-only capture for `awaiting_pricing_review`
- Audit log for payment events (optional table)

---

## 7. File Change Summary

| Area | Files to Create/Modify |
|------|------------------------|
| DB | `schema/payments.ts`, `schema/payment-methods.ts`, migration `0012_square_payments.sql` |
| Server | `services/payments/*`, `trpc/routers/payments.ts`, `index.ts` webhook route |
| Server | `create-booking.ts`, `close-trip-with-extras.ts`, `close-trip-without-extras.ts`, `update-booking.ts` |
| Web | `SquarePaymentForm.tsx`, `SavedPaymentMethodSelector.tsx`, booking flows |
| Web | `booking-details-dialog.tsx` (admin), customer history/trips |
| Env | `wrangler.toml`, `.env.example` |

---

## 9. Implementation Status

**Completed:**
- DB schema: `payment_methods`, `booking_payments`, `bookings.payment_status`
- Migration `0012_square_payments.sql`
- Square client, authorize, capture services
- tRPC payments router (`authorizeBookingPayment`, `captureBookingPayment`, `getSquareConfig`, `getSavedPaymentMethods`, `setDefaultPaymentMethod`)
- Auto-capture on trip completion (no waiting time) in `closeTripWithExtras` and `closeTripWithoutExtras`
- Admin finalization triggers capture in `bookings.update`
- `SquarePaymentForm` component (card entry)
- Env vars documented in `.env.example` and `wrangler.toml`

**Remaining (for full production):**
- ~~Wire `SquarePaymentForm` into booking flows (quote-booking, service-booking, etc.)~~ ✅ Quote booking flow done (Option A: create → payment → confirm)
- Add `VITE_SQUARE_APPLICATION_ID` and Square config to web env; fetch via `payments.getSquareConfig`
- ~~Apple Pay / Google Pay in `SquarePaymentForm`~~ ✅ Implemented
- Saved cards UI (add/remove/set default)
- Webhook handler for payment events
- Admin UI: payment status per booking, manual capture button for `awaiting_pricing_review`
- Run migration: `pnpm --filter server db:migrate-d1` (or apply `0012_square_payments.sql` manually)

---

## 10. Assumptions

- Square sandbox for development; production keys for prod
- AUD currency (Square supports AUD)
- Amounts stored in dollars in DB; Square API uses cents
- Guest bookings: we store `squarePaymentId` from authorization; capture uses that payment ID (Square allows capturing authorized payment by ID)
- Apple Pay / Google Pay: Web Payments SDK handles tokenization; same backend flow as card
