import { z } from "zod"

export const createServiceBookingSchema = (maxPassengers?: number, isHourlyService?: boolean) => z.object({
	// Booking details (customer info comes from authenticated user)
	passengerCount: z.number().int().min(1, "At least 1 passenger required").max(maxPassengers || 8, maxPassengers ? `Maximum ${maxPassengers} passengers allowed` : "Maximum 8 passengers allowed"),
	luggageCount: z.number().int().min(0, "Luggage count cannot be negative").max(10, "Maximum 10 pieces of luggage allowed"),
	scheduledPickupTime: z.date({
		required_error: "Please select a pickup date and time",
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