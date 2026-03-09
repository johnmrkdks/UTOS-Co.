import { z } from "zod";

export const instantQuoteSchema = z.object({
	originAddress: z.string().min(1, "Origin address is required"),
	destinationAddress: z.string().min(1, "Destination address is required"),
	tollPreference: z.enum(["toll", "no_toll"]).default("toll"),
	stops: z.array(z.object({
		id: z.string(),
		address: z.string().min(1, "Stop address is required"),
		duration: z.number().optional()
	})).default([]),
	originLatitude: z.number(),
	originLongitude: z.number(),
	destinationLatitude: z.number(),
	destinationLongitude: z.number(),
	stopsGeometry: z.array(z.any()).default([]),
	passengerCount: z.number().int().min(1, "At least 1 passenger required").max(8, "Maximum 8 passengers allowed").default(1),
	luggageCount: z.number().int().min(0, "Luggage count cannot be negative").max(10, "Maximum 10 pieces of luggage allowed").default(0)
});

export const createBookingDetailsSchema = (maxPassengers?: number) => z.object({
	customerName: z.string().min(2, "Name must be at least 2 characters"),
	customerPhone: z.string().min(10, "Please enter a valid phone number"),
	customerEmail: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
	tollPreference: z.enum(["toll", "no_toll"]).default("toll"),
	passengerCount: z.number().int().min(1, "At least 1 passenger required").max(maxPassengers || 8, maxPassengers ? `Maximum ${maxPassengers} passengers allowed` : "Maximum 8 passengers allowed"),
	luggageCount: z.number().int().min(0, "Luggage count cannot be negative").max(10, "Maximum 10 pieces of luggage allowed").default(0),
	scheduledPickupTime: z.date({
		message: "Please select a pickup date and time",
	}),
	specialRequests: z.string().optional(),
	selectedCarId: z.string().min(1, "Please select a car"),
});

export const bookingDetailsSchema = createBookingDetailsSchema();

export type InstantQuoteFormData = z.infer<typeof instantQuoteSchema>;
export type BookingDetailsFormData = z.infer<typeof bookingDetailsSchema>;