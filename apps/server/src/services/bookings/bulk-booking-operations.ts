import { z } from "zod";
import type { DB } from "@/db";
import { bookings } from "@/db/sqlite/schema";
import { eq, inArray } from "drizzle-orm";

export const BulkArchiveBookingsSchema = z.object({
	bookingIds: z.array(z.string()).min(1, "At least one booking ID is required"),
	isArchived: z.boolean().nullable(),
});

export const BulkDeleteBookingsSchema = z.object({
	bookingIds: z.array(z.string()).min(1, "At least one booking ID is required"),
});

export type BulkArchiveBookingsInput = z.infer<typeof BulkArchiveBookingsSchema>;
export type BulkDeleteBookingsInput = z.infer<typeof BulkDeleteBookingsSchema>;

export const bulkArchiveBookingsService = async (
	db: DB,
	input: BulkArchiveBookingsInput,
) => {
	try {
		console.log("=== DEBUG: Starting bulkArchiveBookingsService ===");
		console.log("Input data:", JSON.stringify(input, null, 2));

		// Check if bookings exist
		console.log("DEBUG: Checking if bookings exist:", input.bookingIds);
		const existingBookings = await db
			.select()
			.from(bookings)
			.where(inArray(bookings.id, input.bookingIds));

		console.log("DEBUG: Found bookings:", existingBookings.length, "out of", input.bookingIds.length);

		if (existingBookings.length === 0) {
			throw new Error("No valid bookings found");
		}

		// Update bookings archive status
		console.log("DEBUG: Bulk updating archive status to:", input.isArchived);
		const updatedBookings = await db
			.update(bookings)
			.set({
				isArchived: input.isArchived,
				updatedAt: new Date(),
			})
			.where(inArray(bookings.id, input.bookingIds))
			.returning();

		console.log("DEBUG: Bulk archive operation completed successfully");
		console.log("DEBUG: Updated bookings count:", updatedBookings.length);

		console.log("=== DEBUG: bulkArchiveBookingsService completed successfully ===");
		return {
			success: true,
			message: `${updatedBookings.length} booking${updatedBookings.length !== 1 ? 's' : ''} ${input.isArchived ? 'archived' : 'unarchived'} successfully.`,
			updatedCount: updatedBookings.length,
			bookings: updatedBookings,
		};
	} catch (error) {
		console.error("=== ERROR in bulkArchiveBookingsService ===");
		console.error("Error message:", error instanceof Error ? error.message : error);
		console.error("=== END ERROR LOG ===");
		throw error;
	}
};

export const bulkDeleteBookingsService = async (
	db: DB,
	input: BulkDeleteBookingsInput,
) => {
	try {
		console.log("=== DEBUG: Starting bulkDeleteBookingsService ===");
		console.log("Input data:", JSON.stringify(input, null, 2));

		// Check if bookings exist
		console.log("DEBUG: Checking if bookings exist:", input.bookingIds);
		const existingBookings = await db
			.select()
			.from(bookings)
			.where(inArray(bookings.id, input.bookingIds));

		console.log("DEBUG: Found bookings:", existingBookings.length, "out of", input.bookingIds.length);

		if (existingBookings.length === 0) {
			throw new Error("No valid bookings found");
		}

		// Delete bookings permanently
		console.log("DEBUG: Permanently deleting bookings");
		const deletedResult = await db
			.delete(bookings)
			.where(inArray(bookings.id, input.bookingIds));

		console.log("DEBUG: Bulk delete operation completed successfully");

		console.log("=== DEBUG: bulkDeleteBookingsService completed successfully ===");
		return {
			success: true,
			message: `${existingBookings.length} booking${existingBookings.length !== 1 ? 's' : ''} deleted permanently.`,
			deletedCount: existingBookings.length,
		};
	} catch (error) {
		console.error("=== ERROR in bulkDeleteBookingsService ===");
		console.error("Error message:", error instanceof Error ? error.message : error);
		console.error("=== END ERROR LOG ===");
		throw error;
	}
};