import type { DB } from "@/db";
import { bookings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const AssignDriverServiceSchema = z.object({
	bookingId: z.string(),
	driverId: z.string(),
});

export type AssignDriverParams = z.infer<typeof AssignDriverServiceSchema>;

export async function assignDriverService(db: DB, data: AssignDriverParams) {
	const { bookingId, driverId } = data;
	
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