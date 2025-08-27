import { createFileRoute } from "@tanstack/react-router";
import { GuestQuoteBookingPage } from "@/features/guest/_pages/guest-quote-booking-page";
import { getOrCreateGuestSession } from "@/utils/auth";
import { z } from "zod";

const bookQuoteSearchSchema = z.object({
	quote: z.string().optional(),
	origin: z.string().optional(),
	destination: z.string().optional(),
	distance: z.string().optional(),
	duration: z.string().optional(),
	totalFare: z.string().optional(),
});

export const Route = createFileRoute("/_marketing/book-quote")({
	validateSearch: bookQuoteSearchSchema,
	beforeLoad: async () => {
		// Ensure guest session exists (creates anonymous if needed)
		const session = await getOrCreateGuestSession();
		return { session };
	},
	component: GuestQuoteBookingPage,
});