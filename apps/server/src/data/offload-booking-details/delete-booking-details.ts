import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { offloadBookingDetails } from "@/db/schema";

export async function deleteOffloadBookingDetails(db: DB, bookingId: string) {
	const deletedRecords = await db
		.delete(offloadBookingDetails)
		.where(eq(offloadBookingDetails.bookingId, bookingId))
		.returning();

	return deletedRecords;
}
