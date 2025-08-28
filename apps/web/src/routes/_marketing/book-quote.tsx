import { createFileRoute } from "@tanstack/react-router";
import { QuoteBookingPage } from "@/features/marketing/_pages/quote-booking/quote-booking-page";
import { getOrCreateGuestSession } from "@/utils/auth";
import { z } from "zod";

const bookQuoteSearchSchema = z.object({
	// New secure quote reference
	quoteId: z.string().optional(),
	
	// Legacy URL parameters (for backward compatibility, will be removed later)
	quote: z.string().optional(),
	origin: z.string().optional(),
	destination: z.string().optional(),
	distance: z.string().optional(),
	duration: z.string().optional(),
	totalFare: z.string().optional(),
	carId: z.string().optional(),
});

export const Route = createFileRoute("/_marketing/book-quote")({
	validateSearch: bookQuoteSearchSchema,
	beforeLoad: async () => {
		// Ensure guest session exists (creates anonymous if needed)
		const session = await getOrCreateGuestSession();
		return { session };
	},
	component: QuoteBookingPage,
});