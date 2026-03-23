import { z } from "zod";
import { createBookingStops } from "@/data/booking-stops/create-booking-stops";
import { createBooking } from "@/data/bookings/create-booking";
import type { DB } from "@/db";
import {
	BookingPaymentStatusEnum,
	BookingStatusEnum,
	BookingTypeEnum,
} from "@/db/sqlite/enums";
import type { InsertBooking } from "@/schemas/shared";
import { selectAvailableCarService } from "@/services/cars/select-available-car";

export const CreateCustomBookingFromQuoteSchema = z.object({
	userId: z.string().optional(),
	isGuest: z.boolean().optional().default(false),

	// Route information from quote
	originAddress: z.string(),
	originLatitude: z.number().optional(),
	originLongitude: z.number().optional(),
	destinationAddress: z.string(),
	destinationLatitude: z.number().optional(),
	destinationLongitude: z.number().optional(),

	// Stops from quote
	stops: z
		.array(
			z.object({
				address: z.string(),
				latitude: z.number().optional(),
				longitude: z.number().optional(),
			}),
		)
		.optional()
		.default([]),

	// Timing
	scheduledPickupTime: z.string().transform((str) => new Date(str)),
	estimatedDuration: z.number().int().optional(), // in seconds
	estimatedDistance: z.number().optional(), // in kilometers with decimal precision

	// Pricing from quote (in dollars with decimal precision)
	baseFare: z.number(),
	distanceFare: z.number(),
	timeFare: z.number().optional(),
	extraCharges: z.number().default(0),
	quotedAmount: z.number(),

	// Customer details
	customerName: z.string(),
	customerPhone: z.string(),
	customerEmail: z.string().email().optional(),
	passengerCount: z.number().int().min(1).default(1),
	luggageCount: z.number().int().min(0).default(0),
	specialRequests: z.string().optional(),

	// Optional car preference (specific car ID from quote)
	preferredCarId: z.string().optional(),
	// Legacy field for backward compatibility
	preferredCategoryId: z.string().optional(),

	// Route preference: "toll" (use toll roads) or "no_toll" (avoid tolls)
	tollPreference: z.enum(["toll", "no_toll"]).optional().default("toll"),
});

export type CreateCustomBookingFromQuoteParams = z.infer<
	typeof CreateCustomBookingFromQuoteSchema
>;

export async function createCustomBookingFromQuoteService(
	db: DB,
	data: CreateCustomBookingFromQuoteParams,
) {
	const effectiveUserId = data.isGuest ? null : (data.userId ?? null);
	const isGuestBooking = !!data.isGuest;

	console.log("🔄 Starting createCustomBookingFromQuoteService with data:", {
		userId: effectiveUserId ?? "(guest - no user)",
		isGuestBooking,
		scheduledPickupTime: data.scheduledPickupTime,
		passengerCount: data.passengerCount,
		preferredCarId: data.preferredCarId,
		preferredCategoryId: data.preferredCategoryId,
	});

	// Validate minimum booking time (1 hour in advance)
	const hoursUntilPickup =
		(data.scheduledPickupTime.getTime() - Date.now()) / (1000 * 60 * 60);
	console.log("⏰ Time validation:", {
		scheduledTime: data.scheduledPickupTime.toISOString(),
		currentTime: new Date().toISOString(),
		hoursUntilPickup: hoursUntilPickup.toFixed(2),
	});

	// Temporarily disabled for testing - re-enable after debugging
	if (hoursUntilPickup < -24) {
		// Only block bookings more than 24 hours in the past
		throw new Error(
			`Custom bookings require at least 1 hour advance notice. Current time difference: ${hoursUntilPickup.toFixed(2)} hours`,
		);
	}

	// Auto-select an available car based on requirements
	console.log("🚗 Selecting available car...");
	const selectedCar = await selectAvailableCarService(db, {
		passengerCount: data.passengerCount,
		scheduledPickupTime: data.scheduledPickupTime,
		preferredCarId: data.preferredCarId, // Specific car from quote
		preferredCategoryId: data.preferredCategoryId, // Fallback to category
	});

	if (!selectedCar) {
		console.error("❌ No suitable cars available");
		throw new Error(
			"No suitable cars available for the selected date and passenger count",
		);
	}

	console.log("✅ Selected car:", {
		id: selectedCar.id,
		name: selectedCar.model?.name,
	});

	// Prepare booking data (userId is null for guest bookings - no user record)
	const bookingData: InsertBooking = {
		bookingType: isGuestBooking
			? BookingTypeEnum.Guest
			: BookingTypeEnum.Custom,
		carId: selectedCar.id,
		...(effectiveUserId != null
			? { userId: effectiveUserId }
			: { userId: null }),
		isGuestBooking,

		originAddress: data.originAddress,
		originLatitude: data.originLatitude,
		originLongitude: data.originLongitude,
		destinationAddress: data.destinationAddress,
		destinationLatitude: data.destinationLatitude,
		destinationLongitude: data.destinationLongitude,

		scheduledPickupTime: data.scheduledPickupTime,
		estimatedDuration: data.estimatedDuration,
		estimatedDistance: data.estimatedDistance,

		// Custom booking pricing breakdown from quote
		quotedAmount: data.quotedAmount,
		baseFare: data.baseFare,
		distanceFare: data.distanceFare,
		timeFare: data.timeFare,
		extraCharges: data.extraCharges,

		customerName: data.customerName,
		customerPhone: data.customerPhone,
		customerEmail: data.customerEmail,
		passengerCount: data.passengerCount,
		luggageCount: data.luggageCount,
		specialRequests: data.specialRequests,
		tollPreference: data.tollPreference || "toll",

		status: BookingStatusEnum.Pending,
		paymentStatus: BookingPaymentStatusEnum.PendingPayment,
	};

	// Create the booking
	console.log("💾 Creating booking with data:", bookingData);
	const newBooking = await createBooking(db, bookingData);
	console.log("✅ Booking created successfully:", newBooking.id);

	// Create stops if provided
	if (data.stops && data.stops.length > 0) {
		console.log("📍 Creating booking stops:", data.stops.length);
		const stopsData = data.stops.map((stop, index) => ({
			bookingId: newBooking.id,
			stopOrder: index + 1, // Start from 1 for first stop
			address: stop.address,
			latitude: stop.latitude,
			longitude: stop.longitude,
			waitingTime: 10, // Default 10 minutes waiting time per stop
		}));

		await createBookingStops(db, stopsData);
		console.log("✅ Stops created successfully");
	}

	// Return booking with selected car information
	return {
		...newBooking,
		selectedCar: {
			id: selectedCar.id,
			make: selectedCar.model?.brand?.name || "Unknown",
			model: selectedCar.model?.name || "Unknown",
			year: selectedCar.model?.year || 0,
			category: selectedCar.category?.name || "Standard",
			seatingCapacity: selectedCar.seatingCapacity,
		},
	};
}
