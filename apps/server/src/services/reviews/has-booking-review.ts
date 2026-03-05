import { z } from "zod";
import type { DB } from "@/db";
import { bookingReviews } from "@/db/sqlite/schema/bookings/booking-reviews";
import { eq } from "drizzle-orm";

export const HasBookingReviewSchema = z.object({
	bookingId: z.string().min(1),
});

export type HasBookingReviewInput = z.infer<typeof HasBookingReviewSchema>;

export async function hasBookingReviewService(db: DB, input: HasBookingReviewInput): Promise<boolean> {
	const [existing] = await db
		.select()
		.from(bookingReviews)
		.where(eq(bookingReviews.bookingId, input.bookingId))
		.limit(1);
	return !!existing;
}
