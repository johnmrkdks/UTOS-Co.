import { createBookingStops } from "@/data/booking-stops/create-booking-stops";
import { createBooking } from "@/data/bookings/create-booking";
import type { DB } from "@/db";
import { BookingTypeEnum, BookingStatusEnum, BookingPaymentStatusEnum } from "@/db/sqlite/enums";
import type { InsertBooking } from "@/schemas/shared";
import { z } from "zod";

export const CreateCustomBookingSchema = z.object({
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
	scheduledPickupTime: z.string().datetime().transform((str) => new Date(str)),
	estimatedDuration: z.number().int().optional(), // in seconds

	// Distance and pricing estimates
	estimatedDistance: z.number().optional(), // in kilometers with decimal precision
	baseFare: z.number(),
	distanceFare: z.number(),
	timeFare: z.number().optional(),
	quotedAmount: z.number(),

	// Customer details
	customerName: z.string(),
	customerPhone: z.string(),
	customerEmail: z.string().email().optional(),
	passengerCount: z.number().int().min(1).default(1),
	luggageCount: z.number().int().min(0).default(0),
	specialRequests: z.string().optional(),

	// Stops for custom bookings
	stops: z.array(z.object({
		address: z.string(),
		latitude: z.number().optional(),
		longitude: z.number().optional(),
		stopOrder: z.number().int(),
		waitingTime: z.number().int().default(0),
		notes: z.string().optional(),
	})).optional(),
});

export type CreateCustomBookingParams = z.infer<typeof CreateCustomBookingSchema>;

/** Admin creates booking for client - userId optional: when absent use admin's (walk-in/phone client) */
export const AdminCreateCustomBookingSchema = CreateCustomBookingSchema.extend({
	userId: z.string().optional(),
	/** When true: set paymentStatus to pending_payment so client can pay via link; email sent separately */
	sendPaymentToClient: z.boolean().optional(),
});

export type AdminCreateCustomBookingParams = z.infer<typeof AdminCreateCustomBookingSchema>;

export async function createCustomBookingService(db: DB, data: CreateCustomBookingParams | AdminCreateCustomBookingParams) {
	// Validate minimum booking time (e.g., 1 hour in advance)
	const hoursUntilPickup = (data.scheduledPickupTime.getTime() - Date.now()) / (1000 * 60 * 60);
	if (hoursUntilPickup < 1) {
		throw new Error("Custom bookings require at least 1 hour advance notice");
	}

	// Prepare booking data
	const bookingData: InsertBooking = {
		bookingType: BookingTypeEnum.Custom,
		carId: data.carId,
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

		// Custom booking pricing breakdown
		quotedAmount: data.quotedAmount,
		baseFare: data.baseFare,
		distanceFare: data.distanceFare,
		timeFare: data.timeFare,

		customerName: data.customerName,
		customerPhone: data.customerPhone,
		customerEmail: data.customerEmail,
		passengerCount: data.passengerCount,
		luggageCount: data.luggageCount,
		specialRequests: data.specialRequests,

		status: BookingStatusEnum.Pending,
		// Admin flow: when sendPaymentToClient, require payment before confirmation
		...("sendPaymentToClient" in data && data.sendPaymentToClient ? { paymentStatus: BookingPaymentStatusEnum.PendingPayment } : {}),
	};

	const newBooking = await createBooking(db, bookingData);

	// Create stops if provided
	if (data.stops && data.stops.length > 0) {
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
	}

	return newBooking;
}
