import { z } from "zod"

export const createServiceBookingSchema = (maxPassengers?: number) => z.object({
	// Customer details
	customerName: z.string().min(2, "Name must be at least 2 characters"),
	customerPhone: z.string().min(10, "Please enter a valid phone number"),
	customerEmail: z.string().email("Please enter a valid email address"),
	
	// Booking details
	passengerCount: z.number().int().min(1, "At least 1 passenger required").max(maxPassengers || 8, maxPassengers ? `Maximum ${maxPassengers} passengers allowed` : "Maximum 8 passengers allowed"),
	luggageCount: z.number().int().min(0, "Luggage count cannot be negative").max(10, "Maximum 10 pieces of luggage allowed"),
	scheduledPickupTime: z.date({
		required_error: "Please select a pickup date and time",
	}),
	
	// Optional details
	specialRequirements: z.string().optional(),
})

export const serviceBookingSchema = createServiceBookingSchema()

export type ServiceBookingFormData = z.infer<typeof serviceBookingSchema>