import { createFileRoute } from "@tanstack/react-router";
import { GuestServiceBookingPage } from "@/features/guest/_pages/guest-service-booking-page";
import { getOrCreateGuestSession } from "@/utils/auth";
import { z } from "zod";

const bookServiceSearchSchema = z.object({
	quote: z.string().optional(),
});

export const Route = createFileRoute("/_marketing/book-service/$serviceId")({
	validateSearch: bookServiceSearchSchema,
	beforeLoad: async () => {
		// Ensure guest session exists (creates anonymous if needed)
		const session = await getOrCreateGuestSession();
		return { session };
	},
	component: GuestServiceBookingPage,
});