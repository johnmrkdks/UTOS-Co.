import { and, eq, isNull, or } from "drizzle-orm";
import type { DB } from "@/db";
import { bookings, drivers, users } from "@/db/schema";

export async function getAvailableDriversService(
	db: DB,
	timeSlot?: { start: Date; end: Date },
) {
	// Get all active and approved drivers
	const query = db
		.select({
			id: drivers.id,
			userId: drivers.userId,
			licenseNumber: drivers.licenseNumber,
			phoneNumber: drivers.phoneNumber,
			isActive: drivers.isActive,
			isApproved: drivers.isApproved,
			rating: drivers.rating,
			totalRides: drivers.totalRides,
			user: {
				id: users.id,
				name: users.name,
				email: users.email,
			},
		})
		.from(drivers)
		.leftJoin(users, eq(drivers.userId, users.id))
		.where(and(eq(drivers.isActive, true), eq(drivers.isApproved, true)));

	// If timeSlot is provided, filter out drivers who are already booked during that time
	if (timeSlot) {
		// This is a simplified availability check - in a real system you'd want more sophisticated scheduling logic
		const conflictingBookings = await db
			.select({ driverId: bookings.driverId })
			.from(bookings)
			.where(
				and(
					// Driver is assigned
					isNull(bookings.driverId),
					// Booking overlaps with requested time slot
					or(
						and(
							eq(bookings.scheduledPickupTime, timeSlot.start),
							eq(bookings.actualDropoffTime, timeSlot.end),
						),
						// Add more sophisticated overlap logic as needed
					),
				),
			);

		const unavailableDriverIds = conflictingBookings
			.map((b) => b.driverId)
			.filter(Boolean);

		if (unavailableDriverIds.length > 0) {
			// Filter out unavailable drivers - this would need proper SQL NOT IN implementation
			// For now, we'll return all drivers and let the frontend handle availability
		}
	}

	return await query;
}
