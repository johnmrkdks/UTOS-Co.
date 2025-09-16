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
	vehicleType: z
		.string()
		.min(1, "Vehicle type is required")
		.max(50, "Vehicle type must be less than 50 characters"),
	price: z
		.number()
		.positive("Price must be a positive number")
		.max(999999, "Price must be less than $999,999"),
	scheduledPickupTime: z
		.date({
			required_error: "Pickup date and time is required",
		}),
	notes: z
		.string()
		.max(500, "Notes must be less than 500 characters")
		.optional(),
});

export type OffloadBookingFormData = z.infer<typeof offloadBookingSchema>;