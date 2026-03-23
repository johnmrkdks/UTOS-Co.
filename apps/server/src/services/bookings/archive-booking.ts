import { z } from "zod";
import type { DB } from "@/db";
import { bookings } from "@/db/sqlite/schema";
import { eq } from "drizzle-orm";

export const ArchiveBookingServiceSchema = z.object({
	bookingId: z.string().min(1, "Booking ID is required"),
	isArchived: z.boolean().nullable(),
});

export type ArchiveBookingServiceInput = z.infer<typeof ArchiveBookingServiceSchema>;

export const archiveBookingService = async (
	db: DB,
	input: ArchiveBookingServiceInput,
) => {
	try {
		console.log("=== DEBUG: Starting archiveBookingService ===");
		console.log("Input data:", JSON.stringify(input, null, 2));

		// Check if booking exists
		console.log("DEBUG: Checking if booking exists with ID:", input.bookingId);
		const existingBooking = await db
			.select()
			.from(bookings)
			.where(eq(bookings.id, input.bookingId))
			.limit(1);

		console.log("DEBUG: Booking check result:", existingBooking.length);
		if (existingBooking.length === 0) {
			console.log("DEBUG: Booking not found, throwing error");
			throw new Error("Booking not found");
		}

		const currentBooking = existingBooking[0];
		console.log("DEBUG: Current booking data:", JSON.stringify({
			id: currentBooking.id,
			status: currentBooking.status,
			isArchived: currentBooking.isArchived,
		}, null, 2));

		// Update booking archive status
		console.log("DEBUG: Updating booking archive status to:", input.isArchived);
		const updatedBooking = await db
			.update(bookings)
			.set({
				isArchived: input.isArchived,
				updatedAt: new Date(),
			})
			.where(eq(bookings.id, input.bookingId))
			.returning();

		console.log("DEBUG: Booking archive status updated successfully");
		console.log("DEBUG: Updated booking:", JSON.stringify({
			id: updatedBooking[0].id,
			status: updatedBooking[0].status,
			isArchived: updatedBooking[0].isArchived,
		}, null, 2));

		console.log("=== DEBUG: archiveBookingService completed successfully ===");
		return {
			success: true,
			message: input.isArchived ? "Booking archived successfully." : "Booking unarchived successfully.",
			booking: updatedBooking[0],
		};
	} catch (error) {
		console.error("=== ERROR in archiveBookingService ===");
		console.error("Error type:", typeof error);
		console.error("Error name:", error instanceof Error ? error.name : "Unknown");
		console.error("Error message:", error instanceof Error ? error.message : error);
		console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
		console.error("Full error object:", error);
		console.error("=== END ERROR LOG ===");
		throw error;
	}
};