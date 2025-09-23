import { z } from "zod"

export const createServiceBookingSchema = (maxPassengers?: number, isHourlyService?: boolean) => z.object({
	// Customer details
	customerName: z.string().min(2, "Name must be at least 2 characters"),
	customerPhone: z.string().min(10, "Please enter a valid phone number"),
	customerEmail: z.string().email("Please enter a valid email address"),

	// Booking details
	passengerCount: z.number().int().min(1, "At least 1 passenger required").max(maxPassengers || (isHourlyService ? 15 : 20), maxPassengers ? `Maximum ${maxPassengers} passengers allowed` : isHourlyService ? "Maximum 15 passengers allowed" : "Maximum 20 passengers allowed"),
	luggageCount: z.number().int().min(0, "Luggage count cannot be negative").max(10, "Maximum 10 pieces of luggage allowed"),
	scheduledPickupTime: z.date({
		message: "Please select a pickup date and time",
	}),

	// Separate fields for the DateTimePicker component
	bookingDate: z.date({
		message: "Please select a booking date",
	}),
	bookingTime: z.string().min(1, "Please select a pickup time"),

	// Duration for hourly services
	serviceDuration: isHourlyService
		? z.number().min(1, "Minimum 1 hour required").max(24, "Maximum 24 hours allowed")
		: z.number().optional(),

	// Optional details
	specialRequirements: z.string().optional(),
})

export const serviceBookingSchema = createServiceBookingSchema()

export type ServiceBookingFormData = z.infer<typeof serviceBookingSchema>