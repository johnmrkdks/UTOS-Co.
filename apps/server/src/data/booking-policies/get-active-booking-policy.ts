import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { bookingPolicies } from "@/db/sqlite/schema";

export async function getActiveBookingPolicy(db: DB) {
	console.log("🔍 getActiveBookingPolicy - START");
	
	try {
		console.log("🔍 Querying booking policies table...");
		console.log("🔍 Database object:", typeof db, db ? "available" : "null");
		console.log("🔍 Table schema:", typeof bookingPolicies, bookingPolicies ? "available" : "null");
		
		const policy = await db
			.select()
			.from(bookingPolicies)
			.where(eq(bookingPolicies.isDefault, true))
			.limit(1);
		
		console.log("📋 Query result count:", policy.length);
		if (policy.length > 0) {
			console.log("📋 Found policy:", JSON.stringify(policy[0], null, 2));
		} else {
			console.log("⚠️ No active booking policy found in database");
		}
		
		return policy[0] || null;
	} catch (error) {
		console.error("💥 ERROR in getActiveBookingPolicy:", error);
		console.error("📚 Error stack:", error instanceof Error ? error.stack : 'No stack trace');
		throw error;
	}
}