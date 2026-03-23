/**
 * Payments router - Square authorization, capture, saved cards.
 */

import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { bookings } from "@/db/sqlite/schema/bookings";
import { paymentMethods } from "@/db/sqlite/schema/payments";
import { sendBookingConfirmationEmail } from "@/services/notifications/booking-email-notification-service";
import { authorizeBookingPayment } from "@/services/payments/authorize-booking-payment";
import { captureBookingPayment } from "@/services/payments/capture-booking-payment";
import { protectedProcedure, publicProcedure, router } from "@/trpc/init";

/** Generate idempotency key for payment operations. Square requires max 45 chars. */
function idempotencyKey(prefix: string, bookingId: string): string {
	const base = `${prefix}-${bookingId}`;
	return base.length <= 45 ? base : `${prefix}-${bookingId.slice(-40)}`;
}

export const paymentsRouter = router({
	/** Get Square config for Web Payments SDK (applicationId + locationId - safe to expose to frontend) */
	getSquareConfig: publicProcedure.query(({ ctx }) => {
		const appId = (ctx.env as unknown as { SQUARE_APPLICATION_ID?: string })
			.SQUARE_APPLICATION_ID;
		const locationId = ctx.env.SQUARE_LOCATION_ID;
		if (!appId || !locationId) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message:
					"Square is not configured. Set SQUARE_APPLICATION_ID and SQUARE_LOCATION_ID.",
			});
		}
		return { applicationId: appId, locationId };
	}),

	/**
	 * Authorize (hold) payment for a booking.
	 * Call after creating booking in pending_payment; moves to payment_authorized on success.
	 * Uses publicProcedure to support guest checkout (no session required).
	 */
	authorizeBookingPayment: publicProcedure
		.input(
			z.object({
				bookingId: z.string(),
				sourceId: z.string(), // Token from Web Payments SDK
				amountCents: z.number().int().positive(),
				paymentMethodId: z.string().optional().nullable(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const accessToken = ctx.env.SQUARE_ACCESS_TOKEN;
			const locationId = ctx.env.SQUARE_LOCATION_ID;
			if (!accessToken || !locationId) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message:
						"Square is not configured. Set SQUARE_ACCESS_TOKEN and SQUARE_LOCATION_ID.",
				});
			}

			const key = idempotencyKey("auth", input.bookingId);
			try {
				await authorizeBookingPayment({
					db: ctx.db,
					bookingId: input.bookingId,
					sourceId: input.sourceId,
					amountCents: input.amountCents,
					idempotencyKey: key,
					paymentMethodId: input.paymentMethodId ?? null,
					accessToken,
					locationId,
					env:
						(ctx.env.SQUARE_ENVIRONMENT as "sandbox" | "production") ||
						"sandbox",
				});
			} catch (err) {
				// Extract message from Error or Square SDK response
				let msg = "Payment authorization failed";
				if (err instanceof Error) {
					msg = err.message;
				} else if (err && typeof err === "object" && "errors" in err) {
					const e = (
						err as { errors?: Array<{ detail?: string; code?: string }> }
					).errors?.[0];
					msg = e?.detail ?? e?.code ?? msg;
				}
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: msg,
				});
			}

			// Send confirmation email immediately - booking status is now confirmed
			try {
				await sendBookingConfirmationEmail(input.bookingId, ctx.env);
			} catch (emailErr) {
				console.error(
					"❌ Failed to send booking confirmation email:",
					emailErr,
				);
			}

			return { success: true };
		}),

	/**
	 * Capture payment for a completed booking.
	 * Admin-only when status is awaiting_pricing_review; auto-called when completed with no extras.
	 */
	captureBookingPayment: protectedProcedure
		.input(
			z.object({
				bookingId: z.string(),
				finalAmountDollars: z.number().positive(),
				idempotencyKey: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const accessToken = ctx.env.SQUARE_ACCESS_TOKEN;
			const locationId = ctx.env.SQUARE_LOCATION_ID;
			if (!accessToken || !locationId) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Square is not configured.",
				});
			}

			// Only admin can manually trigger capture (e.g. after finalizing amount)
			const role = (ctx.session?.user as { role?: string } | undefined)?.role;
			if (role !== "admin" && role !== "super_admin") {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Only admins can capture payments.",
				});
			}

			const key =
				input.idempotencyKey ?? idempotencyKey("cap", input.bookingId);
			await captureBookingPayment({
				db: ctx.db,
				bookingId: input.bookingId,
				finalAmountDollars: input.finalAmountDollars,
				idempotencyKey: key,
				accessToken,
				locationId,
				env:
					(ctx.env.SQUARE_ENVIRONMENT as "sandbox" | "production") || "sandbox",
			});

			return { success: true };
		}),

	/** List saved payment methods for the current user */
	getSavedPaymentMethods: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session?.user?.id;
		if (!userId) return [];

		const methods = await ctx.db
			.select()
			.from(paymentMethods)
			.where(eq(paymentMethods.userId, userId))
			.all();

		return methods;
	}),

	/** Set default payment method */
	setDefaultPaymentMethod: protectedProcedure
		.input(z.object({ paymentMethodId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session?.user?.id;
			if (!userId)
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Not authenticated",
				});

			// Clear existing default
			await ctx.db
				.update(paymentMethods)
				.set({ isDefault: false, updatedAt: new Date() })
				.where(eq(paymentMethods.userId, userId));

			// Set new default
			await ctx.db
				.update(paymentMethods)
				.set({ isDefault: true, updatedAt: new Date() })
				.where(
					and(
						eq(paymentMethods.id, input.paymentMethodId),
						eq(paymentMethods.userId, userId),
					),
				);

			return { success: true };
		}),
});
