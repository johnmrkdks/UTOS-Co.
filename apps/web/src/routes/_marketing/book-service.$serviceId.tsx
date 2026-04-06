import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ServiceBookingPage } from "@/features/guest/_pages/service-booking-page";

const bookServiceSearchSchema = z.object({
	quote: z.string().optional(),
	origin: z.string().optional(),
	destination: z.string().optional(),
	originLat: z.string().optional(),
	originLng: z.string().optional(),
	destinationLat: z.string().optional(),
	destinationLng: z.string().optional(),
	pickupDate: z.string().optional(),
	pickupTime: z.string().optional(),
	stops: z.string().optional(),
	fromInstantQuote: z.string().optional(),
	/** Instant quote hourly: vehicle whose pricing-config hourly rate applies */
	carId: z.string().optional(),
});

export const Route = createFileRoute("/_marketing/book-service/$serviceId")({
	validateSearch: bookServiceSearchSchema,
	component: ServiceBookingPage,
});
