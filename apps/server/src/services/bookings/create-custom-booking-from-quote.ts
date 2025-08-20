import { createBooking } from "@/data/bookings/create-booking";
import { createBookingStops } from "@/data/bookings/create-booking-stops";
import type { DB } from "@/db";
import { BookingTypeEnum, BookingStatusEnum } from "@/db/sqlite/enums";
import type { InsertBooking } from "@/schemas/shared";
import { selectAvailableCarService } from "@/services/cars/select-available-car";
import { z } from "zod";

export const CreateCustomBookingFromQuoteSchema = z.object({
	userId: z.string(),
	
	// Route information from quote
	originAddress: z.string(),
	originLatitude: z.number().optional(),
	originLongitude: z.number().optional(),
	destinationAddress: z.string(),
	destinationLatitude: z.number().optional(),
	destinationLongitude: z.number().optional(),
	
	// Stops from quote
	stops: z.array(z.object({
		address: z.string(),
		latitude: z.number().optional(),
		longitude: z.number().optional(),
	})).optional().default([]),
	
	// Timing
	scheduledPickupTime: z.date(),
	estimatedDuration: z.number().int().optional(), // in seconds
	estimatedDistance: z.number().int().optional(), // in meters
	
	// Pricing from quote
	baseFare: z.number().int(),
	distanceFare: z.number().int(),
	timeFare: z.number().int().optional(),
	extraCharges: z.number().int().default(0),
	quotedAmount: z.number().int(),
	
	// Customer details
	customerName: z.string(),
	customerPhone: z.string(),
	customerEmail: z.string().email().optional(),
	passengerCount: z.number().int().min(1).default(1),
	specialRequests: z.string().optional(),
	
	// Optional car preference
	preferredCategoryId: z.string().optional(),
});

export type CreateCustomBookingFromQuoteParams = z.infer<typeof CreateCustomBookingFromQuoteSchema>;

export async function createCustomBookingFromQuoteService(db: DB, data: CreateCustomBookingFromQuoteParams) {
	// Validate minimum booking time (1 hour in advance)
	const hoursUntilPickup = (data.scheduledPickupTime.getTime() - Date.now()) / (1000 * 60 * 60);
	if (hoursUntilPickup < 1) {
		throw new Error("Custom bookings require at least 1 hour advance notice");
	}
	
	// Auto-select an available car based on requirements
	const selectedCar = await selectAvailableCarService(db, {
		passengerCount: data.passengerCount,
		scheduledPickupTime: data.scheduledPickupTime,
		preferredCategoryId: data.preferredCategoryId,
	});
	
	if (!selectedCar) {
		throw new Error("No suitable cars available for the selected date and passenger count");
	}
	
	// Prepare booking data
	const bookingData: InsertBooking = {
		bookingType: BookingTypeEnum.Custom,
		carId: selectedCar.id,
		userId: data.userId,
		
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
		specialRequests: data.specialRequests,
		
		status: BookingStatusEnum.Pending,
	};
	
	// Create the booking
	const newBooking = await createBooking(db, bookingData);
	
	// Create stops if provided
	if (data.stops && data.stops.length > 0) {
		const stopsData = data.stops.map((stop, index) => ({
			bookingId: newBooking.id,
			stopOrder: index + 1, // Start from 1 for first stop
			address: stop.address,
			latitude: stop.latitude,
			longitude: stop.longitude,
			waitingTime: 10, // Default 10 minutes waiting time per stop
		}));
		
		await createBookingStops(db, stopsData);
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
		}
	};
}