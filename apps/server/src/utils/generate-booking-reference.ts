import type { DB } from "@/db";
import { systemSettings, bookings } from "@/db/sqlite/schema";
import { eq } from "drizzle-orm";

// Cache for booking reference prefix to avoid repeated DB queries
let cachedPrefix: string | null = null;

/**
 * Get the booking reference prefix from system settings
 * Uses in-memory caching for performance
 */
async function getBookingReferencePrefix(db: DB): Promise<string> {
	if (cachedPrefix) return cachedPrefix;

	const settings = await db.select().from(systemSettings).limit(1);
	cachedPrefix = settings[0]?.bookingReferencePrefix || "DUC";
	return cachedPrefix;
}

/**
 * Clear the cached prefix (useful when settings are updated)
 */
export function clearBookingReferencePrefixCache() {
	cachedPrefix = null;
}

/**
 * Generate a unique booking reference number
 * Format: {PREFIX}-{6-DIGIT-NUMBER}
 * Example: DUC-234567, ABC-123456
 *
 * Ensures uniqueness by checking database for conflicts
 *
 * @param db - Database instance
 * @param maxAttempts - Maximum retry attempts (default: 10)
 * @returns Promise<string> - Generated unique reference number (e.g., "DUC-234567")
 */
export async function generateBookingReference(db: DB, maxAttempts = 10): Promise<string> {
	const prefix = await getBookingReferencePrefix(db);

	for (let attempt = 0; attempt < maxAttempts; attempt++) {
		// Generate a 6-digit random number (100000-999999)
		const number = Math.floor(100000 + Math.random() * 900000);
		const referenceNumber = `${prefix}-${number}`;

		// Check if this reference number already exists
		const existing = await db
			.select({ id: bookings.id })
			.from(bookings)
			.where(eq(bookings.referenceNumber, referenceNumber))
			.limit(1);

		// If unique, return it
		if (existing.length === 0) {
			return referenceNumber;
		}

		// If conflict, retry (loop continues)
		console.log(`Reference ${referenceNumber} already exists, retrying... (attempt ${attempt + 1}/${maxAttempts})`);
	}

	// Fallback: use timestamp to ensure uniqueness if all retries failed
	const timestamp = Date.now().toString().slice(-6);
	return `${prefix}-${timestamp}`;
}
