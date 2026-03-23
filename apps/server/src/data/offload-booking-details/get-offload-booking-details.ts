import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { offloadBookingDetails } from "@/db/schema";

export async function getOffloadBookingDetails(db: DB, bookingId: string) {
	const record = await db
		.select()
		.from(offloadBookingDetails)
		.where(eq(offloadBookingDetails.bookingId, bookingId));

	return record;
}
