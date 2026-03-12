/**
 * Authorize (hold) payment for a booking using Square Payments API.
 * Uses delayed capture - funds are held but not charged until capture.
 */
import type { DB } from "@/db";
import { getSquareClient } from "./square-client";
import { bookingPayments } from "@/db/sqlite/schema/payments";
import { bookings } from "@/db/sqlite/schema/bookings";
import { eq } from "drizzle-orm";
import { BookingPaymentStatusEnum, BookingStatusEnum } from "@/db/sqlite/enums";
import { createId } from "@paralleldrive/cuid2";

export interface AuthorizePaymentParams {
	db: DB;
	bookingId: string;
	sourceId: string; // Payment token from Web Payments SDK (card, Apple Pay, Google Pay)
	amountCents: number;
	currency?: string;
	idempotencyKey: string;
	paymentMethodId?: string | null;
	accessToken: string;
	locationId: string;
	env?: "sandbox" | "production";
}

export async function authorizeBookingPayment(params: AuthorizePaymentParams) {
	const {
		db,
		bookingId,
		sourceId,
		amountCents,
		currency = "AUD",
		idempotencyKey,
		paymentMethodId,
	accessToken,
	locationId,
	env = "sandbox",
} = params;

	const client = await getSquareClient(accessToken, env);

	const result = await client.payments.create({
		sourceId,
		idempotencyKey,
		amountMoney: {
			amount: BigInt(amountCents),
			currency: currency as "AUD" | "USD",
		},
		locationId,
		// Delayed capture - hold funds, capture later (autocomplete: false)
		autocomplete: false,
		// Optional: link to booking for reconciliation
		referenceId: bookingId,
	});

	if (!result.payment) {
		const squareErrors = (result as { errors?: Array<{ code?: string; detail?: string }> }).errors;
		const detail = squareErrors?.[0]?.detail ?? squareErrors?.[0]?.code ?? "Unknown error";
		throw new Error(`Square payment failed: ${detail}`);
	}

	const payment = result.payment;
	const squarePaymentId = payment.id!;

	// Insert or update booking_payments (idempotent on retry)
	await db
		.insert(bookingPayments)
		.values({
			id: createId(),
			bookingId,
			squarePaymentId,
			authorizedAmountCents: amountCents,
			finalAmountCents: amountCents,
			status: "authorized",
			paymentMethodId: paymentMethodId ?? null,
			squareSourceId: sourceId,
			idempotencyKey,
		})
		.onConflictDoUpdate({
			target: bookingPayments.bookingId,
			set: {
				squarePaymentId,
				authorizedAmountCents: amountCents,
				finalAmountCents: amountCents,
				status: "authorized",
				paymentMethodId: paymentMethodId ?? null,
				squareSourceId: sourceId,
				idempotencyKey,
				updatedAt: new Date(),
			},
		});

	// Update booking: payment authorized + status confirmed
	await db
		.update(bookings)
		.set({
			paymentStatus: BookingPaymentStatusEnum.PaymentAuthorized,
			status: BookingStatusEnum.Confirmed,
			updatedAt: new Date(),
		})
		.where(eq(bookings.id, bookingId));

	return {
		squarePaymentId,
		status: payment.status,
	};
}
