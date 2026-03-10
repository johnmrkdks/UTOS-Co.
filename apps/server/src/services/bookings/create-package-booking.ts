import { createBookingStops } from "@/data/booking-stops/create-booking-stops";
import { createBooking } from "@/data/bookings/create-booking";
import { getPackage } from "@/data/packages/get-package";
import type { DB } from "@/db";
import { BookingTypeEnum, BookingStatusEnum } from "@/db/sqlite/enums";
import type { InsertBooking } from "@/schemas/shared";
import { z } from "zod";

export const CreatePackageBookingSchema = z.object({
	packageId: z.string(),
	carId: z.string().nullable(),
	userId: z.string().optional(), // Optional for guest bookings

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
	luggageCount: z.number().int().min(0).default(0),
	specialRequests: z.string().optional(),

	// Duration for hourly services
	serviceDuration: z.number().int().min(1).optional(),

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
	try {
		console.log("🔍 DEBUG createPackageBookingService - START");
		console.log("📦 Service data received:", JSON.stringify(data, null, 2));
		console.log("📅 scheduledPickupTime type:", typeof data.scheduledPickupTime, "value:", data.scheduledPickupTime);

		// Validate package exists and is available
		console.log("🔍 Looking up package:", data.packageId);
		const packageInfo = await getPackage(db, { id: data.packageId });
		console.log("📦 Package found:", packageInfo ? "Yes" : "No", packageInfo?.name);

		if (!packageInfo) {
			throw new Error("Package not found");
		}

		if (!packageInfo.isAvailable) {
			throw new Error("Package is not available");
		}

		// Validate passenger count doesn't exceed system limit (20 passengers max)
		if (data.passengerCount > 20) {
			throw new Error(`Maximum 20 passengers allowed per booking`);
		}

		// Fetch service type information for validation
		let serviceType = null;
		let isHourlyService = false;

		if (packageInfo.serviceTypeId) {
			try {
				const { getPackageServiceTypeService } = await import("@/services/package-service-types/get-package-service-type");
				serviceType = await getPackageServiceTypeService(db, { id: packageInfo.serviceTypeId });
				isHourlyService = serviceType?.rateType === "hourly";
			} catch (error) {
				console.warn("Could not fetch service type:", error);
			}
		}

		// Validate service duration for hourly services
		if (isHourlyService && !data.serviceDuration) {
			throw new Error("Service duration is required for hourly services");
		}

		// Note: Advance booking time validation removed per CEO requirements
		// Clients should be able to book anytime

		// Prepare booking data (guest bookings have null userId and isGuestBooking=true)
		const isGuest = !data.userId;
		console.log("📝 Preparing booking data...", isGuest ? "(guest booking)" : "");
		const bookingData: InsertBooking = {
			bookingType: BookingTypeEnum.Package,
			packageId: data.packageId,
			carId: data.carId,
			userId: data.userId ?? null,
			isGuestBooking: isGuest,

			originAddress: data.originAddress,
			originLatitude: data.originLatitude,
			originLongitude: data.originLongitude,
			destinationAddress: data.destinationAddress,
			destinationLatitude: data.destinationLatitude,
			destinationLongitude: data.destinationLongitude,

			scheduledPickupTime: data.scheduledPickupTime,

			// Store service duration in estimated duration for hourly services
			estimatedDuration: isHourlyService && data.serviceDuration
				? data.serviceDuration * 60 // Convert hours to minutes
				: packageInfo.duration,

			// Calculate pricing based on service type
			quotedAmount: isHourlyService && packageInfo.hourlyRate && data.serviceDuration
				? packageInfo.hourlyRate * data.serviceDuration
				: packageInfo.fixedPrice || 0,
			finalAmount: isHourlyService && packageInfo.hourlyRate && data.serviceDuration
				? packageInfo.hourlyRate * data.serviceDuration
				: packageInfo.fixedPrice || 0,

			customerName: data.customerName,
			customerPhone: data.customerPhone,
			customerEmail: data.customerEmail,
			passengerCount: data.passengerCount,
			luggageCount: data.luggageCount,
			specialRequests: data.specialRequests,

			status: BookingStatusEnum.Pending,
		};

		console.log("💾 Calling createBooking with:", JSON.stringify(bookingData, null, 2));
		const newBooking = await createBooking(db, bookingData);
		console.log("✅ Booking created successfully with ID:", newBooking.id);

		// Create stops if provided
		if (data.stops && data.stops.length > 0) {
			console.log("🛑 Creating stops:", data.stops.length);
			const stopsData = data.stops.map((stop, index) => ({
				bookingId: newBooking.id,
				stopOrder: stop.stopOrder,
				address: stop.address,
				latitude: stop.latitude,
				longitude: stop.longitude,
				waitingTime: stop.waitingTime,
				notes: stop.notes,
			}));

			await createBookingStops(db, stopsData);
			console.log("✅ Stops created successfully");
		}

		return newBooking;
	} catch (error) {
		console.error("💥 ERROR in createPackageBookingService:", error);
		console.error("📚 Service error stack:", error instanceof Error ? error.stack : 'No stack trace');
		throw error;
	}
}
