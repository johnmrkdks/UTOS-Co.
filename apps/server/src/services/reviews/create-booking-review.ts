import { z } from "zod";
import type { DB } from "@/db";
import { bookingReviews } from "@/db/sqlite/schema/bookings/booking-reviews";
import { bookings } from "@/db/sqlite/schema/bookings";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { BookingStatusEnum } from "@/db/sqlite/enums";

export const CreateBookingReviewSchema = z.object({
	bookingId: z.string().min(1),
	serviceRating: z.number().min(1).max(5),
	driverRating: z.number().min(1).max(5),
	vehicleRating: z.number().min(1).max(5),
	review: z.string().max(2000).optional(),
});

export type CreateBookingReviewInput = z.infer<typeof CreateBookingReviewSchema>;

export async function createBookingReviewService(db: DB, input: CreateBookingReviewInput, userId: string) {
	const { bookingId, serviceRating, driverRating, vehicleRating, review } = input;

	const [booking] = await db
		.select()
		.from(bookings)
		.where(eq(bookings.id, bookingId))
		.limit(1);

	if (!booking) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Booking not found",
		});
	}

	if (booking.userId !== userId) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "You can only review your own bookings",
		});
	}

	if (booking.status !== BookingStatusEnum.Completed) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "You can only review completed bookings",
		});
	}

	const [existing] = await db
		.select()
		.from(bookingReviews)
		.where(eq(bookingReviews.bookingId, bookingId))
		.limit(1);

	if (existing) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "You have already reviewed this booking",
		});
	}

	const [inserted] = await db
		.insert(bookingReviews)
		.values({
			bookingId,
			serviceRating,
			driverRating,
			vehicleRating,
			review: review ?? null,
		})
		.returning();

	return inserted;
}
