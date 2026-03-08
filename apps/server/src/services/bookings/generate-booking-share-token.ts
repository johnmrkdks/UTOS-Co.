import { getBookingById } from "@/data/bookings/get-booking-by-id";
import type { DB } from "@/db";
import { bookings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ErrorFactory } from "@/utils/error-factory";

function generateShareToken(): string {
	const array = new Uint8Array(24);
	crypto.getRandomValues(array);
	return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Generate or regenerate share token for a booking (e.g. for legacy bookings without one).
 */
export async function generateBookingShareTokenService(db: DB, bookingId: string) {
	const booking = await getBookingById(db, bookingId);
	if (!booking) {
		throw ErrorFactory.notFound("Booking");
	}

	const shareToken = generateShareToken();
	await db.update(bookings).set({ shareToken, updatedAt: new Date() }).where(eq(bookings.id, bookingId));

	return { shareToken };
}
