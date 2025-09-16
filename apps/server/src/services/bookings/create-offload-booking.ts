import { createBooking } from "@/data/bookings/create-booking";
import type { DB } from "@/db";
import { z } from "zod";

export const CreateOffloadBookingServiceSchema = z.object({
	offloaderName: z.string().min(1, "Offloader name is required"),
	jobType: z.string().min(1, "Job type is required"),
	originAddress: z.string().min(1, "Pickup address is required"),
	destinationAddress: z.string().min(1, "Destination address is required"),
	vehicleType: z.string().min(1, "Vehicle type is required"),
	quotedAmount: z.number().positive("Price must be a positive number"),
	scheduledPickupTime: z.string(),
	notes: z.string().optional(),
	bookingType: z.literal("offload"),
});

export type CreateOffloadBookingParams = z.infer<typeof CreateOffloadBookingServiceSchema>;

export async function createOffloadBookingService(db: DB, data: CreateOffloadBookingParams, adminUserId: string) {
	// Create a booking record with offload-specific data
	const bookingData = {
		// For offload bookings, we need to handle required fields properly
		userId: adminUserId, // Use the admin user who created the offload booking
		carId: null, // No specific car assigned for offload bookings
		packageId: null,
		bookingType: "offload" as const,
		originAddress: data.originAddress,
		destinationAddress: data.destinationAddress,
		originLatitude: null,
		originLongitude: null,
		destinationLatitude: null,
		destinationLongitude: null,
		scheduledPickupTime: new Date(data.scheduledPickupTime),
		estimatedDuration: null,
		estimatedDistance: null,
		baseFare: 0, // No base fare for offload bookings
		distanceFare: 0, // No distance fare for offload bookings
		quotedAmount: data.quotedAmount,
		finalAmount: data.quotedAmount, // Same as quoted amount initially
		customerName: data.offloaderName,
		customerEmail: "", // Empty string instead of null
		customerPhone: "N/A", // Placeholder since it's required
		passengerCount: 1, // Default to 1
		specialRequests: data.notes || "",
		status: "confirmed" as const, // Offload bookings start as confirmed
	};

	const newBooking = await createBooking(db, bookingData as any);

	return {
		...newBooking,
		offloaderName: data.offloaderName,
		jobType: data.jobType,
		vehicleType: data.vehicleType,
	};
}