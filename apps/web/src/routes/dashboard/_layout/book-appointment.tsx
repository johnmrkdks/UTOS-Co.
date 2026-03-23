import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { UnifiedBookingPage } from "@/features/customer/_pages/unified-booking-page";

const bookingSearchSchema = z.object({
	// From instant quote flow
	from: z.enum(["instant-quote"]).optional(),
	token: z.string().optional(),
	// From direct car selection
	carId: z.string().optional(),
	// Restore quote after sign-up
	restore: z.string().optional(),
});

export const Route = createFileRoute("/dashboard/_layout/book-appointment")({
	validateSearch: bookingSearchSchema,
	component: UnifiedBookingPage,
});
