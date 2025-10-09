import type { DB } from "@/db";
import { bookings } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { UpdateBooking } from "@/schemas/shared";
import { BookingStatusEnum, BookingTypeEnum } from "@/db/sqlite/enums";

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
	if (updateData.scheduledPickupTime && typeof updateData.scheduledPickupTime === 'string') {
		updateData.scheduledPickupTime = new Date(updateData.scheduledPickupTime);
	}

	const [updatedBooking] = await db.update(bookings).set(updateData).where(eq(bookings.id, id)).returning();
	return updatedBooking;
}
