import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { bookings } from "@/db/schema";
import type { BookingStatusEnum, BookingTypeEnum } from "@/db/sqlite/enums";
import type { UpdateBooking } from "@/schemas/shared";

type UpdateBookingParams = {
	id: string;
	data: UpdateBooking;
};

export async function updateBooking(db: DB, { id, data }: UpdateBookingParams) {
	const updateData: any = { ...data };

	// Only cast status and bookingType if they exist in the data
	if (data.status) {
		updateData.status = data.status as BookingStatusEnum;
	}
	if (data.bookingType) {
		updateData.bookingType = data.bookingType as BookingTypeEnum;
	}

	// Convert scheduledPickupTime from ISO string to Date if it's a string
	if (updateData.scheduledPickupTime) {
		if (typeof updateData.scheduledPickupTime === "string") {
			updateData.scheduledPickupTime = new Date(updateData.scheduledPickupTime);
		} else if (updateData.scheduledPickupTime instanceof Date) {
			console.log("✅ Already a Date object");
		} else {
			console.warn(
				"⚠️ scheduledPickupTime is neither string nor Date:",
				updateData.scheduledPickupTime,
			);
		}
	}

	const [updatedBooking] = await db
		.update(bookings)
		.set(updateData)
		.where(eq(bookings.id, id))
		.returning();

	return updatedBooking;
}
