import { z } from "zod"

export const createServiceBookingSchema = (maxPassengers?: number, isHourlyService?: boolean) => z.object({
	// Booking details (customer info comes from authenticated user)
	passengerCount: z.number().int().min(1, "At least 1 passenger required").max(maxPassengers || (isHourlyService ? 15 : 8), maxPassengers ? `Maximum ${maxPassengers} passengers allowed` : isHourlyService ? "Maximum 15 passengers allowed" : "Maximum 8 passengers allowed"),
	luggageCount: z.number().int().min(0, "Luggage count cannot be negative").max(10, "Maximum 10 pieces of luggage allowed"),
	scheduledPickupTime: z.date({
		message: "Please select a pickup date and time",
	}).refine((date) => {
		const now = new Date();
		const hoursUntilPickup = (date.getTime() - now.getTime()) / (1000 * 60 * 60);
		return hoursUntilPickup >= 24;
	}, {
		message: "Package bookings require at least 24 hours advance notice",
	}),

	// Duration for hourly services
	serviceDuration: isHourlyService
		? z.number().min(1, "Minimum 1 hour required").max(24, "Maximum 24 hours allowed")
		: z.number().optional(),

	// Optional details
	specialRequirements: z.string().optional(),
})

export const serviceBookingSchema = createServiceBookingSchema()

export type ServiceBookingFormData = z.infer<typeof serviceBookingSchema>