import type { DB } from "@/db";
import { bookingPolicies } from "@/db/sqlite/schema";

export async function createDefaultBookingPolicy(db: DB) {
	const [defaultPolicy] = await db
		.insert(bookingPolicies)
		.values({
			name: "Standard Booking Policy",
			description:
				"Default policy allowing edits and cancellations 4 hours before pickup",
			editAllowedHours: 4,
			editDisabledAfterDriverAssignment: true,
			cancellationAllowedHours: 4,
			cancellationFeePercentage: 0,
			cancellationDisabledAfterDriverAssignment: false,
			isActive: true,
			isDefault: true,
		})
		.returning();

	return defaultPolicy;
}
