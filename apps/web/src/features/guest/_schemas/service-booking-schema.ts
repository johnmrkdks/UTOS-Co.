import { z } from "zod"

export const serviceBookingSchema = z.object({
	// Customer details
	customerName: z.string().min(2, "Name must be at least 2 characters"),
	customerPhone: z.string().min(10, "Please enter a valid phone number"),
	customerEmail: z.string().email("Please enter a valid email address"),
	
	// Booking details
	passengerCount: z.number().int().min(1, "At least 1 passenger required").max(8, "Maximum 8 passengers allowed"),
	bookingDate: z.date({
		message: "Please select a booking date",
	}),
	bookingTime: z.string().min(1, "Please select a pickup time"),
	
	// Optional details
	specialRequirements: z.string().optional(),
})

export type ServiceBookingFormData = z.infer<typeof serviceBookingSchema>