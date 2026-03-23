import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { bookingStops } from "@/db/schema";

export async function deleteBookingStops(db: DB, bookingId: string) {
	const deletedStops = await db
		.delete(bookingStops)
		.where(eq(bookingStops.bookingId, bookingId))
		.returning();

	return deletedStops;
}
