import { z } from "zod"

export const carAppointmentSchema = z.object({
	// Route information
	originAddress: z.string().min(1, "Pickup location is required"),
	destinationAddress: z.string().min(1, "Destination is required"),

	// Customer details
	customerName: z.string().min(2, "Name must be at least 2 characters"),
	customerPhone: z.string().min(10, "Please enter a valid phone number"),
	customerEmail: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
	passengerCount: z.number().int().min(1, "At least 1 passenger required").max(8, "Maximum 8 passengers allowed"),

	// Timing
	scheduledPickupTime: z.date({
		message: "Please select a pickup date and time",
	}),

	// Service details
	specialRequests: z.string().optional(),
})

export type CarAppointmentForm = z.infer<typeof carAppointmentSchema>
export type BookingStep = "details" | "confirmation" | "processing" | "success"