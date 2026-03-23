import { z } from "zod";
import { createBookingStops } from "@/data/booking-stops/create-booking-stops";
import { createBooking } from "@/data/bookings/create-booking";
import { createOffloadBookingDetails } from "@/data/offload-booking-details/create-offload-booking-details";
import type { DB } from "@/db";
import type { InsertBooking } from "@/schemas/shared/tables/booking";
import { BookingStatusEnum, BookingTypeEnum } from "@/types";

// Schema for creating an offload booking - only fields that frontend should provide
export const CreateOffloadBookingServiceSchema = z.object({
	// Main booking fields (only what frontend provides)
	originAddress: z.string().min(1, "Origin address is required"),
	destinationAddress: z.string().min(1, "Destination address is required"),
	quotedAmount: z.number().positive("Quoted amount must be positive"),
	scheduledPickupTime: z.string().datetime().or(z.date()),
	customerName: z.string().min(1, "Customer name is required"),
	customerPhone: z.string().min(1, "Customer phone is required"),
	customerEmail: z.string().email().optional().or(z.literal("")),
	passengerCount: z.number().int().min(1).optional(),
	luggageCount: z.number().int().min(0).optional(),
	additionalNotes: z.string().optional().or(z.literal("")),

	// Offload booking specific fields (nested object)
	offloadDetails: z.object({
		offloaderName: z.string().min(1, "Offloader name is required"),
		jobType: z.string().min(1, "Job type is required"),
		vehicleType: z.string().min(1, "Vehicle type is required"),
	}),

	// Stops array (without bookingId - will be added by service)
	stops: z.array(
		z.object({
			stopOrder: z.number().int(),
			address: z.string().min(1, "Stop address is required"),
			latitude: z.number().nullable().optional(),
			longitude: z.number().nullable().optional(),
			notes: z.string().optional().or(z.literal("")),
			waitingTime: z.number().int().optional().default(0),
		}),
	),
});

export type CreateOffloadBookingParams = z.infer<
	typeof CreateOffloadBookingServiceSchema
>;

export async function createOffloadBookingService(
	db: DB,
	data: CreateOffloadBookingParams,
	adminUserId: string,
) {
	console.log("\n🔧 createOffloadBookingService - START");
	console.log("📥 Service received data:", JSON.stringify(data, null, 2));
	console.log("👤 Admin User ID:", adminUserId);

	// Create a booking record WITHOUT offload-specific data (those go in separate table)
	const bookingData = {
		// For offload bookings, we need to handle required fields properly
		userId: adminUserId, // Use the admin user who created the offload booking
		carId: null, // No specific car assigned for offload bookings
		packageId: null,
		bookingType: BookingTypeEnum.Offload,
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
		status: BookingStatusEnum.Confirmed, // Offload bookings start as confirmed
	} satisfies InsertBooking;

	console.log(
		"📝 Booking data prepared:",
		JSON.stringify(bookingData, null, 2),
	);

	// Create the booking first
	console.log("💾 Creating booking record...");
	const newBooking = await createBooking(db, bookingData);
	console.log("✅ Booking created with ID:", newBooking.id);

	// Create stops if provided
	if (data.stops && data.stops.length > 0) {
		console.log(`🚏 Creating ${data.stops.length} stops...`);
		const stopsData = data.stops.map((stop, index) => ({
			bookingId: newBooking.id,
			stopOrder: stop.stopOrder,
			address: stop.address,
			latitude: stop.latitude,
			longitude: stop.longitude,
			waitingTime: stop.waitingTime,
			notes: stop.notes,
		}));

		console.log("🚏 Stops data:", JSON.stringify(stopsData, null, 2));
		await createBookingStops(db, stopsData);
		console.log("✅ Stops created successfully");
	}

	console.log("📋 Creating offload booking details...");
	await createOffloadBookingDetails(db, {
		...data.offloadDetails,
		bookingId: newBooking.id,
	});
	console.log("✅ Offload booking details created");

	console.log("🎉 createOffloadBookingService - COMPLETE\n");
	return {
		...newBooking,
		offloadDetails: data.offloadDetails,
	};
}
