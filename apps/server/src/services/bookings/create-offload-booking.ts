import { createBooking } from "@/data/bookings/create-booking";
import type { DB } from "@/db";
import { offloadBookingDetails } from "@/db/sqlite/schema";
import { z } from "zod";

export const CreateOffloadBookingServiceSchema = z.object({
	offloaderName: z.string().min(1, "Offloader name is required"),
	jobType: z.string().min(1, "Job type is required"),
	originAddress: z.string().min(1, "Pickup address is required"),
	destinationAddress: z.string().min(1, "Destination address is required"),
	vehicleType: z.string().min(1, "Vehicle type is required"),
	quotedAmount: z.number().positive("Price must be a positive number"),
	scheduledPickupTime: z.string(),
	customerName: z.string().min(1, "Customer name is required"),
	customerPhone: z.string().min(1, "Customer phone is required"),
	customerEmail: z.string().optional(),
	passengerCount: z.number().int().min(1).max(20).optional(),
	luggageCount: z.number().int().min(0).max(50).optional(),
	additionalNotes: z.string().optional(),
	bookingType: z.literal("offload"),
});

export type CreateOffloadBookingParams = z.infer<typeof CreateOffloadBookingServiceSchema>;

export async function createOffloadBookingService(db: DB, data: CreateOffloadBookingParams, adminUserId: string) {
	// Create a booking record WITHOUT offload-specific data (those go in separate table)
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
		customerName: data.customerName,
		customerEmail: data.customerEmail || "", // Use provided email or empty string
		customerPhone: data.customerPhone,
		passengerCount: data.passengerCount || 1,
		luggageCount: data.luggageCount || 0,
		additionalNotes: data.additionalNotes || "",
		status: "confirmed" as const, // Offload bookings start as confirmed
	};

	// Create the booking first
	const newBooking = await createBooking(db, bookingData as any);

	// Then create the offload details in the separate table
	await db.insert(offloadBookingDetails).values({
		bookingId: newBooking.id,
		offloaderName: data.offloaderName,
		jobType: data.jobType,
		vehicleType: data.vehicleType,
	});

	// Return booking with offload details
	return {
		...newBooking,
		offloadDetails: {
			offloaderName: data.offloaderName,
			jobType: data.jobType,
			vehicleType: data.vehicleType,
		},
	};
}