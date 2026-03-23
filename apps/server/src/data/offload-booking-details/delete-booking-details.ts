import type { DB } from "@/db";
import { offloadBookingDetails } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function deleteOffloadBookingDetails(db: DB, bookingId: string) {
	const deletedRecords = await db
		.delete(offloadBookingDetails)
		.where(eq(offloadBookingDetails.bookingId, bookingId))
		.returning();

	return deletedRecords;
}

