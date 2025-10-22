import type { DB } from "@/db";
import { offloadBookingDetails } from "@/db/schema";
import type { InsertOffloadBookingDetails } from "@/types";

export type CreateOffloadBookingDetailsParams = InsertOffloadBookingDetails & {
	bookingId: string;
}

export async function createOffloadBookingDetails(db: DB, data: CreateOffloadBookingDetailsParams) {
	const createdDetails = await db.insert(offloadBookingDetails).values({
		bookingId: data.bookingId,
		offloaderName: data.offloaderName,
		jobType: data.jobType,
		vehicleType: data.vehicleType,
	}).returning();

	return createdDetails;
}
