import { getBookingById } from "@/data/bookings/get-booking-by-id";
import { updateBooking } from "@/data/bookings/update-booking";
import type { DB } from "@/db";
import { UpdateBookingSchema } from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";
import z from "zod";

export const UpdateBookingServiceSchema = z.object({
	id: z.string(),
	data: UpdateBookingSchema,
});

export type UpdateBookingParams = z.infer<
	typeof UpdateBookingServiceSchema
>;

export async function updateBookingService(
	db: DB,
	{ id, data }: UpdateBookingParams,
) {
	console.log("🔍 DEBUG updateBookingService - START");
	console.log("📋 Booking ID:", id);
	console.log("📝 Update data received:", JSON.stringify(data, null, 2));
	console.log("📅 scheduledPickupTime in data:", data.scheduledPickupTime);
	console.log("📅 scheduledPickupTime type:", typeof data.scheduledPickupTime);

	const booking = await getBookingById(db, id);

	if (!booking) {
		console.error("❌ Booking not found for id:", id);
		throw ErrorFactory.notFound("Booking not found.");
	}

	console.log("✅ Existing booking found, proceeding to update");
	console.log("🚀 Calling updateBooking data layer...");

	const updatedBooking = await updateBooking(db, { id, data });

	console.log("✅ Update completed successfully");
	console.log("📋 Updated booking:", JSON.stringify(updatedBooking, null, 2));

	return updatedBooking;
}
