import type { DB } from "@/db";
import { bookingStops } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getBookingStops(db: DB, bookingId: string) {
	const stops = await db
		.select()
		.from(bookingStops)
		.where(eq(bookingStops.bookingId, bookingId))
		.orderBy(bookingStops.stopOrder);

	return stops;
}
