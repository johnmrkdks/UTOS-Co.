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
	console.log("🔍 DEBUG updateBooking (data layer) - START");
	console.log("📋 Booking ID:", id);
	console.log("📝 Raw data received:", JSON.stringify(data, null, 2));

	const updateData: any = { ...data };

	// Only cast status and bookingType if they exist in the data
	if (data.status) {
		console.log("🔄 Casting status:", data.status);
		updateData.status = data.status as BookingStatusEnum;
	}
	if (data.bookingType) {
		console.log("🔄 Casting bookingType:", data.bookingType);
		updateData.bookingType = data.bookingType as BookingTypeEnum;
	}

	// Convert scheduledPickupTime from ISO string to Date if it's a string
	if (updateData.scheduledPickupTime) {
		console.log("📅 scheduledPickupTime found:", updateData.scheduledPickupTime);
		console.log("📅 Type:", typeof updateData.scheduledPickupTime);

		if (typeof updateData.scheduledPickupTime === 'string') {
			console.log("🔄 Converting string to Date...");
			updateData.scheduledPickupTime = new Date(updateData.scheduledPickupTime);
			console.log("✅ Converted to Date:", updateData.scheduledPickupTime);
		} else if (updateData.scheduledPickupTime instanceof Date) {
			console.log("✅ Already a Date object");
		} else {
			console.warn("⚠️ scheduledPickupTime is neither string nor Date:", updateData.scheduledPickupTime);
		}
	}

	console.log("🚀 Executing database update with data:", JSON.stringify(updateData, null, 2));

	const [updatedBooking] = await db.update(bookings).set(updateData).where(eq(bookings.id, id)).returning();

	console.log("✅ Database update completed");
	console.log("📋 Updated booking from DB:", JSON.stringify(updatedBooking, null, 2));

	return updatedBooking;
}
