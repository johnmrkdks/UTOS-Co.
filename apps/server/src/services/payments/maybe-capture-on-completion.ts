/**
 * Attempt to capture payment when a trip is completed (no waiting time).
 * Only runs if booking has an authorized payment. Does not fail the close-trip if Square is not configured.
 * @param throwOnError - When true (admin finalize), rethrow so admin sees the error. When false (driver close), log and continue.
 */
import type { DB } from "@/db";
import type { Env } from "@/types/env";
import { bookingPayments } from "@/db/sqlite/schema/payments";
import { eq } from "drizzle-orm";
import { captureBookingPayment } from "./capture-booking-payment";

export async function maybeCapturePaymentOnCompletion(
	db: DB,
	bookingId: string,
	finalAmountDollars: number,
	env?: Env,
	throwOnError = false
): Promise<void> {
	const accessToken = env?.SQUARE_ACCESS_TOKEN;
	const locationId = env?.SQUARE_LOCATION_ID;
	if (!accessToken || !locationId) {
		return; // Square not configured - skip silently
	}

	const existing = await db
		.select()
		.from(bookingPayments)
		.where(eq(bookingPayments.bookingId, bookingId))
		.get();

	if (!existing || existing.status !== "authorized") {
		return; // No payment to capture
	}

	try {
		await captureBookingPayment({
			db,
			bookingId,
			finalAmountDollars,
			idempotencyKey: `close-${bookingId}`,
			accessToken,
			locationId,
			env: (env?.SQUARE_ENVIRONMENT as "sandbox" | "production") || "sandbox",
		});
		console.log(`✅ Payment captured for booking ${bookingId} ($${finalAmountDollars.toFixed(2)})`);
	} catch (err) {
		console.error(`❌ Failed to capture payment for booking ${bookingId}:`, err);
		if (throwOnError) throw err;
		// Driver close: don't throw - admin can capture manually
	}
}
