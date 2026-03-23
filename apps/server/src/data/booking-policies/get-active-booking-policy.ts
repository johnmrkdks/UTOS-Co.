import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { bookingPolicies } from "@/db/sqlite/schema";

export async function getActiveBookingPolicy(db: DB) {
	try {
		const policy = await db
			.select()
			.from(bookingPolicies)
			.where(eq(bookingPolicies.isDefault, true))
			.limit(1);

		if (policy.length > 0) {
			console.log("📋 Found policy:", JSON.stringify(policy[0], null, 2));
		} else {
			console.log("⚠️ No active booking policy found in database");
		}

		return policy[0] || null;
	} catch (error) {
		throw error;
	}
}
