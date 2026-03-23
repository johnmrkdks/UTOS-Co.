import { z } from "zod";

export const offloadBookingSchema = z.object({
	offloaderName: z
		.string()
		.min(1, "Offloader name is required")
		.max(100, "Offloader name must be less than 100 characters"),
	jobType: z
		.string()
		.min(1, "Job type is required")
		.max(50, "Job type must be less than 50 characters"),
	pickupAddress: z
		.string()
		.min(1, "Pickup address is required")
		.max(255, "Pickup address must be less than 255 characters"),
	destinationAddress: z
		.string()
		.min(1, "Destination address is required")
		.max(255, "Destination address must be less than 255 characters"),
	stops: z.array(
		z.object({
			stopOrder: z.number(),
			address: z
				.string()
				.min(1, "Stop address is required")
				.max(255, "Stop address must be less than 255 characters"),
			latitude: z.number().nullable().optional(),
			longitude: z.number().nullable().optional(),
			waitingTime: z.number().int().min(0).optional(), // in minutes
			notes: z.string().max(200).optional(),
		}),
	),
	vehicleType: z
		.string()
		.min(1, "Vehicle type is required")
		.max(50, "Vehicle type must be less than 50 characters"),
	price: z
		.number()
		.positive("Price must be a positive number")
		.max(999999, "Price must be less than $999,999"),
	scheduledPickupTime: z.date({
		message: "Pickup date and time is required",
	}),
	// Customer information
	customerName: z
		.string()
		.min(1, "Customer name is required")
		.max(100, "Customer name must be less than 100 characters"),
	customerPhone: z
		.string()
		.min(1, "Customer phone is required")
		.regex(/^[+\-\s\d()]+$/, "Please enter a valid phone number"),
	customerEmail: z
		.string()
		.email("Please enter a valid email address")
		.optional()
		.or(z.literal("")),
	passengerCount: z
		.number()
		.int("Passenger count must be a whole number")
		.min(1, "At least 1 passenger required")
		.max(20, "Maximum 20 passengers allowed")
		.optional(),
	luggageCount: z
		.number()
		.int("Luggage count must be a whole number")
		.min(0, "Luggage count cannot be negative")
		.max(50, "Maximum 50 pieces of luggage allowed")
		.optional(),
	notes: z
		.string()
		.max(500, "Notes must be less than 500 characters")
		.optional(),
});

export type OffloadBookingFormData = z.infer<typeof offloadBookingSchema>;
