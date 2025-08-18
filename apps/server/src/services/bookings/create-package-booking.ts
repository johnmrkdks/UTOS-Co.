import { createBooking } from "@/data/bookings/create-booking";
import { getPackage } from "@/data/packages/get-package";
import type { DB } from "@/db";
import { BookingTypeEnum, BookingStatusEnum } from "@/db/sqlite/enums";
import type { InsertBooking } from "@/schemas/shared";
import { z } from "zod";

export const CreatePackageBookingSchema = z.object({
	packageId: z.string(),
	carId: z.string(),
	userId: z.string(),
	
	// Route information
	originAddress: z.string(),
	originLatitude: z.number().optional(),
	originLongitude: z.number().optional(),
	destinationAddress: z.string(),
	destinationLatitude: z.number().optional(),
	destinationLongitude: z.number().optional(),
	
	// Timing
	scheduledPickupTime: z.coerce.date(),
	
	// Customer details
	customerName: z.string(),
	customerPhone: z.string(),
	customerEmail: z.string().email().optional(),
	passengerCount: z.number().int().min(1).default(1),
	specialRequests: z.string().optional(),
	
	// Optional stops for package bookings
	stops: z.array(z.object({
		address: z.string(),
		latitude: z.number().optional(),
		longitude: z.number().optional(),
		stopOrder: z.number().int(),
		waitingTime: z.number().int().default(0),
		notes: z.string().optional(),
	})).optional(),
});

export type CreatePackageBookingParams = z.infer<typeof CreatePackageBookingSchema>;

export async function createPackageBookingService(db: DB, data: CreatePackageBookingParams) {
	// Validate package exists and is available
	const packageInfo = await getPackage(db, { id: data.packageId });
	if (!packageInfo) {
		throw new Error("Package not found");
	}
	
	if (!packageInfo.isAvailable) {
		throw new Error("Package is not available");
	}
	
	// Validate passenger count doesn't exceed package limit
	if (packageInfo.maxPassengers && data.passengerCount > packageInfo.maxPassengers) {
		throw new Error(`Package only supports ${packageInfo.maxPassengers} passengers`);
	}
	
	// Calculate advance booking time validation
	const hoursUntilPickup = (data.scheduledPickupTime.getTime() - Date.now()) / (1000 * 60 * 60);
	if (packageInfo.advanceBookingHours && hoursUntilPickup < packageInfo.advanceBookingHours) {
		throw new Error(`Package requires ${packageInfo.advanceBookingHours} hours advance booking`);
	}
	
	// Prepare booking data
	const bookingData: InsertBooking = {
		bookingType: BookingTypeEnum.Package,
		packageId: data.packageId,
		carId: data.carId,
		userId: data.userId,
		
		originAddress: data.originAddress,
		originLatitude: data.originLatitude,
		originLongitude: data.originLongitude,
		destinationAddress: data.destinationAddress,
		destinationLatitude: data.destinationLatitude,
		destinationLongitude: data.destinationLongitude,
		
		scheduledPickupTime: data.scheduledPickupTime,
		estimatedDuration: packageInfo.duration,
		
		// Use package fixed pricing
		quotedAmount: packageInfo.fixedPrice,
		finalAmount: packageInfo.fixedPrice, // For packages, price is fixed
		
		customerName: data.customerName,
		customerPhone: data.customerPhone,
		customerEmail: data.customerEmail,
		passengerCount: data.passengerCount,
		specialRequests: data.specialRequests,
		
		status: BookingStatusEnum.Pending,
	};
	
	const newBooking = await createBooking(db, bookingData);
	
	// Create stops if provided
	if (data.stops && data.stops.length > 0) {
		// Note: You'll need to implement createBookingStops function in the data layer
		// For now, this is a placeholder for the booking stops creation
		// await createBookingStops(db, newBooking.id, data.stops);
	}
	
	return newBooking;
}