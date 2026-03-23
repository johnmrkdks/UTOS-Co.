import z from "zod";
import { createBookingStops } from "@/data/booking-stops/create-booking-stops";
import { deleteBookingStops } from "@/data/booking-stops/delete-booking-stops";
import { getBookingById } from "@/data/bookings/get-booking-by-id";
import { updateBooking } from "@/data/bookings/update-booking";
import type { DB } from "@/db";
import { UpdateBookingSchema } from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";

const StopSchema = z.object({
	address: z.string().min(1, "Address is required"),
	latitude: z.number().optional(),
	longitude: z.number().optional(),
	stopOrder: z.number().int(),
	waitingTime: z.number().int().default(0),
	notes: z.string().optional(),
});

export const UpdateBookingServiceSchema = z.object({
	id: z.string(),
	data: UpdateBookingSchema,
	stops: z.array(StopSchema).optional(),
});

export type UpdateBookingParams = z.infer<typeof UpdateBookingServiceSchema>;

export async function updateBookingService(
	db: DB,
	{ id, data, stops }: UpdateBookingParams,
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

	// Update stops if provided
	if (stops !== undefined) {
		await deleteBookingStops(db, id);
		if (stops.length > 0) {
			const stopsData = stops.map((stop) => ({
				bookingId: id,
				stopOrder: stop.stopOrder,
				address: stop.address,
				latitude: stop.latitude,
				longitude: stop.longitude,
				waitingTime: stop.waitingTime ?? 0,
				notes: stop.notes,
			}));
			await createBookingStops(db, stopsData);
		}
	}

	console.log("✅ Update completed successfully");
	console.log("📋 Updated booking:", JSON.stringify(updatedBooking, null, 2));

	return updatedBooking;
}
