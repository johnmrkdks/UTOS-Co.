import type { DB } from "@/db";
import { bookings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { ErrorFactory } from "@/utils/error-factory";

export const AssignDriverServiceSchema = z.object({
	bookingId: z.string(),
	driverId: z.string(),
});

export type AssignDriverParams = z.infer<typeof AssignDriverServiceSchema>;

export async function assignDriverService(db: DB, data: AssignDriverParams) {
	const { bookingId, driverId } = data;

	// First, get the booking to check if car is assigned
	const [existingBooking] = await db
		.select()
		.from(bookings)
		.where(eq(bookings.id, bookingId))
		.limit(1);

	if (!existingBooking) {
		throw ErrorFactory.notFound("Booking");
	}

	if (!existingBooking.carId) {
		throw ErrorFactory.badRequest(
			"Cannot assign driver - no vehicle assigned to this booking. Please assign a vehicle first before assigning a driver."
		);
	}

	const [updatedBooking] = await db
		.update(bookings)
		.set({
			driverId: driverId,
			driverAssignedAt: new Date(),
			status: "driver_assigned" as any,
		})
		.where(eq(bookings.id, bookingId))
		.returning();

	return updatedBooking;
}