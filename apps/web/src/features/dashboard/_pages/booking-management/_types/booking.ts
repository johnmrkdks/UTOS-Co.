import { z } from "zod"

export const createCustomBookingSchema = z.object({
	carId: z.string().min(1, "Please select a car"),
	userId: z.string().min(1, "Please select a user").default("user-1"),
	originAddress: z.string().min(1, "Origin address is required"),
	originLatitude: z.number().optional(),
	originLongitude: z.number().optional(),
	destinationAddress: z.string().min(1, "Destination address is required"),
	destinationLatitude: z.number().optional(),
	destinationLongitude: z.number().optional(),
	scheduledPickupTime: z.date({
		required_error: "Pickup time is required",
	}),
	customerName: z.string().min(1, "Customer name is required"),
	customerPhone: z.string().min(1, "Customer phone is required"),
	customerEmail: z.string().email().optional().or(z.literal("")),
	passengerCount: z.number().int().min(1).max(8).default(1),
	specialRequests: z.string().optional(),
})

export type CreateCustomBookingForm = z.infer<typeof createCustomBookingSchema>

export interface QuoteResult {
	baseFare: number
	distanceFare: number
	timeFare: number
	extraCharges: number
	totalAmount: number
	estimatedDistance: number
	estimatedDuration: number
	breakdown: {
		baseRate: number
		perKmRate: number
		perMinuteRate: number
		minimumFare: number
		surgePricing?: number
	}
}

